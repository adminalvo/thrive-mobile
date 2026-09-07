import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Clock, MapPin, Users, UserCheck } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { teacherService } from '../../services/teacherService';
import { TeacherGroupItem } from '../../types/teacher.types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { ThriveCard } from '../../components/common/ThriveCard';
import { ThriveBadge } from '../../components/common/ThriveBadge';
import { ThriveButton } from '../../components/common/ThriveButton';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonCardList } from '../../components/common/ThriveSkeleton';
import { AttendanceModal } from '../../components/modals/AttendanceModal';

export const TeacherScheduleScreen: React.FC = () => {
  const { session } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [groups, setGroups] = useState<TeacherGroupItem[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(
    new Date().getDay() === 0 ? 7 : new Date().getDay()
  );

  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [attendanceGroupId, setAttendanceGroupId] = useState('');
  const [attendanceGroupName, setAttendanceGroupName] = useState('');

  const teacherId = session?.teacherId;

  const DAYS = [
    { num: 1, label: t('days.mon') },
    { num: 2, label: t('days.tue') },
    { num: 3, label: t('days.wed') },
    { num: 4, label: t('days.thu') },
    { num: 5, label: t('days.fri') },
    { num: 6, label: t('days.sat') },
    { num: 7, label: t('days.sun') },
  ];

  useEffect(() => {
    if (teacherId) {
      loadSchedule();
    }
  }, [teacherId]);

  const loadSchedule = async () => {
    if (!teacherId) return;
    try {
      const data = await teacherService.getTeacherGroups(teacherId);
      setGroups(data);
    } catch (e) {
      console.error('Error loading teacher schedule:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSchedule();
  };

  // Filter lessons for selected day
  const lessonsForDay: {
    groupId: string;
    groupName: string;
    programName: string;
    startTime: string;
    endTime: string;
    room: string;
    studentCount: number;
  }[] = [];

  groups.forEach((g) => {
    g.schedules
      .filter((s) => s.dayOfWeek === selectedDay)
      .forEach((s) => {
        lessonsForDay.push({
          groupId: g.id,
          groupName: g.name,
          programName: g.programName,
          startTime: s.startTime,
          endTime: s.endTime,
          room: s.room,
          studentCount: g.studentCount,
        });
      });
  });

  lessonsForDay.sort((a, b) => a.startTime.localeCompare(b.startTime));

  const openAttendance = (groupId: string, groupName: string) => {
    setAttendanceGroupId(groupId);
    setAttendanceGroupName(groupName);
    setAttendanceModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <HeaderBar title={t('teacher.scheduleTitle')} subtitle={t('teacher.scheduleSubtitle')} />

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
        ) : lessonsForDay.length === 0 ? (
          <EmptyState
            title={t('common.empty')}
            description={t('teacher.noScheduleForDay')}
          />
        ) : (
          lessonsForDay.map((item, idx) => (
            <ThriveCard key={idx} style={styles.card}>
              <View style={styles.cardHeader}>
                <ThriveBadge label={item.programName} variant="primary" />
                <Text style={styles.timeBadge}>{item.startTime} – {item.endTime}</Text>
              </View>

              <Text style={styles.groupTitle}>{item.groupName}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MapPin size={13} color={Colors.textMuted} />
                  <Text style={styles.metaText}>{t('teacher.roomLabel', { room: item.room })}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Users size={13} color={Colors.textMuted} />
                  <Text style={styles.metaText}>{t('teacher.studentsCount', { count: item.studentCount })}</Text>
                </View>
              </View>

              <ThriveButton
                title={t('teacher.takeAttendanceBtn')}
                size="sm"
                variant="outline"
                onPress={() => openAttendance(item.groupId, item.groupName)}
                icon={<UserCheck size={14} color={Colors.primary} />}
                style={{ marginTop: Spacing.md }}
              />
            </ThriveCard>
          ))
        )}
      </ScrollView>

      <AttendanceModal
        visible={attendanceModalVisible}
        groupId={attendanceGroupId}
        groupName={attendanceGroupName}
        onClose={() => setAttendanceModalVisible(false)}
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
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.sm + 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
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
    color: Colors.textSecondary,
  },
});
