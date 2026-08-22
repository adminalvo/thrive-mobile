import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Users, Calendar, TrendingUp, CreditCard, Clock, CheckCircle } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { parentService } from '../../services/parentService';
import { notificationService } from '../../services/notificationService';
import { ChildOverview } from '../../types/parent.types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { ChildSelectorCarousel } from '../../components/common/ChildSelectorCarousel';
import { ThriveCard } from '../../components/common/ThriveCard';
import { ThriveBadge } from '../../components/common/ThriveBadge';
import { StatCard } from '../../components/common/StatCard';
import { SkeletonCardList } from '../../components/common/ThriveSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { LanguagePickerModal } from '../../components/modals/LanguagePickerModal';

interface ParentHomeScreenProps {
  onNavigateTab: (tab: string) => void;
  onOpenNotifications: () => void;
}

export const ParentHomeScreen: React.FC<ParentHomeScreenProps> = ({
  onNavigateTab,
  onOpenNotifications,
}) => {
  const { session, activeChildId, setActiveChildId } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [childrenList, setChildrenList] = useState<ChildOverview[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const parentId = session?.parentId;
  const parentName = session?.profile.first_name || 'Valideyn';

  useEffect(() => {
    if (parentId) {
      loadData();
    }
  }, [parentId]);

  const loadData = async () => {
    if (!parentId) return;
    try {
      const [kids, unread] = await Promise.all([
        parentService.getChildren(parentId),
        session?.userId ? notificationService.getUnreadCount(session.userId) : Promise.resolve(0),
      ]);

      setChildrenList(kids);
      setUnreadCount(unread);

      if (kids.length > 0 && !activeChildId) {
        setActiveChildId(kids[0].studentId);
      }
    } catch (e) {
      console.error('Error loading parent data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const activeChild = childrenList.find((c) => c.studentId === activeChildId) || childrenList[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('common.goodMorning');
    if (hour < 18) return t('common.goodAfternoon');
    return t('common.goodEvening');
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        userName={`${getGreeting()}, ${parentName} 👋`}
        subtitle="Valideyn İcmalı"
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
        ) : childrenList.length === 0 ? (
          <EmptyState
            title="Övlad tapılmadı"
            description="Hesabınıza bağlı heç bir tələbə qeydiyyatı tapılmadı. Zəhmət olmasa tədris mərkəzinin administratoru ilə əlaqə saxlayın."
          />
        ) : (
          <>
            {/* Child Selector Carousel */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('parent.myChildren')}</Text>
              <Text style={styles.childCountText}>{childrenList.length} Övlad</Text>
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
                  <View>
                    <Text style={styles.activeChildName}>{activeChild.fullName}</Text>
                    <Text style={styles.activeChildProgram}>
                      {activeChild.programs.join(', ')}
                    </Text>
                  </View>
                  <ThriveBadge label="Aktiv Tələbə" variant="primary" />
                </View>

                {/* Quick Child Metrics */}
                <View style={styles.metricsGrid}>
                  <TouchableOpacity
                    style={styles.metricItem}
                    onPress={() => onNavigateTab('progress')}
                  >
                    <Text style={styles.metricLabel}>Davamiyyət</Text>
                    <Text style={[styles.metricVal, { color: Colors.success }]}>
                      {activeChild.attendanceRate}%
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.metricDivider} />

                  <TouchableOpacity
                    style={styles.metricItem}
                    onPress={() => onNavigateTab('schedule')}
                  >
                    <Text style={styles.metricLabel}>Növbəti Dərs</Text>
                    <Text style={styles.metricVal} numberOfLines={1}>
                      {activeChild.nextClassTime || 'Planlaşdırılmayıb'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Quick Action Navigation Buttons */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.actionTabBtn}
                    onPress={() => onNavigateTab('schedule')}
                  >
                    <Calendar size={18} color={Colors.primary} />
                    <Text style={styles.actionTabText}>Cədvəl</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionTabBtn}
                    onPress={() => onNavigateTab('progress')}
                  >
                    <TrendingUp size={18} color={Colors.primary} />
                    <Text style={styles.actionTabText}>Tərəqqi</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionTabBtn}
                    onPress={() => onNavigateTab('payments')}
                  >
                    <CreditCard size={18} color={Colors.primary} />
                    <Text style={styles.actionTabText}>Ödəniş</Text>
                  </TouchableOpacity>
                </View>
              </ThriveCard>
            )}

            {/* Academic Status Overview */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Akademik Vəziyyət</Text>
            </View>

            <View style={styles.statsRow}>
              <StatCard
                title="Davamiyyət Faizi"
                value={`${activeChild?.attendanceRate || 100}%`}
                subtitle="Dərslərdə iştirak"
                accentColor={Colors.success}
                icon={<CheckCircle size={18} color={Colors.success} />}
              />
              <StatCard
                title="Gözləyən Tapşırıq"
                value={activeChild?.pendingAssignmentsCount || 0}
                subtitle="Yoxlanış gözləyir"
                accentColor={Colors.warning}
                icon={<Clock size={18} color={Colors.warning} />}
              />
            </View>

            {/* Tuition Status */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Təhsil Haqqı Məlumatı</Text>
            </View>

            <ThriveCard style={styles.tuitionCard}>
              <View style={styles.tuitionRow}>
                <View>
                  <Text style={styles.tuitionLabel}>Ödəniş Vəziyyəti</Text>
                  <Text style={styles.tuitionValue}>{activeChild?.paymentStatus}</Text>
                  {activeChild?.paymentSummary?.nextDueDate && (
                    <Text style={styles.tuitionDate}>
                      Son tarix: {activeChild.paymentSummary.nextDueDate}
                    </Text>
                  )}
                </View>
                <ThriveBadge
                  label={
                    activeChild?.paymentSummary && activeChild.paymentSummary.remainingDebt <= 0
                      ? 'Ödənilib'
                      : 'Gözlənilir'
                  }
                  variant={
                    activeChild?.paymentSummary && activeChild.paymentSummary.remainingDebt <= 0
                      ? 'success'
                      : 'warning'
                  }
                />
              </View>
            </ThriveCard>
          </>
        )}
      </ScrollView>

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
  childCountText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  activeChildCard: {
    backgroundColor: '#0F2744',
    borderColor: 'rgba(76, 162, 181, 0.4)',
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  childHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  activeChildName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  activeChildProgram: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  metricItem: {
    flex: 1,
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.sm,
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  tuitionCard: {
    padding: Spacing.md,
  },
  tuitionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tuitionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  tuitionValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  tuitionDate: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
