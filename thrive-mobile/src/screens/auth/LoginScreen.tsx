import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { Eye, EyeOff, Mail, Phone, Lock, Globe, ChevronLeft, UserCheck } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { biometricService } from '../../services/biometricService';
import { ThriveInput } from '../../components/common/ThriveInput';
import { ThriveButton } from '../../components/common/ThriveButton';
import { LanguagePickerModal } from '../../components/modals/LanguagePickerModal';

const { Image, Dimensions } = require('react-native');

interface LoginScreenProps {
  onBackToWelcome?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onBackToWelcome }) => {
  const { login } = useAuth();
  const { t, language } = useLanguage();

  const [inputIdentifier, setInputIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    Dimensions?.get ? Dimensions.get('window').width : 375
  );

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    checkBiometrics();

    if (Dimensions?.addEventListener) {
      const sub = Dimensions.addEventListener('change', (event: any) => {
        if (event?.window?.width) {
          setWindowWidth(event.window.width);
        }
      });
      return () => sub?.remove?.();
    }
  }, []);

  const checkBiometrics = async () => {
    const isAvail = await biometricService.isBiometricAvailable();
    const isEnabled = await biometricService.isEnabled();
    setHasBiometrics(isAvail && isEnabled);
  };

  const handleBiometricLogin = async () => {
    setBioLoading(true);
    setErrorMessage('');
    const success = await biometricService.authenticate(t('auth.biometricPrompt'));
    if (success) {
      const creds = await biometricService.getCredentials();
      if (creds) {
        const res = await login(creds.identifier, creds.pass);
        if (!res.success) {
          setErrorMessage(t('auth.invalidCredentials'));
        }
      }
    }
    setBioLoading(false);
  };

  // Detect whether the user is typing a phone number or an email
  const trimmed = inputIdentifier.trim();
  const isPhone = /^[+0-9\s-]+$/.test(trimmed) && trimmed.length > 2;

  const handleLogin = async () => {
    if (!trimmed || !password.trim()) {
      setErrorMessage(t('auth.emptyFields'));
      return;
    }

    setErrorMessage('');
    setLoading(true);

    const res = await login(trimmed, password);
    setLoading(false);

    if (res.success) {
      // Save credentials for biometric login on future launches
      await biometricService.saveCredentials(trimmed, password);
    } else {
      if (res.error === 'unauthorizedRole') {
        setErrorMessage(t('auth.unauthorizedRole'));
      } else {
        setErrorMessage(t('auth.invalidCredentials'));
      }
    }
  };

  const getLanguageLabel = () => {
    if (language === 'az') return 'AZ 🇦🇿';
    if (language === 'en') return 'EN 🇬🇧';
    return 'RU 🇷🇺';
  };

  // Tablet responsiveness: max container width 480
  const isTablet = windowWidth > 600;
  const contentWidth = isTablet ? 480 : '100%';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.responsiveWrapper, { width: contentWidth as any }]}>
          {/* Top Navigation Bar */}
          <View style={styles.topBar}>
            {onBackToWelcome ? (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={onBackToWelcome}
                activeOpacity={0.7}
              >
                <ChevronLeft size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            ) : (
              <View />
            )}

            <TouchableOpacity
              style={styles.langBtn}
              onPress={() => setLangModalVisible(true)}
              activeOpacity={0.7}
            >
              <Globe size={16} color={Colors.primary} />
              <Text style={styles.langBtnText}>{getLanguageLabel()}</Text>
            </TouchableOpacity>
          </View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Thrive Logo Section */}
            <View style={styles.brandSection}>
              <View style={styles.logoWrapper}>
                <Image
                  source={require('../../../assets/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.brandSubtitle}>{t('auth.loginSubtitle')}</Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>{t('auth.loginTitle')}</Text>

              {!!errorMessage && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              {/* Identifier Input (Phone or Email) */}
              <ThriveInput
                label={t('auth.emailLabel')}
                placeholder={t('auth.emailPlaceholder')}
                autoCapitalize="none"
                keyboardType={isPhone ? 'phone-pad' : 'email-address'}
                value={inputIdentifier}
                onChangeText={(text: string) => {
                  setInputIdentifier(text);
                  if (errorMessage) setErrorMessage('');
                }}
                leftIcon={
                  isPhone ? (
                    <Phone size={18} color={Colors.primary} />
                  ) : (
                    <Mail size={18} color={Colors.textMuted} />
                  )
                }
              />

              {trimmed.length > 3 && (
                <View style={styles.detectedBadgeRow}>
                  <Text style={styles.detectedText}>
                    {isPhone ? `📱 ${t('auth.phoneDetected')}` : `✉️ ${t('auth.emailDetected')}`}
                  </Text>
                </View>
              )}

              {/* Password Input */}
              <ThriveInput
                label={t('auth.passwordLabel')}
                placeholder={t('auth.passwordPlaceholder')}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text: string) => {
                  setPassword(text);
                  if (errorMessage) setErrorMessage('');
                }}
                leftIcon={<Lock size={18} color={Colors.textMuted} />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                    {showPassword ? (
                      <EyeOff size={18} color={Colors.textMuted} />
                    ) : (
                      <Eye size={18} color={Colors.textMuted} />
                    )}
                  </TouchableOpacity>
                }
              />

              <ThriveButton
                title={t('auth.loginBtn')}
                onPress={handleLogin}
                loading={loading}
                size="lg"
                style={{ marginTop: Spacing.sm }}
              />

              {/* Biometric / Face ID Login Button */}
              {hasBiometrics && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleBiometricLogin}
                  style={styles.biometricBtn}
                >
                  <UserCheck size={20} color={Colors.primary} />
                  <Text style={styles.biometricBtnText}>
                    {bioLoading ? t('common.loading') : t('auth.faceIdLogin')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Footer Developed by HacTag */}
            <View style={styles.footerBrand}>
              <Text style={styles.developedByText}>Developed by HacTag</Text>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      <LanguagePickerModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  responsiveWrapper: {
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: '#0F2744',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: '#0F2744',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  langBtnText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoWrapper: {
    width: 240,
    height: 85,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  brandSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(76, 162, 181, 0.25)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  detectedBadgeRow: {
    marginTop: -8,
    marginBottom: Spacing.sm,
  },
  detectedText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  errorBox: {
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: Spacing.md,
    paddingVertical: 12,
    borderRadius: Radius.lg,
    backgroundColor: '#0F2A4A',
    borderWidth: 1,
    borderColor: 'rgba(76, 162, 181, 0.35)',
  },
  biometricBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  footerBrand: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  developedByText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
});
