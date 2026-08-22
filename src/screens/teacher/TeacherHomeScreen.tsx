import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Clock,
  MapPin,
  Users,
  UserCheck,
  PlusCircle,
  FileCheck,
  Award,
  ChevronRight,
} from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { teacherService } from '../../services/teacherService';
import { notificationService } from '../../services/notificationService';
import { TeacherGroupItem } from '../../types/teacher.types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { ThriveCard } from '../../components/common/ThriveCard';
import { ThriveBadge } from '../../components/common/ThriveBadge';
import { ThriveButton } from '../../components/common/ThriveButton';
import { StatCard } from '../../components/common/StatCard';
import { SkeletonCardList } from '../../components/common/ThriveSkeleton';
import { AttendanceModal } from '../../components/modals/AttendanceModal';
import { CreateAssignmentModal } from '../../components/modals/CreateAssignmentModal';
import { LanguagePickerModal } from '../../components/modals/LanguagePickerModal';

interface TeacherHomeScreenProps {
  onNavigateTab: (tab: string) => void;
  onOpenNotifications: () => void;
}

export const TeacherHomeScreen: React.FC<TeacherHomeScreenProps> = ({
  onNavigateTab,
  onOpenNotifications,
}) => {
  const { session } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todaysClasses, setTodaysClasses] = useState<any[]>([]);
  const [groups, setGroups] = useState<TeacherGroupItem[]>([]);
  const [submissionsCount, setSubmissionsCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  // Modals
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [attendanceGroupId, setAttendanceGroupId] = useState('');
  const [attendanceGroupName, setAttendanceGroupName] = useState('');
  const [createAssModalVisible, setCreateAssModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const teacherId = session?.teacherId;
  const teacherName = session?.profile.first_name || 'Müəllim';

  const loadData = useCallback(async (isRefresh = false) => {
    if (!teacherId) return;
    try {
      const [homeData, unread] = await Promise.all([
        teacherService.getTeacherHomeData(teacherId, isRefresh),
        session?.userId ? notificationService.getUnreadCount(session.userId) : Promise.resolve(0),
      ]);

      setTodaysClasses(homeData.todaysClasses);
      setGroups(homeData.groups);
      setSubmissionsCount(homeData.pendingSubmissionsCount);
      setUnreadCount(unread);
    } catch (e) {
      console.error('Error loading teacher data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [teacherId, session?.userId]);

  useEffect(() => {
    if (teacherId) {
      loadData();
    }
  }, [teacherId, loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const openAttendanceForGroup = (groupId: string, groupName: string) => {
    setAttendanceGroupId(groupId);
    setAttendanceGroupName(groupName);
    setAttendanceModalVisible(true);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('common.goodMorning');
    if (hour < 18) return t('common.goodAfternoon');
    return t('common.goodEvening');
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        userName={`${getGreeting()}, ${teacherName} 👋`}
        subtitle="Müəllim Portalı"
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
        {loading && groups.length === 0 ? (
          <SkeletonCardList count={3} />
        ) : (
          <>
            {/* Quick Action Buttons Grid */}
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  if (groups.length > 0) {
                    openAttendanceForGroup(groups[0].id, groups[0].name);
                  }
                }}
                style={styles.quickActionCard}
              >
                <View style={[styles.quickIconCircle, { backgroundColor: Colors.successLight }]}>
                  <UserCheck size={22} color={Colors.success} />
                </View>
                <Text style={styles.quickActionTitle}>{t('teacher.takeAttendance')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setCreateAssModalVisible(true)}
                style={styles.quickActionCard}
              >
                <View style={[styles.quickIconCircle, { backgroundColor: 'rgba(76, 162, 181, 0.15)' }]}>
                  <PlusCircle size={22} color={Colors.primary} />
                </View>
                <Text style={styles.quickActionTitle}>{t('teacher.createAssignment')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => onNavigateTab('assignments')}
                style={styles.quickActionCard}
              >
                <View style={[styles.quickIconCircle, { backgroundColor: Colors.warningLight }]}>
                  <FileCheck size={22} color={Colors.warning} />
                </View>
                <Text style={styles.quickActionTitle}>{t('teacher.submissions')}</Text>
              </TouchableOpacity>
            </View>

            {/* TODAY'S CLASSES */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('teacher.todaysClasses')}</Text>
              <Text style={styles.viewAllText} onPress={() => onNavigateTab('schedule')}>
                {t('common.view')}
              </Text>
            </View>

            {todaysClasses.length === 0 ? (
              <ThriveCard style={styles.emptyCard}>
                <Clock size={24} color={Colors.textMuted} />
                <Text style={styles.emptyText}>Bu gün üçün tədris dərsiniz yoxdur.</Text>
              </ThriveCard>
            ) : (
              todaysClasses.map((item, idx) => (
                <ThriveCard key={idx} style={styles.classCard}>
                  <View style={styles.classHeader}>
                    <ThriveBadge label={item.programName} variant="primary" />
                    <Text style={styles.classTime}>{item.startTime} – {item.endTime}</Text>
                  </View>

                  <Text style={styles.classTitle}>{item.groupName}</Text>

                  <View style={styles.classMeta}>
                    <View style={styles.metaItem}>
                      <MapPin size={14} color={Colors.textMuted} />
                      <Text style={styles.metaText}>Otaq: {item.room}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Users size={14} color={Colors.textMuted} />
                      <Text style={styles.metaText}>{item.studentCount} Tələbə</Text>
                    </View>
                  </View>

                  <ThriveButton
                    title="Davamiyyət yaz"
                    size="sm"
                    variant="outline"
                    onPress={() => openAttendanceForGroup(item.groupId, item.groupName)}
                    icon={<UserCheck size={14} color={Colors.primary} />}
                    style={{ marginTop: Spacing.md }}
                  />
                </ThriveCard>
              ))
            )}

            {/* PENDING WORK STATS */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Gözləyən İşlər</Text>
            </View>

            <View style={styles.statsRow}>
              <StatCard
                title={t('teacher.pendingGrading')}
                value={submissionsCount}
                subtitle="Yoxlanış gözləyir"
                accentColor={Colors.warning}
                icon={<FileCheck size={18} color={Colors.warning} />}
              />
              <StatCard
                title={t('teacher.assignedGroups')}
                value={groups.length}
                subtitle="Aktiv qruplar"
                accentColor={Colors.primary}
                icon={<Users size={18} color={Colors.primary} />}
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Attendance Sheet Modal */}
      <AttendanceModal
        visible={attendanceModalVisible}
        groupId={attendanceGroupId}
        groupName={attendanceGroupName}
        onClose={() => setAttendanceModalVisible(false)}
        onSuccess={() => loadData(true)}
      />

      {/* Create Assignment Modal */}
      <CreateAssignmentModal
        visible={createAssModalVisible}
        groups={groups}
        onClose={() => setCreateAssModalVisible(false)}
        onSuccess={() => loadData(true)}
      />

      {/* Language Picker Modal */}
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
  quickActionsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  quickActionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs + 2,
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
  classCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm + 4,
    backgroundColor: '#0F2744',
    borderColor: 'rgba(76, 162, 181, 0.4)',
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  classTime: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  classTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  classMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
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
});
