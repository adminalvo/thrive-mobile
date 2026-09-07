import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Cross-platform Safe Haptic Feedback Helper
 * Provides crisp physical feedback on iOS and Android devices,
 * with no-op on Web preview.
 */
export const hapticService = {
  light(): void {
    if (Platform.OS === 'web') return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  },

  medium(): void {
    if (Platform.OS === 'web') return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
  },

  selection(): void {
    if (Platform.OS === 'web') return;
    try {
      Haptics.selectionAsync();
    } catch {}
  },

  success(): void {
    if (Platform.OS === 'web') return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  },

  error(): void {
    if (Platform.OS === 'web') return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {}
  },
};
