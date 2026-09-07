import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';
import { NotificationRow } from '../types/database.types';
import { cacheManager } from '../utils/cacheManager';

export interface PushNotificationPayload {
  to?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
}

export const notificationService = {
  /**
   * Request push permission and get Expo Push Token
   */
  async registerForPushNotificationsAsync(userId?: string): Promise<string | null> {
    try {
      let Notifications: any;
      try {
        Notifications = require('expo-notifications');
      } catch {
        return null;
      }

      if (Platform.OS === 'web') {
        return null;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'thrive-mobile',
      });
      const token = tokenData.data;

      if (token) {
        await AsyncStorage.setItem('expo_push_token', token);
        if (userId) {
          await this.saveTokenToDatabase(userId, token);
        }
      }

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4CA2B5',
        });
      }

      return token;
    } catch (e) {
      console.log('Push notification registration error:', e);
      return null;
    }
  },

  async saveTokenToDatabase(userId: string, token: string): Promise<void> {
    try {
      await supabase
        .from('user_push_tokens')
        .upsert({ user_id: userId, token, updated_at: new Date().toISOString() });
    } catch {}
  },

  async triggerLocalNotification(title: string, body: string, data?: Record<string, any>): Promise<void> {
    try {
      let Notifications: any;
      try {
        Notifications = require('expo-notifications');
      } catch {
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
        },
        trigger: null,
      });
    } catch (e) {
      console.log('Local notification error:', e);
    }
  },

  async sendPushNotification(payload: PushNotificationPayload): Promise<boolean> {
    try {
      if (!payload.to) return false;

      const message = {
        to: payload.to,
        sound: 'default',
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
      };

      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      return res.ok;
    } catch (e) {
      console.error('Error sending push notification:', e);
      return false;
    }
  },

  // -------------------------------------------------------------
  // DATABASE NOTIFICATIONS (IN-APP INBOX)
  // -------------------------------------------------------------

  async getNotifications(userId: string, forceRefresh = false): Promise<NotificationRow[]> {
    const cacheKey = `notifications_${userId}`;
    const result = await cacheManager.fetchWithCache<NotificationRow[]>(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching notifications:', error);
          return [];
        }

        return data || [];
      },
      60 * 1000,
      forceRefresh
    );

    return result.data;
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
    } catch {
      return 0;
    }
  },

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      return !error;
    } catch {
      return false;
    }
  },

  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      await cacheManager.invalidate(`notifications_${userId}`);
      return !error;
    } catch {
      return false;
    }
  },

  subscribeToNotifications(
    userId: string,
    onNotificationReceived: (notification: NotificationRow) => void
  ) {
    const channel = supabase
      .channel(`public:notifications:user_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onNotificationReceived(payload.new as NotificationRow);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  },
};
