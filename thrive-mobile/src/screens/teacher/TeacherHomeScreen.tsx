import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Animated,
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
  Bell,
} from 'lucide-react-native';
import { Colors, Spacing, Radius, Shadows } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { teacherService } from '../../services/teacherService';
import { notificationService } from '../../services/notificationService';
import { TeacherGroupItem } from '../../types/teacher.types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { ThriveCard } from '../../components/common/ThriveCard';
import { ThriveBadge } from '../../components/common/ThriveBadge';
import { ThriveRoleBadge } from '../../components/common/ThriveRoleBadge';
import { ThriveButton } from '../../components/common/ThriveButton';
import { StatCard } from '../../components/common/StatCard';
import { SkeletonCardList } from '../../components/common/ThriveSkeleton';
import { AttendanceModal } from '../../components/modals/AttendanceModal';
import { CreateAssignmentModal } from '../../components/modals/CreateAssignmentModal';
import { LanguagePickerModal } from '../../components/modals/LanguagePickerModal';
import { AnnouncementsModal } from '../../components/modals/AnnouncementsModal';

interface TeacherHomeScreenProps {
  onNavigateTab: (tab: string) => void;
  onOpenNotifications: () => void;
}

export const TeacherHomeScreen: React.FC<TeacherHomeScreenProps> = ({
  onNavigateTab,
  onOpenNotifications,
}) => {
  const { session } = useAuth();
  const { t, language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [groups, setGroups] = useState<TeacherGroupItem[]>([]);
  const [todaysClasses, setTodaysClasses] = useState<any[]>([]);
  const [submissionsCount, setSubmissionsCount] = useState<number>(0);

  // Modals state
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [attendanceGroupId, setAttendanceGroupId] = useState('');
  const [attendanceGroupName, setAttendanceGroupName] = useState('');

  const [createAssModalVisible, setCreateAssModalVisible] = useState(false);
  const [announcementsModalVisible, setAnnouncementsModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  const teacherId = session?.teacherId || session?.userId || '';
  const teacherName = session?.profile?.first_name || 'Teacher';

  const loadData = useCallback(async () => {
    if (!teacherId) return;
    try {
      const [homeData, unread] = await Promise.all([
        teacherService.getTeacherHomeData(teacherId),
        notificationService.getUnreadCount(teacherId),
      ]);

      setGroups(homeData.groups);
      setTodaysClasses(homeData.todaysClasses);
      setUnreadCount(unread);
      setSubmissionsCount(homeData.pendingSubmissionsCount);
    } catch (error) {
      console.error('Error loading teacher home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [teacherId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const openAttendanceForGroup = (groupId: string, groupName: string) => {
    setAttendanceGroupId(groupId);
    setAttendanceGroupName(groupName);
    setAttendanceModalVisible(true);
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
      <HeaderBar
        userName={`${getGreeting()}, ${teacherName} 👋`}
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
        {loading && groups.length === 0 ? (
          <View style={styles.skeletonWrapper}>
            <SkeletonCardList count={3} />
          </View>
        ) : (
          <>
            {/* 1. TOP HERO SECTION */}
            <Animated.View
              style={[
                styles.topHeroSection,
                {
                  transform: [{ translateY: heroTranslateY }],
                  opacity: heroOpacity,
                },
              ]}
            >
              <ThriveRoleBadge role="teacher" variant="hero" />

              {/* Center Announcements */}
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
                    <UserCheck size={20} color={Colors.success} />
                  </View>
                  <Text style={styles.quickActionTitle}>{t('teacher.takeAttendance')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setCreateAssModalVisible(true)}
                  style={styles.quickActionCard}
                >
                  <View style={[styles.quickIconCircle, { backgroundColor: 'rgba(76, 162, 181, 0.15)' }]}>
                    <PlusCircle size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.quickActionTitle}>{t('teacher.newAssignment')}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* 2. ALIDAY COFFEESHOP STYLE ELEVATED CURVED OVERLAY SHEET */}
            <View style={styles.contentSheet}>
              {/* Sheet Grab Handle */}
              <View style={styles.sheetHandleBar} />

              {/* Overview Stats */}
              <View style={styles.statsGrid}>
                <StatCard
                  title={t('teacher.myGroups')}
                  value={groups.length}
                  icon={<Users size={20} color={Colors.primary} />}
                  accentColor={Colors.primary}
                />
                <StatCard
                  title={t('teacher.pendingGrading')}
                  value={submissionsCount}
                  icon={<FileCheck size={20} color={Colors.warning} />}
                  accentColor={Colors.warning}
                />
              </View>

              {/* Today's Teaching Schedule */}
              <View style={[styles.sectionHeader, { marginTop: Spacing.md }]}>
                <View style={styles.sectionHeaderLeft}>
                  <View style={styles.sectionDot} />
                  <Text style={styles.sectionTitle}>{t('teacher.todaysClasses')}</Text>
                </View>
                <Text style={styles.viewAllText} onPress={() => onNavigateTab('schedule')}>
                  {t('common.view')}
                </Text>
              </View>

              {todaysClasses.length === 0 ? (
                <ThriveCard style={styles.emptyCard}>
                  <Clock size={22} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>{t('teacher.noClassesToday')}</Text>
                </ThriveCard>
              ) : (
                todaysClasses.map((item, index) => (
                  <ThriveCard key={index} style={styles.lessonCard}>
                    <View style={styles.lessonHeader}>
                      <ThriveBadge label={item.programName || t('common.generalProgram')} variant="primary" />
                      <View style={styles.timeBadge}>
                        <Clock size={12} color={Colors.textSecondary} />
                        <Text style={styles.timeText}>
                          {item.startTime} – {item.endTime}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.groupTitle}>{item.groupName}</Text>

                    <View style={styles.lessonFooter}>
                      <View style={styles.roomInfo}>
                        <MapPin size={14} color={Colors.textMuted} />
                        <Text style={styles.roomText}>{item.room || t('common.notSpecified')}</Text>
                      </View>

                      <ThriveButton
                        title={t('teacher.takeAttendanceBtn')}
                        size="sm"
                        variant="outline"
                        onPress={() => openAttendanceForGroup(item.groupId, item.groupName)}
                      />
                    </View>
                  </ThriveCard>
                ))
              )}

              {/* My Teaching Groups */}
              <View style={[styles.sectionHeader, { marginTop: Spacing.lg }]}>
                <View style={styles.sectionHeaderLeft}>
                  <View style={[styles.sectionDot, { backgroundColor: Colors.warning }]} />
                  <Text style={styles.sectionTitle}>{t('teacher.assignedGroups')}</Text>
                </View>
                <Text style={styles.viewAllText} onPress={() => onNavigateTab('groups')}>
                  {t('common.view')}
                </Text>
              </View>

              {groups.length === 0 ? (
                <ThriveCard style={styles.emptyCard}>
                  <Users size={22} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>{t('teacher.noGroups')}</Text>
                </ThriveCard>
              ) : (
                groups.map((group) => (
                  <ThriveCard key={group.id} style={styles.groupCard}>
                    <View style={styles.groupCardContent}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.groupNameText}>{group.name}</Text>
                        <Text style={styles.groupProgramText}>{group.programName}</Text>
                        <Text style={styles.groupRoomText}>
                          {t('teacher.roomLabel', { room: group.room || t('common.notSpecified') })} • {t('teacher.studentsCount', { count: group.studentCount })}
                        </Text>
                      </View>

                      <ThriveButton
                        title={t('teacher.recordAttendanceBtn')}
                        size="sm"
                        variant="secondary"
                        onPress={() => openAttendanceForGroup(group.id, group.name)}
                      />
                    </View>
                  </ThriveCard>
                ))
              )}
            </View>
          </>
        )}
      </Animated.ScrollView>

      {/* MODALS */}
      <AttendanceModal
        visible={attendanceModalVisible}
        groupId={attendanceGroupId}
        groupName={attendanceGroupName}
        onClose={() => {
          setAttendanceModalVisible(false);
          loadData();
        }}
      />

      <CreateAssignmentModal
        visible={createAssModalVisible}
        onClose={() => setCreateAssModalVisible(false)}
        onSuccess={loadData}
        groups={groups}
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
  quickActionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  quickIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
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
    marginTop: Spacing.sm,
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
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
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
  emptyCard: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  lessonCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.cardElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  lessonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roomText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  groupCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  groupCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  groupProgramText: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
  },
  groupRoomText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
