import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, MapPin, User } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../../config/theme';
import { ThriveCard } from './ThriveCard';
import { LessonScheduleItem } from '../../types/student.types';

interface LessonCardProps {
  lesson: LessonScheduleItem;
  onPress?: () => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson, onPress }) => {
  return (
    <ThriveCard onPress={onPress} style={styles.card}>
      <View style={styles.timeColumn}>
        <Text style={styles.startTime}>{lesson.startTime}</Text>
        <Text style={styles.endTime}>{lesson.endTime}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.contentColumn}>
        <Text style={styles.programName}>{lesson.programName}</Text>
        <Text style={styles.groupName}>{lesson.groupName}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <User size={13} color={Colors.textMuted} />
            <Text style={styles.metaText}>{lesson.teacherName}</Text>
          </View>
          <View style={styles.metaItem}>
            <MapPin size={13} color={Colors.textMuted} />
            <Text style={styles.metaText}>{lesson.room}</Text>
          </View>
        </View>
      </View>
    </ThriveCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.sm + 2,
  },
  timeColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  startTime: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  endTime: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    width: 2,
    height: 42,
    backgroundColor: Colors.primary,
    borderRadius: 1,
    marginHorizontal: Spacing.md,
  },
  contentColumn: {
    flex: 1,
  },
  programName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  groupName: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
