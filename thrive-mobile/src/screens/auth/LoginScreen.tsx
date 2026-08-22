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
import { Eye, EyeOff, Mail, Lock, Globe } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ThriveInput } from '../../components/common/ThriveInput';
import { ThriveButton } from '../../components/common/ThriveButton';
import { LanguagePickerModal } from '../../components/modals/LanguagePickerModal';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [langModalVisible, setLangModalVisible] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage(t('auth.emptyFields'));
      return;
    }

    setErrorMessage('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      if (res.error === 'unauthorizedRole') {
        setErrorMessage(t('auth.unauthorizedRole'));
      } else {
        setErrorMessage(t('auth.invalidCredentials'));
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.langBtn}
            onPress={() => setLangModalVisible(true)}
            activeOpacity={0.7}
          >
            <Globe size={18} color={Colors.primary} />
            <Text style={styles.langBtnText}>{t('common.language')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.brandSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>T</Text>
          </View>
          <Text style={styles.brandTitle}>THRIVE</Text>
          <Text style={styles.brandSubtitle}>{t('auth.loginSubtitle')}</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{t('auth.loginTitle')}</Text>

          {!!errorMessage && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <ThriveInput
            label={t('auth.emailLabel')}
            placeholder={t('auth.emailPlaceholder')}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={(text: string) => {
              setEmail(text);
              if (errorMessage) setErrorMessage('');
            }}
            leftIcon={<Mail size={18} color={Colors.textMuted} />}
          />

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
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  langBtnText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(76, 162, 181, 0.15)',
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  logoLetter: {
    fontSize: 36,
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
    marginBottom: Spacing.lg,
    textAlign: 'center',
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
