import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Calendar, Clock, Bell } from 'lucide-react-native';
import { Colors, Spacing, Radius, Shadows } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { parentService } from '../../services/parentService';
import { notificationService } from '../../services/notificationService';
import { ChildOverview } from '../../types/parent.types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { ChildSelectorCarousel } from '../../components/common/ChildSelectorCarousel';
import { ThriveCard } from '../../components/common/ThriveCard';
import { ThriveBadge } from '../../components/common/ThriveBadge';
import { ThriveRoleBadge } from '../../components/common/ThriveRoleBadge';
import { StatCard } from '../../components/common/StatCard';
import { SkeletonCardList } from '../../components/common/ThriveSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { LanguagePickerModal } from '../../components/modals/LanguagePickerModal';
import { AnnouncementsModal } from '../../components/modals/AnnouncementsModal';

interface ParentHomeScreenProps {
  onNavigateTab: (tab: string) => void;
  onOpenNotifications: () => void;
}

export const ParentHomeScreen: React.FC<ParentHomeScreenProps> = ({
  onNavigateTab,
  onOpenNotifications,
}) => {
  const { session } = useAuth();
  const { t, language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [childrenList, setChildrenList] = useState<ChildOverview[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  const [announcementsModalVisible, setAnnouncementsModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  const parentId = session?.parentId || session?.userId || '';
  const parentName = session?.profile?.first_name || 'Parent';

  const loadData = useCallback(async () => {
    if (!parentId) return;
    try {
      const [kids, unread] = await Promise.all([
        parentService.getChildren(parentId),
        notificationService.getUnreadCount(parentId),
      ]);

      setChildrenList(kids);
      setUnreadCount(unread);

      if (kids.length > 0 && !activeChildId) {
        setActiveChildId(kids[0].studentId);
      }
    } catch (error) {
      console.error('Error loading parent home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [parentId, activeChildId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const activeChild = childrenList.find((c) => c.studentId === activeChildId) || childrenList[0];

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
        userName={`${getGreeting()}, ${parentName} 👋`}
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
        {loading && childrenList.length === 0 ? (
          <View style={styles.skeletonWrapper}>
            <SkeletonCardList count={3} />
          </View>
        ) : childrenList.length === 0 ? (
          <EmptyState
            title={t('common.empty')}
            description={t('parent.noChildrenLinked')}
          />
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
              <ThriveRoleBadge role="parent" variant="hero" />

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

              {/* Child Selector Carousel */}
              <View style={styles.carouselSectionHeader}>
                <Text style={styles.sectionTitle}>{t('parent.childrenTitle')}</Text>
                <Text style={styles.childCountText}>
                  {childrenList.length} {t('common.student')}
                </Text>
              </View>

              <ChildSelectorCarousel
                childrenList={childrenList}
                selectedChildId={activeChild?.studentId || null}
                onSelectChild={(childId) => setActiveChildId(childId)}
              />

              {/* Selected Child Hero Card */}
              {activeChild && (
                <ThriveCard style={styles.activeChildCard}>
                  <View style={styles.childHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activeChildName}>{activeChild.fullName}</Text>
                      <Text style={styles.activeChildProgram}>
                        {activeChild.programs.join(', ') || t('common.generalProgram')}
                      </Text>
                    </View>
                    <ThriveBadge label={t('parent.activeBadge')} variant="primary" />
                  </View>

                  {/* Quick Child Metrics */}
                  <View style={styles.metricsGrid}>
                    <TouchableOpacity
                      style={styles.metricItem}
                      onPress={() => onNavigateTab('progress')}
                    >
                      <Text style={styles.metricLabel}>{t('common.attendance')}</Text>
                      <Text style={[styles.metricVal, { color: Colors.success }]}>
                        {activeChild.attendanceRate}%
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.metricDivider} />

                    <TouchableOpacity
                      style={styles.metricItem}
                      onPress={() => onNavigateTab('schedule')}
                    >
                      <Text style={styles.metricLabel}>{t('student.nextClass')}</Text>
                      <Text style={styles.metricVal} numberOfLines={1}>
                        {activeChild.nextClassTime || t('common.notAssigned')}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.metricDivider} />

                    <TouchableOpacity
                      style={styles.metricItem}
                      onPress={() => onNavigateTab('progress')}
                    >
                      <Text style={styles.metricLabel}>{t('student.pendingAssignments')}</Text>
                      <Text style={[styles.metricVal, { color: Colors.warning }]}>
                        {activeChild.pendingAssignmentsCount || 0}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ThriveCard>
              )}
            </Animated.View>

            {/* 2. ALIDAY COFFEESHOP STYLE ELEVATED CURVED OVERLAY SHEET */}
            <View style={styles.contentSheet}>
              {/* Sheet Grab Handle */}
              <View style={styles.sheetHandleBar} />

              {/* Performance Stats */}
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <View style={styles.sectionDot} />
                  <Text style={styles.sectionTitle}>{t('parent.progressTitle')}</Text>
                </View>
                <Text style={styles.viewAllText} onPress={() => onNavigateTab('progress')}>
                  {t('common.view')}
                </Text>
              </View>

              <View style={styles.statsGrid}>
                <StatCard
                  title={t('student.attendanceRate')}
                  value={`${activeChild?.attendanceRate || 100}%`}
                  subtitle={`${activeChild?.stats?.presentCount || 0} ${t('teacher.present')}`}
                  circularProgress={activeChild?.attendanceRate || 100}
                  accentColor={Colors.success}
                />
                <StatCard
                  title={t('student.pendingAssignments')}
                  value={activeChild?.pendingAssignmentsCount || 0}
                  icon={<Clock size={20} color={Colors.warning} />}
                  accentColor={Colors.warning}
                />
              </View>

              {/* Weekly Lesson Preview */}
              <View style={[styles.sectionHeader, { marginTop: Spacing.lg }]}>
                <View style={styles.sectionHeaderLeft}>
                  <View style={[styles.sectionDot, { backgroundColor: Colors.warning }]} />
                  <Text style={styles.sectionTitle}>{t('student.scheduleTitle')}</Text>
                </View>
                <Text style={styles.viewAllText} onPress={() => onNavigateTab('schedule')}>
                  {t('common.view')}
                </Text>
              </View>

              <ThriveCard style={styles.schedulePreviewCard} onPress={() => onNavigateTab('schedule')}>
                <View style={styles.scheduleRow}>
                  <View style={styles.scheduleIconCircle}>
                    <Calendar size={22} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.scheduleTitle}>{t('parent.childWeeklySchedule')}</Text>
                    <Text style={styles.scheduleSubtitle}>
                      {t('parent.viewScheduleCardSub')}
                    </Text>
                  </View>
                </View>
              </ThriveCard>
            </View>
          </>
        )}
      </Animated.ScrollView>

      {/* Modals */}
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
  carouselSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
  },
  activeChildCard: {
    backgroundColor: '#0F2744',
    borderColor: 'rgba(76, 162, 181, 0.45)',
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
    ...Shadows.glow,
  },
  childHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  activeChildName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  activeChildProgram: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
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
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  childCountText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  schedulePreviewCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  scheduleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(76, 162, 181, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  scheduleSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});
