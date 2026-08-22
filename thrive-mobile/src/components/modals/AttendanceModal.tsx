import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Check, X, Users, UserCheck } from 'lucide-react-native';
import { Colors, Radius, Spacing } from '../../config/theme';
import { teacherService } from '../../services/teacherService';
import { TeacherStudentRosterItem } from '../../types/teacher.types';
import { AttendanceStatus } from '../../types/database.types';
import { ThriveButton } from '../common/ThriveButton';
import { ThriveAvatar } from '../common/ThriveAvatar';

interface AttendanceModalProps {
  visible: boolean;
  groupId: string;
  groupName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  visible,
  groupId,
  groupName,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState<TeacherStudentRosterItem[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const dateStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (visible && groupId) {
      loadRoster();
    }
  }, [visible, groupId]);

  const loadRoster = async () => {
    setLoading(true);
    const roster = await teacherService.getGroupRoster(groupId, dateStr);
    setStudents(roster);

    const initialMap: Record<string, AttendanceStatus> = {};
    roster.forEach((s) => {
      initialMap[s.studentId] = s.attendanceStatus || 'PRESENT';
    });
    setAttendanceMap(initialMap);
    setLoading(false);
  };

  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      updated[s.studentId] = 'PRESENT';
    });
    setAttendanceMap(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    const list = Object.entries(attendanceMap).map(([studentId, status]) => ({
      studentId,
      status,
    }));

    const res = await teacherService.saveAttendance(groupId, dateStr, list);
    setSaving(false);
    if (res.success) {
      onSuccess && onSuccess();
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Davamiyyət Qeydiyyatı</Text>
            <Text style={styles.groupSubtitle}>{groupName} • {dateStr}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.toolbar}>
          <ThriveButton
            title="Hamısını 'İştirak etdi' et"
            size="sm"
            variant="outline"
            onPress={handleMarkAllPresent}
            icon={<UserCheck size={16} color={Colors.primary} />}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Tələbələr yüklənir...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.rosterList}>
            {students.map((student) => {
              const currentStatus = attendanceMap[student.studentId] || 'PRESENT';

              return (
                <View key={student.studentId} style={styles.studentCard}>
                  <View style={styles.studentInfo}>
                    <ThriveAvatar name={student.fullName} size={36} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.studentName}>{student.fullName}</Text>
                    </View>
                  </View>

                  <View style={styles.buttonsRow}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleSetStatus(student.studentId, 'PRESENT')}
                      style={[
                        styles.statusBtn,
                        currentStatus === 'PRESENT' && styles.statusBtnPresent,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          currentStatus === 'PRESENT' && styles.statusBtnTextActive,
                        ]}
                      >
                        İştirak
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleSetStatus(student.studentId, 'LATE')}
                      style={[
                        styles.statusBtn,
                        currentStatus === 'LATE' && styles.statusBtnLate,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          currentStatus === 'LATE' && styles.statusBtnTextActive,
                        ]}
                      >
                        Gecikdi
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleSetStatus(student.studentId, 'ABSENT')}
                      style={[
                        styles.statusBtn,
                        currentStatus === 'ABSENT' && styles.statusBtnAbsent,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          currentStatus === 'ABSENT' && styles.statusBtnTextActive,
                        ]}
                      >
                        Qayıb
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.footer}>
          <ThriveButton
            title="Ləğv et"
            variant="secondary"
            onPress={onClose}
            style={{ flex: 1 }}
          />
          <ThriveButton
            title="Davamiyyəti yadda saxla"
            variant="primary"
            loading={saving}
            onPress={handleSave}
            style={{ flex: 2 }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl + 10,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.cardElevated,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  groupSubtitle: {
    fontSize: 13,
    color: Colors.primary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  toolbar: {
    padding: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  rosterList: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  studentCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBtnPresent: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  statusBtnLate: {
    backgroundColor: Colors.warning,
    borderColor: Colors.warning,
  },
  statusBtnAbsent: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  statusBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  statusBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.cardElevated,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
