import { supabase } from '../config/supabase';
import { NotificationRow } from '../types/database.types';

export const notificationService = {
  async getNotifications(userId: string): Promise<NotificationRow[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data as NotificationRow[];
    } catch (e) {
      console.error('Error fetching notifications:', e);
      return [];
    }
  },

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) return 0;
      return count || 0;
    } catch (e) {
      return 0;
    }
  },

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    } catch (e) {
      console.error('Error marking notification as read:', e);
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId);
    } catch (e) {
      console.error('Error marking all notifications as read:', e);
    }
  },

  subscribeToNotifications(userId: string, onNewNotification: (n: NotificationRow) => void) {
    return supabase
      .channel(`public:notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onNewNotification(payload.new as NotificationRow);
        }
      )
      .subscribe();
  },
};
