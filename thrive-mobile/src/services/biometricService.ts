import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BIOMETRIC_ENABLED_KEY = '@thrive_biometric_enabled';
const BIOMETRIC_CRED_USER = 'thrive_bio_user';
const BIOMETRIC_CRED_PASS = 'thrive_bio_pass';

export const biometricService = {
  /**
   * Checks whether the device hardware supports biometrics and has enrolled records
   */
  async isBiometricAvailable(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') return false;
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (e) {
      console.warn('Biometric check failed:', e);
      return false;
    }
  },

  /**
   * Returns biometric type: 'face' | 'fingerprint' | 'biometric'
   */
  async getBiometricType(): Promise<'face' | 'fingerprint' | 'biometric'> {
    try {
      if (Platform.OS === 'web') return 'biometric';
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'face';
      }
      if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'fingerprint';
      }
      return 'biometric';
    } catch {
      return 'biometric';
    }
  },

  /**
   * Triggers the OS Face ID / Fingerprint authentication prompt
   */
  async authenticate(promptMessage = 'Thrive'): Promise<boolean> {
    try {
      if (Platform.OS === 'web') return false;
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Ləğv et',
        fallbackLabel: 'Şifrə ilə daxil olun',
        disableDeviceFallback: false,
      });
      return result.success;
    } catch (e) {
      console.warn('Biometric auth error:', e);
      return false;
    }
  },

  /**
   * Save user credentials securely for biometric login
   */
  async saveCredentials(identifier: string, pass: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(BIOMETRIC_CRED_USER, identifier);
        await AsyncStorage.setItem(BIOMETRIC_CRED_PASS, pass);
      } else {
        await SecureStore.setItemAsync(BIOMETRIC_CRED_USER, identifier);
        await SecureStore.setItemAsync(BIOMETRIC_CRED_PASS, pass);
      }
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
    } catch (e) {
      console.warn('Failed to save biometric credentials:', e);
    }
  },

  /**
   * Retrieve saved biometric credentials
   */
  async getCredentials(): Promise<{ identifier: string; pass: string } | null> {
    try {
      let identifier: string | null = null;
      let pass: string | null = null;

      if (Platform.OS === 'web') {
        identifier = await AsyncStorage.getItem(BIOMETRIC_CRED_USER);
        pass = await AsyncStorage.getItem(BIOMETRIC_CRED_PASS);
      } else {
        identifier = await SecureStore.getItemAsync(BIOMETRIC_CRED_USER);
        pass = await SecureStore.getItemAsync(BIOMETRIC_CRED_PASS);
      }

      if (identifier && pass) {
        return { identifier, pass };
      }
      return null;
    } catch (e) {
      console.warn('Failed to get biometric credentials:', e);
      return null;
    }
  },

  /**
   * Check if biometric sign-in is enabled by the user
   */
  async isEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      if (enabled !== 'true') return false;
      const creds = await this.getCredentials();
      return !!creds;
    } catch {
      return false;
    }
  },

  /**
   * Disable and clear biometric credentials
   */
  async disable(): Promise<void> {
    try {
      await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(BIOMETRIC_CRED_USER);
        await AsyncStorage.removeItem(BIOMETRIC_CRED_PASS);
      } else {
        await SecureStore.deleteItemAsync(BIOMETRIC_CRED_USER);
        await SecureStore.deleteItemAsync(BIOMETRIC_CRED_PASS);
      }
    } catch (e) {
      console.warn('Failed to disable biometrics:', e);
    }
  },
};
