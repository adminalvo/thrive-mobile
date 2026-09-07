import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors, Radius, Spacing } from '../../config/theme';
import { useLanguage } from '../../context/LanguageContext';
import { ThriveAvatar } from './ThriveAvatar';
import { ThriveBadge } from './ThriveBadge';
import { ChildOverview } from '../../types/parent.types';

interface ChildSelectorCarouselProps {
  childrenList: ChildOverview[];
  selectedChildId: string | null;
  onSelectChild: (childId: string) => void;
}

export const ChildSelectorCarousel: React.FC<ChildSelectorCarouselProps> = ({
  childrenList,
  selectedChildId,
  onSelectChild,
}) => {
  const { t } = useLanguage();

  if (childrenList.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {childrenList.map((child) => {
          const isSelected = child.studentId === selectedChildId;

          // Format dynamic payment status
          const isPaid = (child.paymentSummary?.remainingDebt || 0) <= 0;
          const statusText = isPaid
            ? t('payments.paidStatus')
            : t('payments.debtStatus', { amount: String(child.paymentSummary?.remainingDebt || 0) });

          return (
            <TouchableOpacity
              key={child.studentId}
              activeOpacity={0.8}
              onPress={() => onSelectChild(child.studentId)}
              style={[
                styles.childCard,
                isSelected && styles.childCardSelected,
              ]}
            >
              <View style={styles.cardHeader}>
                <ThriveAvatar name={child.fullName} size={36} />
                {isSelected && <ThriveBadge label={t('common.active')} variant="primary" />}
              </View>

              <Text style={[styles.childName, isSelected && styles.childNameSelected]} numberOfLines={1}>
                {child.fullName}
              </Text>

              <Text style={styles.programText} numberOfLines={1}>
                {child.programs.join(', ') || t('common.generalProgram')}
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>{t('common.attendance')}</Text>
                  <Text style={styles.statVal}>{child.attendanceRate}%</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>{t('common.status')}</Text>
                  <Text style={styles.statVal} numberOfLines={1}>
                    {statusText}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  childCard: {
    width: 210,
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  childCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#0F2744',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  childName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  childNameSelected: {
    color: '#FFFFFF',
  },
  programText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  statItem: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.xs,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  statVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
});
