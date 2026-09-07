import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { ChevronRight, BookOpen, Clock, CheckCircle } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { parentService } from '../../services/parentService';
import { ChildOverview } from '../../types/parent.types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { ThriveCard } from '../../components/common/ThriveCard';
import { ThriveAvatar } from '../../components/common/ThriveAvatar';
import { ThriveBadge } from '../../components/common/ThriveBadge';
import { ThriveButton } from '../../components/common/ThriveButton';
import { SkeletonCardList } from '../../components/common/ThriveSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ChildDetailModal } from '../../components/modals/ChildDetailModal';

interface ParentChildrenScreenProps {
  onSelectChildAndNavigate: (childId: string, destinationTab?: string) => void;
}

export const ParentChildrenScreen: React.FC<ParentChildrenScreenProps> = ({
  onSelectChildAndNavigate,
}) => {
  const { session, activeChildId, setActiveChildId } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [childrenList, setChildrenList] = useState<ChildOverview[]>([]);
  const [selectedChildForModal, setSelectedChildForModal] = useState<ChildOverview | null>(null);

  const parentId = session?.parentId;

  useEffect(() => {
    if (parentId) {
      loadChildren();
    }
  }, [parentId]);

  const loadChildren = async () => {
    if (!parentId) return;
    try {
      const kids = await parentService.getChildren(parentId);
      setChildrenList(kids);
    } catch (e) {
      console.error('Error loading children:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadChildren();
  };

  const handleSelectChild = (childId: string) => {
    setActiveChildId(childId);
    onSelectChildAndNavigate(childId, 'home');
  };

  return (
    <View style={styles.container}>
      <HeaderBar title={t('parent.childrenTitle')} subtitle={t('parent.childrenSubtitle')} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {loading ? (
          <SkeletonCardList count={2} />
        ) : childrenList.length === 0 ? (
          <EmptyState
            title={t('common.empty')}
            description={t('parent.noChildrenLinked')}
          />
        ) : (
          childrenList.map((child) => {
            const isSelected = child.studentId === activeChildId;

            return (
              <TouchableOpacity
                key={child.studentId}
                activeOpacity={0.9}
                onPress={() => setSelectedChildForModal(child)}
              >
                <ThriveCard style={[styles.card, isSelected && styles.cardActive]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.userInfo}>
                      <ThriveAvatar name={child.fullName} size={52} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.childName}>{child.fullName}</Text>
                        <Text style={styles.childEmail}>{child.email || t('common.notSpecified')}</Text>
                      </View>
                    </View>
                    {isSelected && <ThriveBadge label={t('parent.activeBadge')} variant="success" />}
                  </View>

                  {/* Programs Tag Row */}
                  <View style={styles.tagsRow}>
                    {child.programs.map((prog, idx) => (
                      <ThriveBadge key={idx} label={prog} variant="primary" />
                    ))}
                  </View>

                  {/* Stats */}
                  <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>{t('common.attendance')}</Text>
                      <Text style={[styles.statVal, { color: Colors.success }]}>
                        {child.attendanceRate}%
                      </Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>{t('nav.assignments')}</Text>
                      <Text style={[styles.statVal, { color: Colors.warning }]}>
                        {child.pendingAssignmentsCount} {t('common.pending')}
                      </Text>
                    </View>
                  </View>

                  {/* Action buttons */}
                  <View style={styles.actionRow}>
                    <ThriveButton
                      title={t('parent.viewProfileDetails')}
                      variant="outline"
                      size="sm"
                      onPress={() => setSelectedChildForModal(child)}
                      style={{ flex: 1 }}
                    />
                    {!isSelected && (
                      <ThriveButton
                        title={t('parent.setActive')}
                        variant="primary"
                        size="sm"
                        onPress={() => handleSelectChild(child.studentId)}
                        style={{ flex: 0.8 }}
                      />
                    )}
                  </View>
                </ThriveCard>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* CHILD DETAIL MODAL */}
      <ChildDetailModal
        visible={!!selectedChildForModal}
        child={selectedChildForModal}
        isActive={selectedChildForModal?.studentId === activeChildId}
        onClose={() => setSelectedChildForModal(null)}
        onSelectAsActive={() => {
          if (selectedChildForModal) {
            handleSelectChild(selectedChildForModal.studentId);
            setSelectedChildForModal(null);
          }
        }}
        onOpenSchedule={() => {
          if (selectedChildForModal) {
            setActiveChildId(selectedChildForModal.studentId);
            onSelectChildAndNavigate(selectedChildForModal.studentId, 'schedule');
          }
        }}
        onOpenProgress={() => {
          if (selectedChildForModal) {
            setActiveChildId(selectedChildForModal.studentId);
            onSelectChildAndNavigate(selectedChildForModal.studentId, 'progress');
          }
        }}
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
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardActive: {
    borderColor: 'rgba(76, 162, 181, 0.45)',
    backgroundColor: '#0F2744',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  childEmail: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginVertical: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  statVal: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
});
