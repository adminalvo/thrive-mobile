import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { CreditCard, Calendar, CheckCircle2 } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { parentService } from '../../services/parentService';
import { StudentPaymentSummary } from '../../types/student.types';
import { ChildOverview } from '../../types/parent.types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { ThriveCard } from '../../components/common/ThriveCard';
import { ThriveBadge } from '../../components/common/ThriveBadge';
import { SkeletonCardList } from '../../components/common/ThriveSkeleton';

export const ParentPaymentsScreen: React.FC = () => {
  const { session, activeChildId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<StudentPaymentSummary | null>(null);
  const [children, setChildren] = useState<ChildOverview[]>([]);

  const parentId = session?.parentId;

  useEffect(() => {
    if (parentId) {
      loadPayments();
    }
  }, [parentId, activeChildId]);

  const loadPayments = async () => {
    if (!parentId) return;
    try {
      const kids = await parentService.getChildren(parentId);
      setChildren(kids);

      const targetChildId = activeChildId || kids[0]?.studentId;
      if (targetChildId) {
        const data = await studentService.getStudentPaymentSummary(targetChildId);
        setSummary(data);
      }
    } catch (e) {
      console.error('Error loading parent payments:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPayments();
  };

  const activeChild = children.find((c) => c.studentId === activeChildId) || children[0];

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Təhsil Haqqı və Ödənişlər"
        subtitle={activeChild ? `${activeChild.fullName} üçün maliyyə hesabatı` : 'Maliyyə'}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {loading ? (
          <SkeletonCardList count={2} />
        ) : (
          <>
            {/* Balance Hero Card */}
            <ThriveCard style={styles.heroCard}>
              <Text style={styles.heroLabel}>Qalıq Borc Məbləği</Text>
              <Text style={styles.heroAmount}>
                {summary ? `${summary.remainingDebt} ₼` : '0.00 ₼'}
              </Text>

              <View style={styles.heroBadgeRow}>
                <ThriveBadge
                  label={summary && summary.remainingDebt <= 0 ? 'Ödəniş Tamamlanıb' : 'Ödəniş Tələb Olunur'}
                  variant={summary && summary.remainingDebt <= 0 ? 'success' : 'warning'}
                />
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Ümumi Təhsil Haqqı</Text>
                  <Text style={styles.statVal}>{summary?.totalDue || 0} ₼</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Ödənilmiş Hissə</Text>
                  <Text style={[styles.statVal, { color: Colors.success }]}>
                    {summary?.paidAmount || 0} ₼
                  </Text>
                </View>
              </View>
            </ThriveCard>

            {/* Next Due Date */}
            {summary?.nextDueDate && (
              <ThriveCard style={styles.dueDateCard}>
                <View style={styles.dueDateRow}>
                  <View style={styles.dateIcon}>
                    <Calendar size={20} color={Colors.warning} />
                  </View>
                  <View>
                    <Text style={styles.dueLabel}>Növbəti Ödəniş Tarixi</Text>
                    <Text style={styles.dueValue}>{summary.nextDueDate}</Text>
                  </View>
                </View>
              </ThriveCard>
            )}

            <Text style={styles.sectionTitle}>Məlumat və Əlaqə</Text>
            <ThriveCard style={styles.infoCard}>
              <Text style={styles.infoTitle}>Valideynlər üçün ödəniş qaydaları</Text>
              <Text style={styles.infoDesc}>
                Ödənişlərinizi mərkəzimizin mühasibatlığına yaxınlaşaraq nağd və ya bank kartı vasitəsilə icra edə bilərsiniz. Ödəniş qeydə alındıqda dərhal sistemdə yenilənir və qəbz təqdim olunur.
              </Text>
            </ThriveCard>
          </>
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
  heroCard: {
    backgroundColor: '#0F2744',
    borderColor: 'rgba(76, 162, 181, 0.4)',
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  heroAmount: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: Spacing.xs,
  },
  heroBadgeRow: {
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  dueDateCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dueLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  dueValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  infoCard: {
    padding: Spacing.md,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
