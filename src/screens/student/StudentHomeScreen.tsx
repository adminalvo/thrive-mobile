import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Calendar, Award, CreditCard, Clock, CheckCircle } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { studentService } from '../../services/studentService';
import { notificationService } from '../../services/notificationService';
import {
  LessonScheduleItem,
  StudentProgressStats,
  StudentPaymentSummary,
} from '../../types/student.types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { NextClassCard } from '../../components/common/NextClassCard';
import { LessonCard } from '../../components/common/LessonCard';
import { StatCard } from '../../components/common/StatCard';
import { ThriveCard } from '../../components/common/ThriveCard';
import { SkeletonCardList } from '../../components/common/ThriveSkeleton';
import { LanguagePickerModal } from '../../components/modals/LanguagePickerModal';
import { ClassDetailModal } from '../../components/modals/ClassDetailModal';

interface StudentHomeScreenProps {
  onNavigateTab: (tab: string) => void;
  onOpenNotifications: () => void;
}

export const StudentHomeScreen: React.FC<StudentHomeScreenProps> = ({
  onNavigateTab,
  onOpenNotifications,
}) => {
  const { session } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextClass, setNextClass] = useState<LessonScheduleItem | null>(null);
  const [todaysClasses, setTodaysClasses] = useState<LessonScheduleItem[]>([]);
  const [progress, setProgress] = useState<StudentProgressStats | null>(null);
  const [paymentSummary, setPaymentSummary] = useState<StudentPaymentSummary | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [selectedLesson, setSelectedLesson] = useState<LessonScheduleItem | null>(null);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const studentId = session?.studentId;
  const studentName = session?.profile.first_name || 'Tələbə';

  useEffect(() => {
    if (studentId) {
      loadData();
    }
  }, [studentId]);

  const loadData = async () => {
    if (!studentId) return;
    try {
      const [next, todays, prog, payments, unread] = await Promise.all([
        studentService.getNextClass(studentId),
        studentService.getTodaysClasses(studentId),
        studentService.getStudentProgress(studentId),
        studentService.getStudentPaymentSummary(studentId),
        session?.userId ? notificationService.getUnreadCount(session.userId) : Promise.resolve(0),
      ]);

      setNextClass(next);
      setTodaysClasses(todays);
      setProgress(prog);
      setPaymentSummary(payments);
      setUnreadCount(unread);
    } catch (e) {
      console.error('Error loading student home data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('common.goodMorning');
    if (hour < 18) return t('common.goodAfternoon');
    return t('common.goodEvening');
  };

  const todayFormatted = new Date().toLocaleDateString('az-AZ', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <HeaderBar
        userName={`${getGreeting()}, ${studentName} 👋`}
        subtitle={todayFormatted}
        unreadCount={unreadCount}
        onNotificationsPress={onOpenNotifications}
        onLanguagePress={() => setLangModalVisible(true)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {loading ? (
          <SkeletonCardList count={3} />
        ) : (
          <>
            {/* NEXT CLASS HERO */}
            <NextClassCard
              lesson={nextClass}
              onViewPress={() => nextClass && setSelectedLesson(nextClass)}
            />

            {/* TODAY'S CLASSES */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('student.todaysSchedule')}</Text>
              <Text style={styles.viewAllText} onPress={() => onNavigateTab('schedule')}>
                {t('common.view')}
              </Text>
            </View>

            {todaysClasses.length === 0 ? (
              <ThriveCard style={styles.emptyCard}>
                <Calendar size={24} color={Colors.textMuted} />
                <Text style={styles.emptyText}>{t('student.noClassesToday')}</Text>
              </ThriveCard>
            ) : (
              todaysClasses.map((item) => (
                <LessonCard
                  key={item.id}
                  lesson={item}
                  onPress={() => setSelectedLesson(item)}
                />
              ))
            )}

            {/* YOUR PROGRESS */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('student.yourProgress')}</Text>
              <Text style={styles.viewAllText} onPress={() => onNavigateTab('learning')}>
                {t('common.view')}
              </Text>
            </View>

            <View style={styles.statsRow}>
              <StatCard
                title={t('student.attendanceRate')}
                value={`${progress?.attendanceRate || 100}%`}
                subtitle={`${progress?.presentCount || 0} iştirak, ${progress?.lateCount || 0} gecikmə`}
                accentColor={Colors.success}
                icon={<CheckCircle size={18} color={Colors.success} />}
              />
              <StatCard
                title={t('student.pendingAssignments')}
                value={progress?.pendingAssignmentsCount || 0}
                subtitle="Təhvil gözləyir"
                accentColor={Colors.warning}
                icon={<Clock size={18} color={Colors.warning} />}
              />
            </View>

            {/* PAYMENT SUMMARY */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('student.paymentSummary')}</Text>
              <Text style={styles.viewAllText} onPress={() => onNavigateTab('payments')}>
                {t('common.view')}
              </Text>
            </View>

            <ThriveCard style={styles.paymentCard}>
              <View style={styles.paymentRow}>
                <View>
                  <Text style={styles.paymentLabel}>
                    {paymentSummary && paymentSummary.remainingDebt > 0
                      ? t('student.amountDue')
                      : t('student.upToDate')}
                  </Text>
                  <Text style={styles.paymentAmount}>
                    {paymentSummary && paymentSummary.remainingDebt > 0
                      ? `${paymentSummary.remainingDebt} ₼`
                      : '0.00 ₼'}
                  </Text>
                  {paymentSummary?.nextDueDate && (
                    <Text style={styles.paymentDate}>Son ödəniş: {paymentSummary.nextDueDate}</Text>
                  )}
                </View>
                <View style={styles.paymentIconBox}>
                  <CreditCard size={24} color={Colors.primary} />
                </View>
              </View>
            </ThriveCard>
          </>
        )}
      </ScrollView>

      {/* Class Detail Modal */}
      <ClassDetailModal
        visible={!!selectedLesson}
        lesson={selectedLesson}
        onClose={() => setSelectedLesson(null)}
      />

      {/* Language Picker */}
      <LanguagePickerModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  viewAllText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyCard: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  paymentCard: {
    backgroundColor: '#0F2744',
    borderColor: 'rgba(76, 162, 181, 0.3)',
    padding: Spacing.md,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  paymentAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  paymentDate: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  paymentIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(76, 162, 181, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
