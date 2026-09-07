import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Calendar, CreditCard, Shield } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { studentService } from '../../services/studentService';
import { StudentPaymentSummary } from '../../types/student.types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { ThriveCard } from '../../components/common/ThriveCard';
import { ThriveBadge } from '../../components/common/ThriveBadge';
import { ThriveButton } from '../../components/common/ThriveButton';
import { SkeletonCardList } from '../../components/common/ThriveSkeleton';
import { OnlinePaymentModal } from '../../components/modals/OnlinePaymentModal';

export const StudentPaymentsScreen: React.FC = () => {
  const { session } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<StudentPaymentSummary | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  const studentId = session?.studentId;
  const studentName = session?.profile.first_name || t('common.student');

  useEffect(() => {
    if (studentId) {
      loadPayments();
    }
  }, [studentId]);

  const loadPayments = async () => {
    if (!studentId) return;
    try {
      const data = await studentService.getStudentPaymentSummary(studentId);
      setSummary(data);
    } catch (e) {
      console.error('Error loading payments:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPayments();
  };

  const remainingDebt = summary?.remainingDebt || 0;

  return (
    <View style={styles.container}>
      <HeaderBar title={t('student.paymentsTitle')} subtitle={t('student.paymentsSubtitle')} />

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
              <Text style={styles.heroLabel}>{t('student.remainingDebt')}</Text>
              <Text style={styles.heroAmount}>{remainingDebt} ₼</Text>

              <View style={styles.heroBadgeRow}>
                <ThriveBadge
                  label={remainingDebt <= 0 ? t('payments.paidStatus') : t('common.pending')}
                  variant={remainingDebt <= 0 ? 'success' : 'warning'}
                />
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>{t('student.totalDue')}</Text>
                  <Text style={styles.statVal}>{summary?.totalDue || 0} ₼</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>{t('student.paidAmount')}</Text>
                  <Text style={[styles.statVal, { color: Colors.success }]}>
                    {summary?.paidAmount || 0} ₼
                  </Text>
                </View>
              </View>

              {remainingDebt > 0 && (
                <ThriveButton
                  title={t('common.payOnline')}
                  onPress={() => setPaymentModalVisible(true)}
                  variant="primary"
                  size="md"
                  icon={<CreditCard size={18} color="#FFFFFF" />}
                  style={{ width: '100%', marginTop: Spacing.md }}
                />
              )}
            </ThriveCard>

            {/* Next Due Date */}
            {summary?.nextDueDate && (
              <ThriveCard style={styles.dueDateCard}>
                <View style={styles.dueDateRow}>
                  <View style={styles.dateIcon}>
                    <Calendar size={20} color={Colors.warning} />
                  </View>
                  <View>
                    <Text style={styles.dueLabel}>{t('student.nextDueDate')}</Text>
                    <Text style={styles.dueValue}>{summary.nextDueDate}</Text>
                  </View>
                </View>
              </ThriveCard>
            )}

            <Text style={styles.sectionTitle}>{t('student.paymentsSubtitle')}</Text>
            <ThriveCard style={styles.infoCard}>
              <View style={styles.securityRow}>
                <Shield size={20} color={Colors.success} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>{t('payments.secureOnlinePayment')}</Text>
                  <Text style={styles.infoDesc}>
                    {t('parent.officialReportDesc')}
                  </Text>
                </View>
              </View>
            </ThriveCard>
          </>
        )}
      </ScrollView>

      <OnlinePaymentModal
        visible={paymentModalVisible}
        amount={remainingDebt}
        studentName={studentName}
        onClose={() => setPaymentModalVisible(false)}
        onPaymentSuccess={() => {
          loadPayments();
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
  heroCard: {
    backgroundColor: '#0F2744',
    borderColor: 'rgba(76, 162, 181, 0.4)',
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  heroLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  heroAmount: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.primary,
    marginTop: 4,
  },
  heroBadgeRow: {
    marginTop: Spacing.xs,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  dueDateCard: {
    backgroundColor: '#0F2A4A',
    borderColor: 'rgba(245, 158, 11, 0.3)',
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
    borderRadius: Radius.md,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
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
    marginBottom: Spacing.xs + 2,
  },
  infoCard: {
    padding: Spacing.md,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});
