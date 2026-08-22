import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, MapPin, User, ArrowRight } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../../config/theme';
import { ThriveCard } from './ThriveCard';
import { ThriveBadge } from './ThriveBadge';
import { ThriveButton } from './ThriveButton';
import { LessonScheduleItem } from '../../types/student.types';

interface NextClassCardProps {
  lesson: LessonScheduleItem | null;
  onViewPress?: () => void;
}

export const NextClassCard: React.FC<NextClassCardProps> = ({ lesson, onViewPress }) => {
  if (!lesson) {
    return (
      <ThriveCard style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>Növbəti dərs planlaşdırılmayıb</Text>
        <Text style={styles.emptySubtitle}>Bütün dərsləriniz tamamlanıb və ya cədvəl boşdur.</Text>
      </ThriveCard>
    );
  }

  return (
    <ThriveCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badgeGroup}>
          <ThriveBadge label="NÖVBƏTİ DƏRS" variant="primary" />
          <ThriveBadge label={lesson.isToday ? "BU GÜN" : "CƏDVƏL"} variant="warning" />
        </View>
        <Text style={styles.timeBadge}>{lesson.startTime} – {lesson.endTime}</Text>
      </View>

      <Text style={styles.programTitle}>{lesson.programName}</Text>
      <Text style={styles.groupName}>{lesson.groupName}</Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <User size={15} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{lesson.teacherName}</Text>
        </View>
        <View style={styles.metaItem}>
          <MapPin size={15} color={Colors.textSecondary} />
          <Text style={styles.metaText}>Otaq: {lesson.room}</Text>
        </View>
      </View>

      {onViewPress && (
        <ThriveButton
          title="Dərsə bax"
          size="sm"
          variant="outline"
          onPress={onViewPress}
          icon={<ArrowRight size={14} color={Colors.primary} />}
          style={styles.actionBtn}
        />
      )}
    </ThriveCard>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F2744',
    borderColor: 'rgba(76, 162, 181, 0.4)',
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    padding: Spacing.md + 2,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  badgeGroup: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  timeBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  programTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  groupName: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  actionBtn: {
    marginTop: Spacing.md,
    alignSelf: 'flex-start',
  },
  emptyCard: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
