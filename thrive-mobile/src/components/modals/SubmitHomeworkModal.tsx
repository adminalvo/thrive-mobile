import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { FileText, X, Check, Send, Plus } from 'lucide-react-native';
import { Colors, Radius, Spacing } from '../../config/theme';
import { useLanguage } from '../../context/LanguageContext';
import { ThriveButton } from '../common/ThriveButton';
import { ThriveBadge } from '../common/ThriveBadge';
import { StudentAssignmentItem } from '../../types/student.types';
import { AttachmentFile } from '../../types/attachment.types';
import { filePickerService } from '../../utils/filePickerService';
import { AttachmentList } from '../common/AttachmentList';

interface SubmitHomeworkModalProps {
  visible: boolean;
  assignment: StudentAssignmentItem | null;
  onClose: () => void;
  onSubmit: (assignmentId: string, text: string, attachments: AttachmentFile[]) => Promise<void>;
}

export const SubmitHomeworkModal: React.FC<SubmitHomeworkModalProps> = ({
  visible,
  assignment,
  onClose,
  onSubmit,
}) => {
  const { t } = useLanguage();
  const [submissionText, setSubmissionText] = useState('');
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [pickingFile, setPickingFile] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!assignment) return null;

  // Unpack teacher's attachments from assignment description
  const { cleanText: teacherDesc, attachments: teacherMaterials } =
    filePickerService.unpackAttachments(assignment.description || '');

  const handlePickDocument = async () => {
    setPickingFile(true);
    try {
      const file = await filePickerService.pickDocument();
      if (file) {
        setAttachments([...attachments, file]);
      }
    } catch (e) {
      console.error('Error picking document:', e);
    } finally {
      setPickingFile(false);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const handleSend = async () => {
    if (!submissionText.trim() && attachments.length === 0) {
      setErrorMessage(t('auth.emptyFields'));
      return;
    }
    setErrorMessage('');

    setSubmitting(true);
    try {
      await onSubmit(assignment.id, submissionText, attachments);
      setSubmissionText('');
      setAttachments([]);
      onClose();
    } catch (e) {
      console.error('Error submitting homework:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalSheet}>
              <View style={styles.sheetHandle} />

              <View style={styles.header}>
                <View style={{ flex: 1 }}>
                  <ThriveBadge label={assignment.programName} variant="primary" />
                  <Text style={styles.title} numberOfLines={1}>
                    {assignment.title}
                  </Text>
                  <Text style={styles.subtitle}>{assignment.groupName}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                {/* Description and Teacher Materials Box */}
                {(!!teacherDesc || teacherMaterials.length > 0) && (
                  <View style={styles.descBox}>
                    <Text style={styles.descTitle}>{t('teacher.assignmentDescLabel')}:</Text>
                    {!!teacherDesc && <Text style={styles.descText}>{teacherDesc}</Text>}

                    {teacherMaterials.length > 0 && (
                      <View style={{ marginTop: Spacing.sm }}>
                        <AttachmentList
                          attachments={teacherMaterials}
                          readOnly
                          title={t('student.teacherMaterials')}
                        />
                      </View>
                    )}
                  </View>
                )}

                {/* Text answer input */}
                <Text style={styles.inputLabel}>{t('student.typeAnswer')}</Text>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={4}
                  placeholder={t('student.typeAnswer')}
                  placeholderTextColor={Colors.textMuted}
                  value={submissionText}
                  onChangeText={setSubmissionText}
                />

                {/* Attachments Section */}
                <Text style={styles.sectionLabel}>{t('student.solutionFiles')}</Text>
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handlePickDocument}
                    style={styles.attachmentBtn}
                  >
                    <Plus size={16} color={Colors.primary} />
                    <Text style={styles.attachmentBtnText}>
                      {pickingFile ? t('common.loading') : `+ ${t('attachments.attachDoc')}`}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* List of Attached items */}
                {attachments.length > 0 && (
                  <View style={styles.attachmentsContainer}>
                    <AttachmentList
                      attachments={attachments}
                      onRemove={handleRemoveAttachment}
                      title={t('attachments.attachmentPreview')}
                    />
                  </View>
                )}

                {!!errorMessage && (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                )}
              </ScrollView>

              <View style={styles.footer}>
                <ThriveButton
                  title={t('student.submitAssignment')}
                  onPress={handleSend}
                  loading={submitting}
                  variant="primary"
                  icon={<Send size={16} color="#FFFFFF" />}
                  style={{ width: '100%' }}
                />
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
    maxHeight: '90%',
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
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    marginBottom: Spacing.md,
  },
  descBox: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  descTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  descText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  textArea: {
    backgroundColor: '#0A1E38',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  attachmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: '#0F2A4A',
    borderWidth: 1,
    borderColor: 'rgba(76, 162, 181, 0.35)',
  },
  attachmentBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  attachmentsContainer: {
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  footer: {
    paddingTop: Spacing.xs,
  },
});
