import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Clock, Bell } from 'lucide-react-native';
import { Colors, Spacing, Radius, Shadows } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { studentService } from '../../services/studentService';
import { notificationService } from '../../services/notificationService';
import {
  LessonScheduleItem,
  StudentProgressStats,
} from '../../types/student.types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { NextClassCard } from '../../components/common/NextClassCard';
import { LessonCard } from '../../components/common/LessonCard';
import { StatCard } from '../../components/common/StatCard';
import { ThriveCard } from '../../components/common/ThriveCard';
import { ThriveBadge } from '../../components/common/ThriveBadge';
import { ThriveRoleBadge } from '../../components/common/ThriveRoleBadge';
import { SkeletonCardList } from '../../components/common/ThriveSkeleton';
import { LanguagePickerModal } from '../../components/modals/LanguagePickerModal';
import { ClassDetailModal } from '../../components/modals/ClassDetailModal';
import { AnnouncementsModal } from '../../components/modals/AnnouncementsModal';

interface StudentHomeScreenProps {
  onNavigateTab: (tab: string) => void;
  onOpenNotifications: () => void;
}

export const StudentHomeScreen: React.FC<StudentHomeScreenProps> = ({
  onNavigateTab,
  onOpenNotifications,
}) => {
  const { session } = useAuth();
  const { t, language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [nextClass, setNextClass] = useState<LessonScheduleItem | null>(null);
  const [todaysClasses, setTodaysClasses] = useState<LessonScheduleItem[]>([]);
  const [progress, setProgress] = useState<StudentProgressStats | null>(null);

  const [selectedLesson, setSelectedLesson] = useState<LessonScheduleItem | null>(null);
  const [announcementsModalVisible, setAnnouncementsModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  const studentId = session?.studentId || session?.userId || '';
  const studentName = session?.profile?.first_name || 'Student';

  const loadData = useCallback(async () => {
    if (!studentId) return;
    try {
      const [nextClassData, todaysData, progressData, unread] = await Promise.all([
        studentService.getNextClass(studentId),
        studentService.getTodaysClasses(studentId),
        studentService.getStudentProgress(studentId),
        notificationService.getUnreadCount(studentId),
      ]);

      setNextClass(nextClassData);
      setTodaysClasses(todaysData);
      setProgress(progressData);
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading student home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      const g = t('greeting.morning');
      return g && g !== 'greeting.morning' ? g : (t('common.goodMorning') || 'Sabahınız xeyir');
    }
    if (hour < 18) {
      const g = t('greeting.afternoon');
      return g && g !== 'greeting.afternoon' ? g : (t('common.goodAfternoon') || 'Hər vaxtınız xeyir');
    }
    const g = t('greeting.evening');
    return g && g !== 'greeting.evening' ? g : (t('common.goodEvening') || 'Axşamınız xeyir');
  };

  const todayFormatted = new Date().toLocaleDateString(
    language === 'az' ? 'az-AZ' : language === 'ru' ? 'ru-RU' : 'en-US',
    {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }
  );

  // Parallax animations for Aliday Coffeeshop style hero
  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, 220],
    outputRange: [0, -60],
    extrapolate: 'clamp',
  });

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 160],
    outputRange: [1, 0.25],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Fixed Sticky Header */}
      <HeaderBar
        userName={`${getGreeting()}, ${studentName} 👋`}
        subtitle={todayFormatted}
        unreadCount={unreadCount}
        onNotificationsPress={onOpenNotifications}
        onLanguagePress={() => setLangModalVisible(true)}
      />

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {loading && !nextClass && !progress ? (
          <View style={styles.skeletonWrapper}>
            <SkeletonCardList count={3} />
          </View>
        ) : (
          <>
            {/* 1. TOP HERO SECTION (Recedes with Parallax beneath the sheet) */}
            <Animated.View
              style={[
                styles.topHeroSection,
                {
                  transform: [{ translateY: heroTranslateY }],
                  opacity: heroOpacity,
                },
              ]}
            >
              <ThriveRoleBadge role="student" variant="hero" />

              {/* Announcements Banner */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setAnnouncementsModalVisible(true)}
                style={styles.announcementBanner}
              >
                <View style={styles.announcementLeft}>
                  <View style={styles.announcementIconBox}>
                    <Bell size={16} color={Colors.warning} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.announcementBadgeRow}>
                      <ThriveBadge label={t('announcements.badge')} variant="warning" />
                      <Text style={styles.announcementHeader}>{t('announcements.centerNews')}</Text>
                    </View>
                    <Text style={styles.announcementTitle} numberOfLines={1}>
                      🚀 Thrive Mobile v1.0.0 — Rəsmi Buraxılış
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Next Class Hero Countdown */}
              <NextClassCard
                lesson={nextClass}
                onViewPress={() => nextClass && setSelectedLesson(nextClass)}
              />
            </Animated.View>

            {/* 2. ALIDAY COFFEESHOP STYLE ELEVATED CURVED OVERLAY SHEET */}
            <View style={styles.contentSheet}>
              {/* Sheet Grab Handle */}
              <View style={styles.sheetHandleBar} />

              {/* TODAY'S CLASSES */}
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <View style={styles.sectionDot} />
                  <Text style={styles.sectionTitle}>{t('student.todaysClasses')}</Text>
                </View>
                <Text style={styles.viewAllText} onPress={() => onNavigateTab('schedule')}>
                  {t('common.view')}
                </Text>
              </View>

              {todaysClasses.length === 0 ? (
                <ThriveCard style={styles.emptyCard}>
                  <Clock size={22} color={Colors.textMuted} />
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

              {/* ACADEMIC OVERVIEW STATS */}
              <View style={[styles.sectionHeader, { marginTop: Spacing.lg }]}>
                <View style={styles.sectionHeaderLeft}>
                  <View style={[styles.sectionDot, { backgroundColor: Colors.warning }]} />
                  <Text style={styles.sectionTitle}>{t('student.academicProgress')}</Text>
                </View>
                <Text style={styles.viewAllText} onPress={() => onNavigateTab('learning')}>
                  {t('common.view')}
                </Text>
              </View>

              <View style={styles.statsGrid}>
                <StatCard
                  title={t('student.attendanceRate')}
                  value={`${progress?.attendanceRate ?? 100}%`}
                  subtitle={`${progress?.presentCount ?? 0} ${t('teacher.present')}`}
                  circularProgress={progress?.attendanceRate ?? 100}
                  accentColor={Colors.success}
                />
                <StatCard
                  title={t('student.pendingAssignments')}
                  value={progress?.pendingAssignmentsCount ?? 0}
                  icon={<Clock size={20} color={Colors.warning} />}
                  accentColor={Colors.warning}
                />
              </View>
            </View>
          </>
        )}
      </Animated.ScrollView>

      {/* MODALS */}
      <ClassDetailModal
        visible={!!selectedLesson}
        lesson={selectedLesson}
        onClose={() => setSelectedLesson(null)}
      />

      <AnnouncementsModal
        visible={announcementsModalVisible}
        onClose={() => setAnnouncementsModalVisible(false)}
      />

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
    paddingBottom: Spacing.xxl + 20,
  },
  skeletonWrapper: {
    padding: Spacing.md,
  },
  topHeroSection: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  announcementBanner: {
    backgroundColor: '#0F2A4A',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    ...Shadows.sm,
  },
  announcementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  announcementIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  announcementBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  announcementHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.warning,
    textTransform: 'uppercase',
  },
  announcementTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  // Aliday Coffeeshop Style Elevated Curved Sheet
  contentSheet: {
    backgroundColor: '#0D1E36',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl + 20,
    marginTop: Spacing.xs,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    minHeight: 480,
  },
  sheetHandleBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  emptyCard: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
});
