import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Users, MapPin, Calendar, UserCheck, ChevronRight } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { teacherService } from '../../services/teacherService';
import { TeacherGroupItem } from '../../types/teacher.types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { ThriveCard } from '../../components/common/ThriveCard';
import { ThriveBadge } from '../../components/common/ThriveBadge';
import { ThriveButton } from '../../components/common/ThriveButton';
import { SkeletonCardList } from '../../components/common/ThriveSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { AttendanceModal } from '../../components/modals/AttendanceModal';

interface TeacherGroupsScreenProps {
  onOpenStudentDetail?: (studentId: string, profileId: string, name: string) => void;
}

export const TeacherGroupsScreen: React.FC<TeacherGroupsScreenProps> = ({
  onOpenStudentDetail,
}) => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [groups, setGroups] = useState<TeacherGroupItem[]>([]);

  // Attendance modal
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<TeacherGroupItem | null>(null);

  const teacherId = session?.teacherId;

  useEffect(() => {
    if (teacherId) {
      loadGroups();
    }
  }, [teacherId]);

  const loadGroups = async () => {
    if (!teacherId) return;
    try {
      const data = await teacherService.getTeacherGroups(teacherId);
      setGroups(data);
    } catch (e) {
      console.error('Error loading teacher groups:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadGroups();
  };

  return (
    <View style={styles.container}>
      <HeaderBar title="Tədris Qrupları" subtitle="Müəllimə Təhkim Olunmuş Qruplar" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {loading ? (
          <SkeletonCardList count={3} />
        ) : groups.length === 0 ? (
          <EmptyState
            title="Qrup tapılmadı"
            description="Hazırda sizə təhkim olunmuş aktiv qrup qeydiyyatı yoxdur."
          />
        ) : (
          groups.map((group) => (
            <ThriveCard key={group.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <ThriveBadge label={group.programName} variant="primary" />
                <View style={styles.studentBadge}>
                  <Users size={12} color={Colors.primary} />
                  <Text style={styles.studentBadgeText}>{group.studentCount} Tələbə</Text>
                </View>
              </View>

              <Text style={styles.groupName}>{group.name}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MapPin size={13} color={Colors.textMuted} />
                  <Text style={styles.metaText}>Otaq: {group.room}</Text>
                </View>
              </View>

              {/* Weekly schedule summary */}
              <View style={styles.scheduleBox}>
                <Text style={styles.scheduleTitle}>Həftəlik Dərs Saatları:</Text>
                {group.schedules.length === 0 ? (
                  <Text style={styles.noScheduleText}>Cədvəl qeyd edilməyib</Text>
                ) : (
                  group.schedules.map((s, idx) => {
                    const daysMap = ['', 'B.e', 'Ç.a', 'Çər', 'C.a', 'Cüm', 'Şən', 'Baz'];
                    return (
                      <Text key={idx} style={styles.scheduleItemText}>
                        • {daysMap[s.dayOfWeek] || 'Gün'}: {s.startTime} – {s.endTime} ({s.room})
                      </Text>
                    );
                  })
                )}
              </View>

              <View style={styles.btnRow}>
                <ThriveButton
                  title="Davamiyyət yaz"
                  size="sm"
                  variant="primary"
                  onPress={() => {
                    setSelectedGroup(group);
                    setAttendanceModalVisible(true);
                  }}
                  icon={<UserCheck size={14} color="#FFFFFF" />}
                  style={{ flex: 1 }}
                />
              </View>
            </ThriveCard>
          ))
        )}
      </ScrollView>

      <AttendanceModal
        visible={attendanceModalVisible}
        groupId={selectedGroup?.id || ''}
        groupName={selectedGroup?.name || ''}
        onClose={() => {
          setAttendanceModalVisible(false);
          setSelectedGroup(null);
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
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(76, 162, 181, 0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  studentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginVertical: Spacing.xs,
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
  scheduleBox: {
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.md,
    padding: Spacing.sm + 2,
    marginVertical: Spacing.sm,
  },
  scheduleTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  scheduleItemText: {
    fontSize: 12,
    color: Colors.textPrimary,
    marginVertical: 1,
  },
  noScheduleText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
});
