import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Bell, CheckCheck } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { notificationService } from '../../services/notificationService';
import { NotificationRow } from '../../types/database.types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { ThriveCard } from '../../components/common/ThriveCard';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonCardList } from '../../components/common/ThriveSkeleton';

interface NotificationsScreenProps {
  onBack: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack }) => {
  const { session } = useAuth();
  const { t, language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const userId = session?.userId;

  useEffect(() => {
    if (userId) {
      loadNotifications();

      const subscription = notificationService.subscribeToNotifications(userId, (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [userId]);

  const loadNotifications = async () => {
    if (!userId) return;
    try {
      const data = await notificationService.getNotifications(userId);
      setNotifications(data);
    } catch (e) {
      console.error('Error loading notifications:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    if (!userId) return;
    await notificationService.markAllAsRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleNotificationPress = async (item: NotificationRow) => {
    if (!item.is_read) {
      await notificationService.markAsRead(item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
      );
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getLocaleTag = () => {
    if (language === 'en') return 'en-US';
    if (language === 'ru') return 'ru-RU';
    return 'az-AZ';
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title={t('common.notifications')}
        subtitle={unreadCount > 0 ? `${unreadCount} ${t('common.pending').toLowerCase()}` : t('common.notifications')}
        showBack
        onBackPress={onBack}
      />

      {/* Filter and Mark All Read Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.filterGroup}>
          <TouchableOpacity
            onPress={() => setFilter('all')}
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              {t('common.all')} ({notifications.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter('unread')}
            style={[styles.filterChip, filter === 'unread' && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>
              {t('common.pending')} ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
            <CheckCheck size={16} color={Colors.primary} />
            <Text style={styles.markAllText}>{t('common.markAllRead')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {loading ? (
          <SkeletonCardList count={3} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={t('common.noNotifications')}
            description={t('common.noNotifications')}
          />
        ) : (
          filtered.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.75}
              onPress={() => handleNotificationPress(item)}
            >
              <ThriveCard
                style={[
                  styles.card,
                  !item.is_read && styles.unreadCard,
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconCircle}>
                    <Bell size={16} color={!item.is_read ? Colors.primary : Colors.textMuted} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.title, !item.is_read && styles.unreadTitle]}>
                      {item.title || t('common.notifications')}
                    </Text>
                    <Text style={styles.timeText}>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString(getLocaleTag(), {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </Text>
                  </View>
                  {!item.is_read && <View style={styles.unreadDot} />}
                </View>

                {item.message ? (
                  <Text style={styles.messageText}>{item.message}</Text>
                ) : null}
              </ThriveCard>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterGroup: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.cardElevated,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  unreadCard: {
    backgroundColor: '#0F2744',
    borderColor: 'rgba(76, 162, 181, 0.4)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  unreadTitle: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  timeText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  messageText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: Spacing.sm,
    paddingLeft: 40,
  },
});
