import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { X, Plus } from 'lucide-react-native';
import { Colors, Radius, Spacing } from '../../config/theme';
import { teacherService } from '../../services/teacherService';
import { TeacherGroupItem } from '../../types/teacher.types';
import { ThriveInput } from '../common/ThriveInput';
import { ThriveButton } from '../common/ThriveButton';

interface CreateAssignmentModalProps {
  visible: boolean;
  groups: TeacherGroupItem[];
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
  visible,
  groups,
  onClose,
  onSuccess,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!selectedGroupId || !title.trim()) {
      alert('Zəhmət olmasa qrup və tapşırıq başlığını qeyd edin.');
      return;
    }

    setSaving(true);
    const res = await teacherService.createAssignment(
      selectedGroupId,
      title.trim(),
      description.trim(),
      dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      Number(maxScore) || 100
    );
    setSaving(false);

    if (res.success) {
      setTitle('');
      setDescription('');
      onSuccess && onSuccess();
      onClose();
    } else {
      alert(res.error || 'Xəta baş verdi');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalSheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.header}>
            <Text style={styles.title}>Yeni Ev Tapşırığı Yarat</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            <Text style={styles.label}>Qrup Seçin</Text>
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
              label="Tapşırığın Başlığı"
              placeholder="Məs: SAT Math Bölmə 3 Sual 1-20"
              value={title}
              onChangeText={setTitle}
            />

            <ThriveInput
              label="Təsvir / Tələblər"
              placeholder="Tapşırıq haqqında ətraflı qeydlər..."
              multiline
              numberOfLines={3}
              style={{ height: 80, textAlignVertical: 'top' }}
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <ThriveInput
                  label="Son Tarix (YYYY-MM-DD)"
                  placeholder="2026-09-01"
                  value={dueDate}
                  onChangeText={setDueDate}
                />
              </View>
              <View style={{ width: 100 }}>
                <ThriveInput
                  label="Maks. Bal"
                  keyboardType="numeric"
                  value={maxScore}
                  onChangeText={setMaxScore}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <ThriveButton
              title="Ləğv et"
              variant="secondary"
              onPress={onClose}
              style={{ flex: 1 }}
            />
            <ThriveButton
              title="Tapşırığı Yarat"
              variant="primary"
              loading={saving}
              onPress={handleCreate}
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
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
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
    padding: 4,
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
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  groupChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
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
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
  },
});
