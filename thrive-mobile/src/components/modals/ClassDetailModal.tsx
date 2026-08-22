import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Clock, MapPin, User, X, BookOpen, CheckCircle } from 'lucide-react-native';
import { Colors, Radius, Spacing } from '../../config/theme';
import { LessonScheduleItem } from '../../types/student.types';
import { ThriveButton } from '../common/ThriveButton';
import { ThriveBadge } from '../common/ThriveBadge';

interface ClassDetailModalProps {
  visible: boolean;
  lesson: LessonScheduleItem | null;
  onClose: () => void;
  onTakeAttendance?: () => void;
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  visible,
  lesson,
  onClose,
  onTakeAttendance,
}) => {
  if (!lesson) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalSheet}>
              <View style={styles.sheetHandle} />

              <View style={styles.header}>
                <View>
                  <ThriveBadge label={lesson.programName} variant="primary" />
                  <Text style={styles.groupTitle}>{lesson.groupName}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.body}>
                <View style={styles.infoRow}>
                  <View style={styles.iconCircle}>
                    <Clock size={18} color={Colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.infoLabel}>Dərs saatı</Text>
                    <Text style={styles.infoVal}>{lesson.startTime} – {lesson.endTime}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.iconCircle}>
                    <MapPin size={18} color={Colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.infoLabel}>Otaq / Məkan</Text>
                    <Text style={styles.infoVal}>{lesson.room}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.iconCircle}>
                    <User size={18} color={Colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.infoLabel}>Müəllim</Text>
                    <Text style={styles.infoVal}>{lesson.teacherName}</Text>
                  </View>
                </View>

                <View style={styles.statusBox}>
                  <CheckCircle size={18} color={Colors.success} />
                  <Text style={styles.statusBoxText}>Dərs planı aktivdir və cədvələ uyğun keçirilir.</Text>
                </View>
              </ScrollView>

              <View style={styles.footer}>
                {onTakeAttendance ? (
                  <ThriveButton
                    title="Davamiyyət yaz"
                    onPress={onTakeAttendance}
                    variant="primary"
                    style={{ flex: 1 }}
                  />
                ) : (
                  <ThriveButton
                    title="Bağla"
                    onPress={onClose}
                    variant="secondary"
                    style={{ flex: 1 }}
                  />
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.cardElevated,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  groupTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(76, 162, 181, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  infoVal: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.successLight,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.success,
    marginTop: Spacing.xs,
  },
  statusBoxText: {
    fontSize: 13,
    color: Colors.success,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
  },
});
