import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { Bell, Calendar, X } from 'lucide-react-native';
import { Colors, Radius, Spacing } from '../../config/theme';
import { useLanguage } from '../../context/LanguageContext';
import { announcementService, CenterAnnouncement } from '../../services/announcementService';
import { ThriveBadge } from '../common/ThriveBadge';
import { ThriveButton } from '../common/ThriveButton';

interface AnnouncementsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AnnouncementsModal: React.FC<AnnouncementsModalProps> = ({ visible, onClose }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CenterAnnouncement[]>([]);

  useEffect(() => {
    if (visible) {
      loadAnnouncements();
    }
  }, [visible]);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await announcementService.getAnnouncements();
      setItems(data);
    } catch (e) {
      console.error('Error loading announcements:', e);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'exam':
        return { label: t('announcements.examNotice'), variant: 'warning' as const };
      case 'seminar':
        return { label: t('announcements.seminarNotice'), variant: 'primary' as const };
      case 'holiday':
        return { label: t('announcements.holidayNotice'), variant: 'success' as const };
      default:
        return { label: t('announcements.important'), variant: 'danger' as const };
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
                <View style={styles.headerTitleRow}>
                  <View style={styles.iconCircle}>
                    <Bell size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.title}>{t('announcements.modalTitle')}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.loadingText}>{t('common.loading')}</Text>
                </View>
              ) : (
                <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                  {items.length === 0 ? (
                    <Text style={styles.emptyText}>{t('announcements.noAnnouncements')}</Text>
                  ) : (
                    items.map((item) => {
                      const badgeInfo = getCategoryBadge(item.category);

                      return (
                        <View
                          key={item.id}
                          style={[
                            styles.card,
                            item.isImportant && styles.cardImportant,
                          ]}
                        >
                          <View style={styles.cardHeader}>
                            <ThriveBadge label={badgeInfo.label} variant={badgeInfo.variant} />
                            <View style={styles.dateRow}>
                              <Calendar size={12} color={Colors.textMuted} />
                              <Text style={styles.dateText}>{item.publishedAt}</Text>
                            </View>
                          </View>

                          <Text style={styles.cardTitle}>{item.title}</Text>
                          <Text style={styles.cardBody}>{item.body}</Text>
                        </View>
                      );
                    })
                  )}
                </ScrollView>
              )}

              <View style={styles.footer}>
                <ThriveButton
                  title={t('common.close')}
                  variant="secondary"
                  onPress={onClose}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(76, 162, 181, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  list: {
    marginVertical: Spacing.sm,
  },
  loadingContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    padding: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardImportant: {
    borderColor: 'rgba(76, 162, 181, 0.4)',
    backgroundColor: '#0F2744',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  cardBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
  footer: {
    paddingTop: Spacing.sm,
  },
});
