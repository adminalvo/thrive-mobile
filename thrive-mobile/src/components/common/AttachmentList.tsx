import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FileText, Eye, X, FileCheck } from 'lucide-react-native';
import { Colors, Radius, Spacing } from '../../config/theme';
import { AttachmentFile } from '../../types/attachment.types';
import { filePickerService } from '../../utils/filePickerService';
import { useLanguage } from '../../context/LanguageContext';

interface AttachmentListProps {
  attachments: AttachmentFile[];
  onRemove?: (id: string) => void;
  readOnly?: boolean;
  title?: string;
}

export const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  onRemove,
  readOnly = false,
  title,
}) => {
  const { t } = useLanguage();

  if (!attachments || attachments.length === 0) return null;

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'pdf':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', label: 'PDF' };
      case 'image':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', label: 'IMG' };
      case 'doc':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', label: 'DOC' };
      default:
        return { bg: 'rgba(76, 162, 181, 0.15)', text: Colors.primary, label: 'FILE' };
    }
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}

      <View style={styles.list}>
        {attachments.map((file) => {
          const badge = getBadgeStyle(file.type);

          return (
            <View key={file.id} style={styles.card}>
              <View style={styles.leftRow}>
                <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.typeText, { color: badge.text }]}>{badge.label}</Text>
                </View>

                <View style={styles.fileMeta}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text style={styles.fileSize}>{file.size || '1.0 MB'}</Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                {file.dataUri ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => filePickerService.openOrDownload(file)}
                    style={styles.openBtn}
                  >
                    <Eye size={14} color={Colors.primary} />
                    <Text style={styles.openBtnText}>{t('common.view')}</Text>
                  </TouchableOpacity>
                ) : null}

                {!readOnly && onRemove ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onRemove(file.id)}
                    style={styles.removeBtn}
                  >
                    <X size={14} color={Colors.danger} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs + 2,
  },
  list: {
    gap: Spacing.xs + 2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A1E38',
    borderRadius: Radius.md,
    padding: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(76, 162, 181, 0.25)',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    marginRight: Spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  fileMeta: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  fileSize: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(76, 162, 181, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(76, 162, 181, 0.3)',
  },
  openBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  removeBtn: {
    padding: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: Radius.sm,
  },
});
