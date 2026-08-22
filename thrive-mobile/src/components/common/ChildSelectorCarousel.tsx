import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors, Radius, Spacing } from '../../config/theme';
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
                {isSelected && <ThriveBadge label="Aktiv" variant="primary" />}
              </View>

              <Text style={[styles.childName, isSelected && styles.childNameSelected]} numberOfLines={1}>
                {child.fullName}
              </Text>

              <Text style={styles.programText} numberOfLines={1}>
                {child.programs.join(', ') || 'Proqram'}
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Davamiyyət</Text>
                  <Text style={styles.statVal}>{child.attendanceRate}%</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Status</Text>
                  <Text style={styles.statVal} numberOfLines={1}>
                    {child.paymentStatus}
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
