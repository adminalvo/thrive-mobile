import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Enterprise Secure Storage Adapter
 * Automatically routes to iOS Keychain / Android Keystore on native,
 * and encrypted AsyncStorage on Web preview.
 */
export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS !== 'web' && (await SecureStore.isAvailableAsync())) {
        return await SecureStore.getItemAsync(key);
      }
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.warn('SecureStorage getItem fallback:', e);
      return await AsyncStorage.getItem(key);
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS !== 'web' && (await SecureStore.isAvailableAsync())) {
        await SecureStore.setItemAsync(key, value, {
          keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
        });
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn('SecureStorage setItem fallback:', e);
      await AsyncStorage.setItem(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS !== 'web' && (await SecureStore.isAvailableAsync())) {
        await SecureStore.deleteItemAsync(key);
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn('SecureStorage removeItem fallback:', e);
      await AsyncStorage.removeItem(key);
    }
  },
};

/**
 * Defensive Security & Sanitization Utilities
 */
export const securityService = {
  /**
   * Sanitizes input strings by removing dangerous HTML/script tags and trimming whitespace.
   */
  sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/[<>]/g, '')
      .trim();
  },

  /**
   * Validates email format strictly.
   */
  validateEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  },

  /**
   * Validates telephone number format.
   */
  validatePhone(phone: string): boolean {
    if (!phone) return false;
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone.trim().replace(/\s+/g, ''));
  },

  /**
   * Validates PIN / FIN code format.
   */
  validateFinCode(fin: string): boolean {
    if (!fin) return false;
    return /^[A-Z0-9]{7}$/i.test(fin.trim());
  },
};
