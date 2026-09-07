import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { X, FileText, Plus, Calendar } from 'lucide-react-native';
import { Colors, Radius, Spacing } from '../../config/theme';
import { useLanguage } from '../../context/LanguageContext';
import { teacherService } from '../../services/teacherService';
import { TeacherGroupItem } from '../../types/teacher.types';
import { ThriveInput } from '../common/ThriveInput';
import { ThriveButton } from '../common/ThriveButton';
import { AttachmentFile } from '../../types/attachment.types';
import { filePickerService } from '../../utils/filePickerService';
import { AttachmentList } from '../common/AttachmentList';

interface CreateAssignmentModalProps {
  visible: boolean;
  groups: TeacherGroupItem[];
  assignmentToEdit?: {
    id: string;
    groupId: string;
    title: string;
    description?: string;
    dueDate?: string;
    maxScore?: number;
  } | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
  visible,
  groups,
  assignmentToEdit,
  onClose,
  onSuccess,
}) => {
  const { t } = useLanguage();

  const getDefaultDueDate = (daysAhead = 7) => {
    const d = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  };

  const isEditing = Boolean(assignmentToEdit);

  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(getDefaultDueDate(7));
  const [maxScore, setMaxScore] = useState('100');
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pickingFile, setPickingFile] = useState(false);

  useEffect(() => {
    if (visible) {
      if (assignmentToEdit) {
        setSelectedGroupId(assignmentToEdit.groupId || groups[0]?.id || '');
        setTitle(assignmentToEdit.title || '');
        const { cleanText, attachments: unpacked } = filePickerService.unpackAttachments(
          assignmentToEdit.description || ''
        );
        setDescription(cleanText);
        setAttachments(unpacked);
        setDueDate(assignmentToEdit.dueDate ? assignmentToEdit.dueDate.split('T')[0] : getDefaultDueDate(7));
        setMaxScore(String(assignmentToEdit.maxScore || 100));
      } else {
        setSelectedGroupId(groups[0]?.id || '');
        setTitle('');
        setDescription('');
        setDueDate(getDefaultDueDate(7));
        setMaxScore('100');
        setAttachments([]);
      }
    }
  }, [visible, assignmentToEdit]);

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

  const handlePresetDate = (days: number) => {
    setDueDate(getDefaultDueDate(days));
  };

  const handleSave = async () => {
    if (!selectedGroupId || !title.trim()) {
      alert(t('auth.emptyFields'));
      return;
    }

    setSaving(true);
    const finalDesc = filePickerService.packAttachments(description.trim(), attachments);

    if (isEditing && assignmentToEdit) {
      const res = await teacherService.updateAssignment(assignmentToEdit.id, {
        groupId: selectedGroupId,
        title: title.trim(),
        description: finalDesc,
        dueDate: dueDate.trim() || getDefaultDueDate(7),
        maxScore: Number(maxScore) || 100,
      });

      setSaving(false);
      if (res.success) {
        onSuccess && onSuccess();
        onClose();
      } else {
        alert(res.error || t('common.error'));
      }
    } else {
      const res = await teacherService.createAssignment(
        selectedGroupId,
        title.trim(),
        finalDesc,
        dueDate.trim() || getDefaultDueDate(7),
        Number(maxScore) || 100
      );

      setSaving(false);
      if (res.success) {
        setTitle('');
        setDescription('');
        setDueDate(getDefaultDueDate(7));
        setAttachments([]);
        onSuccess && onSuccess();
        onClose();
      } else {
        alert(res.error || t('common.error'));
      }
    }
  };

  const handleDelete = async () => {
    if (!assignmentToEdit) return;
    setDeleting(true);
    const res = await teacherService.deleteAssignment(assignmentToEdit.id);
    setDeleting(false);
    if (res.success) {
      onSuccess && onSuccess();
      onClose();
    } else {
      alert(res.error || t('common.error'));
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalSheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.header}>
            <Text style={styles.title}>
              {isEditing ? "Tapşırığı Redaktə Et" : t('teacher.createAssignmentModalTitle')}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>{t('teacher.selectGroup')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupScroll}>
              {groups.map((g) => {
                const isSelected = g.id === selectedGroupId;
                return (
                  <TouchableOpacity
                    key={g.id}
                    onPress={() => setSelectedGroupId(g.id)}
                    style={[styles.groupChip, isSelected && styles.groupChipSelected]}
                  >
                    <Text style={[styles.groupChipText, isSelected && styles.groupChipTextSelected]}>
                      {g.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <ThriveInput
              label={t('teacher.assignmentTitleLabel')}
              placeholder={t('teacher.assignmentTitlePlaceholder')}
              value={title}
              onChangeText={setTitle}
            />

            <ThriveInput
              label={t('teacher.assignmentDescLabel')}
              placeholder={t('teacher.assignmentDescPlaceholder')}
              multiline
              numberOfLines={3}
              style={{ height: 80, textAlignVertical: 'top' }}
              value={description}
              onChangeText={setDescription}
            />

            {/* Attachments Section */}
            <Text style={styles.label}>{t('attachments.studyMaterialsTitle')}</Text>
            <View style={styles.attachSection}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handlePickDocument}
                style={styles.attachBtn}
              >
                <Plus size={16} color={Colors.primary} />
                <Text style={styles.attachBtnText}>
                  {pickingFile ? t('common.loading') : `+ ${t('attachments.attachDoc')}`}
                </Text>
              </TouchableOpacity>

              <AttachmentList
                attachments={attachments}
                onRemove={handleRemoveAttachment}
                title={t('attachments.attachedFilesLabel')}
              />
            </View>

            {/* Quick Due Date Presets */}
            <Text style={styles.label}>{t('teacher.dueDateLabel')}</Text>
            <View style={styles.presetRow}>
              {[
                { label: '+3d', days: 3 },
                { label: '+7d', days: 7 },
                { label: '+14d', days: 14 },
                { label: '+30d', days: 30 },
              ].map((p) => {
                const isCurrent = dueDate === getDefaultDueDate(p.days);
                return (
                  <TouchableOpacity
                    key={p.days}
                    onPress={() => handlePresetDate(p.days)}
                    style={[styles.presetChip, isCurrent && styles.presetChipActive]}
                  >
                    <Text style={[styles.presetChipText, isCurrent && styles.presetChipTextActive]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <ThriveInput
                  label={t('teacher.dueDateLabel')}
                  placeholder="YYYY-MM-DD"
                  value={dueDate}
                  onChangeText={setDueDate}
                  leftIcon={<Calendar size={16} color={Colors.primary} />}
                />
              </View>
              <View style={{ width: 110 }}>
                <ThriveInput
                  label={t('teacher.maxScoreLabel')}
                  keyboardType="numeric"
                  value={maxScore}
                  onChangeText={setMaxScore}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {isEditing && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleDelete}
                disabled={deleting}
                style={styles.deleteBtn}
              >
                <X size={18} color={Colors.danger} />
              </TouchableOpacity>
            )}

            <ThriveButton
              title={t('common.cancel')}
              variant="secondary"
              onPress={onClose}
              style={{ flex: 1 }}
            />
            <ThriveButton
              title={isEditing ? t('common.save') : t('teacher.createAssignmentSubmit')}
              variant="primary"
              loading={saving}
              onPress={handleSave}
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
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  body: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  groupScroll: {
    marginBottom: Spacing.md,
  },
  groupChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.full,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  groupChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  groupChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  groupChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  attachSection: {
    marginBottom: Spacing.md,
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: 'rgba(76, 162, 181, 0.12)',
    borderRadius: Radius.md,
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(76, 162, 181, 0.3)',
  },
  attachBtnText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
  },
  presetRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  presetChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetChipActive: {
    backgroundColor: 'rgba(76, 162, 181, 0.2)',
    borderColor: Colors.primary,
  },
  presetChipText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  presetChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    alignItems: 'center',
  },
  deleteBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
});
