import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { studentService } from '../../services/studentService';
import { parentService } from '../../services/parentService';
import { LessonScheduleItem } from '../../types/student.types';
import { ChildOverview } from '../../types/parent.types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { LessonCard } from '../../components/common/LessonCard';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonCardList } from '../../components/common/ThriveSkeleton';
import { ClassDetailModal } from '../../components/modals/ClassDetailModal';
import { ChildSelectorCarousel } from '../../components/common/ChildSelectorCarousel';

export const ParentScheduleScreen: React.FC = () => {
  const { session, activeChildId, setActiveChildId } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [schedules, setSchedules] = useState<LessonScheduleItem[]>([]);
  const [children, setChildren] = useState<ChildOverview[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(
    new Date().getDay() === 0 ? 7 : new Date().getDay()
  );
  const [selectedLesson, setSelectedLesson] = useState<LessonScheduleItem | null>(null);

  const parentId = session?.parentId;

  const DAYS = [
    { num: 1, label: t('days.mon') },
    { num: 2, label: t('days.tue') },
    { num: 3, label: t('days.wed') },
    { num: 4, label: t('days.thu') },
    { num: 5, label: t('days.fri') },
    { num: 6, label: t('days.sat') },
    { num: 7, label: t('days.sun') },
  ];

  const loadData = useCallback(async (isRefresh = false) => {
    if (!parentId) return;
    try {
      const kids = await parentService.getChildren(parentId, isRefresh);
      setChildren(kids);

      const targetChildId = activeChildId || kids[0]?.studentId;
      if (targetChildId) {
        const data = await studentService.getStudentSchedule(targetChildId, isRefresh);
        setSchedules(data);
      }
    } catch (e) {
      console.error('Error loading parent schedule:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [parentId, activeChildId]);

  useEffect(() => {
    if (parentId) {
      loadData();
    }
  }, [parentId, activeChildId, loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const activeChild = children.find((c) => c.studentId === activeChildId) || children[0];
  const filteredLessons = schedules.filter((s) => Number(s.dayOfWeek) === selectedDay);
  const daysWithClasses = new Set(schedules.map((s) => Number(s.dayOfWeek)));

  return (
    <View style={styles.container}>
      <HeaderBar
        title={t('parent.scheduleTitle')}
        subtitle={activeChild ? `${activeChild.fullName} • ${t('parent.scheduleSubtitle')}` : t('parent.scheduleSubtitle')}
      />

      {/* Child Selector if multiple children */}
      {children.length > 1 && (
        <View style={styles.childBar}>
          <ChildSelectorCarousel
            childrenList={children}
            selectedChildId={activeChild?.studentId || null}
            onSelectChild={(id) => setActiveChildId(id)}
          />
        </View>
      )}

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
  childBar: {
    marginBottom: Spacing.xs,
  },
  daysBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: Radius.md,
    minWidth: 42,
  },
  dayButtonSelected: {
    backgroundColor: Colors.primary,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 4,
    height: 6,
    alignItems: 'center',
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.warning,
  },
  classDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
});
