import React, { useState, useEffect } from 'react';
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
import { studentService } from '../../services/studentService';
import { parentService } from '../../services/parentService';
import { LessonScheduleItem } from '../../types/student.types';
import { ChildOverview } from '../../types/parent.types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { LessonCard } from '../../components/common/LessonCard';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonCardList } from '../../components/common/ThriveSkeleton';
import { ClassDetailModal } from '../../components/modals/ClassDetailModal';

const DAYS = [
  { num: 1, label: 'B.e' },
  { num: 2, label: 'Ç.a' },
  { num: 3, label: 'Çər' },
  { num: 4, label: 'C.a' },
  { num: 5, label: 'Cüm' },
  { num: 6, label: 'Şən' },
  { num: 7, label: 'Baz' },
];

export const ParentScheduleScreen: React.FC = () => {
  const { session, activeChildId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [schedules, setSchedules] = useState<LessonScheduleItem[]>([]);
  const [children, setChildren] = useState<ChildOverview[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(
    new Date().getDay() === 0 ? 7 : new Date().getDay()
  );
  const [selectedLesson, setSelectedLesson] = useState<LessonScheduleItem | null>(null);

  const parentId = session?.parentId;

  useEffect(() => {
    if (parentId) {
      loadData();
    }
  }, [parentId, activeChildId]);

  const loadData = async () => {
    if (!parentId) return;
    try {
      const kids = await parentService.getChildren(parentId);
      setChildren(kids);

      const targetChildId = activeChildId || kids[0]?.studentId;
      if (targetChildId) {
        const data = await studentService.getStudentSchedule(targetChildId);
        setSchedules(data);
      }
    } catch (e) {
      console.error('Error loading parent schedule:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const activeChild = children.find((c) => c.studentId === activeChildId) || children[0];
  const filteredLessons = schedules.filter((s) => s.dayOfWeek === selectedDay);

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Dərs Cədvəli"
        subtitle={activeChild ? `${activeChild.fullName} üçün cədvəl` : 'Övlad cədvəli'}
      />

      {/* Weekday selector */}
      <View style={styles.daysBar}>
        {DAYS.map((d) => {
          const isSelected = selectedDay === d.num;
          const isToday = (new Date().getDay() === 0 ? 7 : new Date().getDay()) === d.num;

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
              {isToday && <View style={styles.todayDot} />}
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
            title="Dərs yoxdur"
            description="Bu gün üçün planlaşdırılmış dərs qeydiyyatı tapılmadı."
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
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    marginHorizontal: 2,
  },
  dayButtonSelected: {
    backgroundColor: Colors.primary,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.warning,
    marginTop: 3,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
});
