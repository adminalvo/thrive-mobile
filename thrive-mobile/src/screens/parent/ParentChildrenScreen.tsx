import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Check, Mail, Phone, BookOpen, Clock } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { parentService } from '../../services/parentService';
import { ChildOverview } from '../../types/parent.types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { ThriveCard } from '../../components/common/ThriveCard';
import { ThriveAvatar } from '../../components/common/ThriveAvatar';
import { ThriveBadge } from '../../components/common/ThriveBadge';
import { ThriveButton } from '../../components/common/ThriveButton';
import { SkeletonCardList } from '../../components/common/ThriveSkeleton';
import { EmptyState } from '../../components/common/EmptyState';

interface ParentChildrenScreenProps {
  onSelectChildAndNavigate: (childId: string) => void;
}

export const ParentChildrenScreen: React.FC<ParentChildrenScreenProps> = ({
  onSelectChildAndNavigate,
}) => {
  const { session, activeChildId, setActiveChildId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [childrenList, setChildrenList] = useState<ChildOverview[]>([]);

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
    onSelectChildAndNavigate(childId);
  };

  return (
    <View style={styles.container}>
      <HeaderBar title="Övladlarım" subtitle="Bağlı Tələbə Hesabları" />

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
            title="Övlad tapılmadı"
            description="Hesabınıza bağlı heç bir tələbə qeydiyyatı tapılmadı."
          />
        ) : (
          childrenList.map((child) => {
            const isSelected = child.studentId === activeChildId;

            return (
              <ThriveCard key={child.studentId} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.userInfo}>
                    <ThriveAvatar name={child.fullName} size={48} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.childName}>{child.fullName}</Text>
                      <Text style={styles.childEmail}>{child.email || 'Email qeyd olunmayıb'}</Text>
                    </View>
                  </View>
                  {isSelected && <ThriveBadge label="Seçilib" variant="success" />}
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
                    <Text style={styles.statLabel}>Davamiyyət</Text>
                    <Text style={[styles.statVal, { color: Colors.success }]}>
                      {child.attendanceRate}%
                    </Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Tapşırıqlar</Text>
                    <Text style={[styles.statVal, { color: Colors.warning }]}>
                      {child.pendingAssignmentsCount} gözləyir
                    </Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Ödəniş</Text>
                    <Text style={styles.statVal}>{child.paymentStatus}</Text>
                  </View>
                </View>

                {/* Action button */}
                <ThriveButton
                  title={isSelected ? "Tələbəyə baxılır (Aktiv)" : "Bu tələbəni seç və bax"}
                  variant={isSelected ? "outline" : "primary"}
                  onPress={() => handleSelectChild(child.studentId)}
                  style={{ marginTop: Spacing.md }}
                />
              </ThriveCard>
            );
          })
        )}
      </ScrollView>
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
    fontWeight: '700',
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
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
});
