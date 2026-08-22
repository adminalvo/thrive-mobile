import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { UserCheck, Users, Calendar } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { teacherService } from '../../services/teacherService';
import { TeacherGroupItem } from '../../types/teacher.types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { ThriveCard } from '../../components/common/ThriveCard';
import { ThriveBadge } from '../../components/common/ThriveBadge';
import { ThriveButton } from '../../components/common/ThriveButton';
import { SkeletonCardList } from '../../components/common/ThriveSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { AttendanceModal } from '../../components/modals/AttendanceModal';

export const TeacherAttendanceScreen: React.FC = () => {
  const { session } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [groups, setGroups] = useState<TeacherGroupItem[]>([]);

  const [selectedGroup, setSelectedGroup] = useState<TeacherGroupItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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
      console.error('Error loading groups for attendance:', e);
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
      <HeaderBar title={t('teacher.attendanceTitle')} subtitle={t('teacher.attendanceSubtitle')} />

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
            title={t('common.empty')}
            description={t('teacher.noGroups')}
          />
        ) : (
          groups.map((g) => (
            <ThriveCard key={g.id} style={styles.card}>
              <View style={styles.headerRow}>
                <ThriveBadge label={g.programName} variant="primary" />
                <View style={styles.studentBadge}>
                  <Users size={12} color={Colors.primary} />
                  <Text style={styles.studentBadgeText}>{t('teacher.studentsCount', { count: g.studentCount })}</Text>
                </View>
              </View>

              <Text style={styles.groupTitle}>{g.name}</Text>
              <Text style={styles.roomText}>{t('teacher.roomLabel', { room: g.room })}</Text>

              <ThriveButton
                title={t('teacher.recordAttendanceBtn')}
                variant="primary"
                onPress={() => {
                  setSelectedGroup(g);
                  setModalVisible(true);
                }}
                icon={<UserCheck size={16} color="#FFFFFF" />}
                style={{ marginTop: Spacing.md }}
              />
            </ThriveCard>
          ))
        )}
      </ScrollView>

      <AttendanceModal
        visible={modalVisible}
        groupId={selectedGroup?.id || ''}
        groupName={selectedGroup?.name || ''}
        onClose={() => {
          setModalVisible(false);
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
  headerRow: {
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
  groupTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  roomText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
