import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  X,
  Calendar,
  BookOpen,
  ChevronRight,
  TrendingUp,
} from 'lucide-react-native';
import { Colors, Radius, Spacing } from '../../config/theme';
import { useLanguage } from '../../context/LanguageContext';
import { ChildOverview } from '../../types/parent.types';
import { ThriveAvatar } from '../common/ThriveAvatar';
import { ThriveBadge } from '../common/ThriveBadge';
import { ThriveButton } from '../common/ThriveButton';
import { ThriveProgressBar } from '../common/ThriveProgressBar';

interface ChildDetailModalProps {
  visible: boolean;
  child: ChildOverview | null;
  isActive: boolean;
  onClose: () => void;
  onSelectAsActive: () => void;
  onOpenSchedule: () => void;
  onOpenProgress: () => void;
}

export const ChildDetailModal: React.FC<ChildDetailModalProps> = ({
  visible,
  child,
  isActive,
  onClose,
  onSelectAsActive,
  onOpenSchedule,
  onOpenProgress,
}) => {
  const { t, language } = useLanguage();

  if (!child) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalSheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.header}>
            <View style={styles.headerTitleCol}>
              <Text style={styles.sheetTitle}>{t('student.profileTitle')}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Hero Profile Card */}
            <View style={styles.heroCard}>
              <ThriveAvatar name={child.fullName} size={72} />
              <Text style={styles.childName}>{child.fullName}</Text>
              <Text style={styles.childEmail}>{child.email || t('common.notSpecified')}</Text>

              <View style={styles.badgeRow}>
                {isActive ? (
                  <ThriveBadge label={t('parent.activeBadge')} variant="success" />
                ) : (
                  <TouchableOpacity activeOpacity={0.7} onPress={onSelectAsActive}>
                    <ThriveBadge label={t('parent.setActiveChild')} variant="primary" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Enrolled Programs */}
            <Text style={styles.sectionLabel}>{t('teacher.assignedGroups')}</Text>
            <View style={styles.tagsContainer}>
              {child.programs && child.programs.length > 0 ? (
                child.programs.map((p, i) => (
                  <View key={i} style={styles.programTag}>
                    <BookOpen size={14} color={Colors.primary} />
                    <Text style={styles.programTagText}>{p}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.mutedText}>{t('common.generalProgram')}</Text>
              )}
            </View>

            {/* Attendance Snapshot */}
            <Text style={styles.sectionLabel}>{t('student.attendanceRate')}</Text>
            <View style={styles.statCard}>
              <View style={styles.attHeaderRow}>
                <Text style={styles.attRateBig}>{child.attendanceRate}%</Text>
                <Text style={styles.attRateSub}>
                  {child.stats?.presentCount || 0} {t('teacher.presentShort')} • {child.stats?.absentCount || 0} {t('teacher.absentShort')}
                </Text>
              </View>
              <ThriveProgressBar progress={child.attendanceRate} color={Colors.success} height={8} />
            </View>

            {/* Quick Navigation Action Buttons */}
            <Text style={styles.sectionLabel}>{t('teacher.quickActions')}</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  onClose();
                  onOpenSchedule();
                }}
                style={styles.actionCard}
              >
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(76, 162, 181, 0.15)' }]}>
                  <Calendar size={20} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionTitle}>{t('parent.viewScheduleCardTitle')}</Text>
                  <Text style={styles.actionDesc}>{t('parent.viewScheduleCardSub')}</Text>
                </View>
                <ChevronRight size={18} color={Colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  onClose();
                  onOpenProgress();
                }}
                style={styles.actionCard}
              >
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <TrendingUp size={20} color={Colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionTitle}>{t('parent.viewProgressCardTitle')}</Text>
                  <Text style={styles.actionDesc}>{t('parent.viewProgressCardSub')}</Text>
                </View>
                <ChevronRight size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {!isActive && (
              <ThriveButton
                title={t('parent.makeThisChildActive')}
                variant="primary"
                onPress={onSelectAsActive}
                style={{ flex: 1 }}
              />
            )}
            <ThriveButton
              title={t('common.close')}
              variant="secondary"
              onPress={onClose}
              style={{ flex: isActive ? 1 : 0.8 }}
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
  headerTitleCol: {
    flex: 1,
  },
  sheetTitle: {
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
  heroCard: {
    backgroundColor: '#0F2744',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76, 162, 181, 0.3)',
    marginBottom: Spacing.md,
  },
  childName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  childEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    marginTop: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs + 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  programTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0A1E38',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(76, 162, 181, 0.25)',
  },
  programTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  mutedText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  statCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  attHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  attRateBig: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.success,
  },
  attRateSub: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  actionGrid: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingTop: Spacing.xs,
  },
});
