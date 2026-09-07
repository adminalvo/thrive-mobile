import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapPin, User, ChevronRight } from 'lucide-react-native';
import { Colors, Spacing, Radius, Shadows } from '../../config/theme';
import { useLanguage } from '../../context/LanguageContext';
import { ThriveCard } from './ThriveCard';
import { ThriveBadge } from './ThriveBadge';
import { ThriveButton } from './ThriveButton';
import { LessonScheduleItem } from '../../types/student.types';

interface NextClassCardProps {
  lesson: LessonScheduleItem | null;
  onViewPress?: () => void;
}

export const NextClassCard: React.FC<NextClassCardProps> = ({ lesson, onViewPress }) => {
  const { t } = useLanguage();

  if (!lesson) {
    return (
      <ThriveCard style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>{t('student.noNextClass')}</Text>
        <Text style={styles.emptySubtitle}>{t('student.noNextClassDesc')}</Text>
      </ThriveCard>
    );
  }

  return (
    <ThriveCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badgeGroup}>
          <ThriveBadge label={t('schedule.nextClassUpper')} variant="primary" />
          <View style={styles.todayPill}>
            <View style={styles.liveDot} />
            <Text style={styles.todayText}>
              {lesson.isToday ? t('common.today').toUpperCase() : t('nav.schedule').toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.timeWrap}>
          <Text style={styles.timeBadge}>{lesson.startTime} – {lesson.endTime}</Text>
        </View>
      </View>

      <Text style={styles.programTitle}>{lesson.programName}</Text>
      <Text style={styles.groupName}>{lesson.groupName}</Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <User size={15} color={Colors.primary} />
          <Text style={styles.metaText}>{lesson.teacherName}</Text>
        </View>
        <View style={styles.metaItem}>
          <MapPin size={15} color={Colors.warning} />
          <Text style={styles.metaText}>{t('common.room')}: {lesson.room}</Text>
        </View>
      </View>

      {onViewPress && (
        <ThriveButton
          title={t('student.viewClass')}
          size="sm"
          variant="outline"
          onPress={onViewPress}
          icon={<ChevronRight size={14} color={Colors.primary} />}
          style={styles.actionBtn}
        />
      )}
    </ThriveCard>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F2744',
    borderColor: 'rgba(76, 162, 181, 0.45)',
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    padding: Spacing.md + 2,
    marginBottom: Spacing.md,
    ...Shadows.glow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  todayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  todayText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  timeWrap: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    backgroundColor: 'rgba(76, 162, 181, 0.12)',
    borderRadius: Radius.sm,
  },
  timeBadge: {
    fontSize: 13,
    fontWeight: '800',
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
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  actionBtn: {
    marginTop: Spacing.xs,
    alignSelf: 'flex-start',
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardBackground,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
