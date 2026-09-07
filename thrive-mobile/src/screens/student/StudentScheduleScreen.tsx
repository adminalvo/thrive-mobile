import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Calendar, Clock, MapPin, User } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { studentService } from '../../services/studentService';
import { LessonScheduleItem } from '../../types/student.types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { LessonCard } from '../../components/common/LessonCard';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonCardList } from '../../components/common/ThriveSkeleton';
import { ClassDetailModal } from '../../components/modals/ClassDetailModal';

export const StudentScheduleScreen: React.FC = () => {
  const { session } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [schedules, setSchedules] = useState<LessonScheduleItem[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(
    new Date().getDay() === 0 ? 7 : new Date().getDay()
  );
  const [selectedLesson, setSelectedLesson] = useState<LessonScheduleItem | null>(null);

  const studentId = session?.studentId;

  const DAYS = [
    { num: 1, label: t('days.mon') },
    { num: 2, label: t('days.tue') },
    { num: 3, label: t('days.wed') },
    { num: 4, label: t('days.thu') },
    { num: 5, label: t('days.fri') },
    { num: 6, label: t('days.sat') },
    { num: 7, label: t('days.sun') },
  ];

  const loadSchedule = useCallback(async (isRefresh = false) => {
    if (!studentId) return;
    try {
      const data = await studentService.getStudentSchedule(studentId, isRefresh);
      setSchedules(data);
    } catch (e) {
      console.error('Error loading student schedule:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      loadSchedule();
    }
  }, [studentId, loadSchedule]);

  const onRefresh = () => {
    setRefreshing(true);
    loadSchedule(true);
  };

  const filteredLessons = schedules.filter((s) => Number(s.dayOfWeek) === selectedDay);

  // Identify which days have active classes to show dots on the day buttons
  const daysWithClasses = new Set(schedules.map((s) => Number(s.dayOfWeek)));

  return (
    <View style={styles.container}>
      <HeaderBar title={t('student.scheduleTitle')} subtitle={t('student.scheduleSubtitle')} />

      {/* Weekday selector */}
      <View style={styles.daysBar}>
        {DAYS.map((d) => {
          const isSelected = selectedDay === d.num;
          const isToday = (new Date().getDay() === 0 ? 7 : new Date().getDay()) === d.num;
          const hasClass = daysWithClasses.has(d.num);

          return (
            <TouchableOpacity
              key={d.num}
              activeOpacity={0.7}
              onPress={() => setSelectedDay(d.num)}
              style={[
                styles.dayButton,
                isSelected && styles.dayButtonSelected,
              ]}
            >
              <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                {d.label}
              </Text>
              
              <View style={styles.indicatorRow}>
                {isToday && <View style={styles.todayDot} />}
                {hasClass && !isToday && <View style={styles.classDot} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {loading ? (
          <SkeletonCardList count={3} />
        ) : filteredLessons.length === 0 ? (
          <EmptyState
            title={t('common.empty')}
            description={t('student.noClassesToday')}
          />
        ) : (
          filteredLessons.map((item) => (
            <LessonCard
              key={item.id}
              lesson={item}
              onPress={() => setSelectedLesson(item)}
            />
          ))
        )}
      </ScrollView>

      <ClassDetailModal
        visible={!!selectedLesson}
        lesson={selectedLesson}
        onClose={() => setSelectedLesson(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  daysBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    marginHorizontal: 2,
  },
  dayButtonSelected: {
    backgroundColor: Colors.primary,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    height: 4,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.warning,
  },
  classDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(76, 162, 181, 0.6)',
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
});
