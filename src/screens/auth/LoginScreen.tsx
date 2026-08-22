import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Eye, EyeOff, Mail, Phone, Lock, Globe, ChevronLeft } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ThriveInput } from '../../components/common/ThriveInput';
import { ThriveButton } from '../../components/common/ThriveButton';
import { LanguagePickerModal } from '../../components/modals/LanguagePickerModal';

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
  const [errorMessage, setErrorMessage] = useState('');
  const [langModalVisible, setLangModalVisible] = useState(false);

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

    if (!res.success) {
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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

        {/* Brand Section */}
        <View style={styles.brandSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>T</Text>
          </View>
          <Text style={styles.brandTitle}>THRIVE</Text>
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
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardElevated,
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
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.cardElevated,
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
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0F2744',
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  logoLetter: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.primary,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
    color: Colors.textPrimary,
  },
  brandSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
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
  },
});
