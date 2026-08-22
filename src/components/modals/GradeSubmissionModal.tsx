import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { Colors, Radius, Spacing } from '../../config/theme';
import { useLanguage } from '../../context/LanguageContext';
import { TeacherSubmissionToGrade } from '../../types/teacher.types';
import { teacherService } from '../../services/teacherService';
import { ThriveInput } from '../common/ThriveInput';
import { ThriveButton } from '../common/ThriveButton';
import { ThriveBadge } from '../common/ThriveBadge';

interface GradeSubmissionModalProps {
  visible: boolean;
  submission: TeacherSubmissionToGrade | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const GradeSubmissionModal: React.FC<GradeSubmissionModalProps> = ({
  visible,
  submission,
  onClose,
  onSuccess,
}) => {
  const { t } = useLanguage();

  if (!submission) return null;

  const [score, setScore] = useState<string>(
    submission.score !== null && submission.score !== undefined ? String(submission.score) : ''
  );
  const [feedback, setFeedback] = useState<string>(submission.feedback || '');
  const [saving, setSaving] = useState(false);

  const handleSaveGrade = async () => {
    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 0 || numScore > submission.maxScore) {
      alert(t('teacher.scoreRangeError', { max: submission.maxScore }));
      return;
    }

    setSaving(true);
    const res = await teacherService.gradeSubmission(submission.submissionId, numScore, feedback);
    setSaving(false);
    if (res.success) {
      onSuccess && onSuccess();
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalSheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.header}>
            <View>
              <ThriveBadge label={submission.groupName} variant="primary" />
              <Text style={styles.title}>{submission.studentName}</Text>
              <Text style={styles.subtitle}>{submission.assignmentTitle}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            {submission.submissionText ? (
              <View style={styles.answerBox}>
                <Text style={styles.answerLabel}>{t('teacher.studentAnswerLabel')}</Text>
                <Text style={styles.answerText}>{submission.submissionText}</Text>
              </View>
            ) : null}

            <ThriveInput
              label={t('teacher.finalScoreLabel', { max: submission.maxScore })}
              placeholder={`0 - ${submission.maxScore}`}
              keyboardType="numeric"
              value={score}
              onChangeText={setScore}
            />

            <ThriveInput
              label={t('teacher.teacherFeedbackLabel')}
              placeholder={t('teacher.teacherFeedbackPlaceholder')}
              multiline
              numberOfLines={3}
              style={{ height: 80, textAlignVertical: 'top' }}
              value={feedback}
              onChangeText={setFeedback}
            />
          </ScrollView>

          <View style={styles.footer}>
            <ThriveButton
              title={t('common.cancel')}
              variant="secondary"
              onPress={onClose}
              style={{ flex: 1 }}
            />
            <ThriveButton
              title={t('teacher.confirmGradeBtn')}
              variant="success"
              loading={saving}
              onPress={handleSaveGrade}
              style={{ flex: 2 }}
            />
          </View>
        </View>
      </View>
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
    maxHeight: '85%',
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
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    marginBottom: Spacing.md,
  },
  answerBox: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  answerLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
  },
});
