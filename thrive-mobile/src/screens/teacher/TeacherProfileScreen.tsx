import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Mail,
  Phone,
  Globe,
  LogOut,
  ChevronRight,
  Lock,
  UserCheck,
  FileText,
  Plus,
  Shield,
} from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { biometricService } from '../../services/biometricService';
import { HeaderBar } from '../../components/common/HeaderBar';
import { ThriveAvatar } from '../../components/common/ThriveAvatar';
import { ThriveCard } from '../../components/common/ThriveCard';
import { ThriveBadge } from '../../components/common/ThriveBadge';
import { ThriveRoleBadge } from '../../components/common/ThriveRoleBadge';
import { ThriveButton } from '../../components/common/ThriveButton';
import { ThriveToggle } from '../../components/common/ThriveToggle';
import { LanguagePickerModal } from '../../components/modals/LanguagePickerModal';
import { ChangePasswordModal } from '../../components/modals/ChangePasswordModal';
import { FAQModal } from '../../components/modals/FAQModal';
import { TermsModal } from '../../components/modals/TermsModal';
import { filePickerService } from '../../utils/filePickerService';

const { Image } = require('react-native');

export const TeacherProfileScreen: React.FC = () => {
  const { session, logout } = useAuth();
  const { t, language } = useLanguage();

  const [langModalVisible, setLangModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [faqModalVisible, setFaqModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);

  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [biometricsSupported, setBiometricsSupported] = useState(false);
  const [allowScreenshot, setAllowScreenshot] = useState(true);
  const [customAvatarUri, setCustomAvatarUri] = useState<string | null>(null);

  const profile = session?.profile;
  const userId = session?.userId;
  const fullName = `${profile?.first_name || t('common.teacher')} ${profile?.last_name || ''}`.trim();

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    if (!userId) return;
    try {
      const [isAvail, isEn, savedScr, savedAvatar] = await Promise.all([
        biometricService.isBiometricAvailable(),
        biometricService.isEnabled(),
        AsyncStorage.getItem(`app_screenshot_${userId}`),
        AsyncStorage.getItem(`user_avatar_${userId}`),
      ]);
      setBiometricsSupported(isAvail);
      setBiometricsEnabled(isEn);
      if (savedScr !== null) setAllowScreenshot(savedScr === 'true');
      if (savedAvatar) setCustomAvatarUri(savedAvatar);
    } catch (e) {
      console.error('Error loading teacher settings:', e);
    }
  };

  const handleToggleBiometrics = async (val: boolean) => {
    if (!val) {
      await biometricService.disable();
      setBiometricsEnabled(false);
    } else {
      const authenticated = await biometricService.authenticate(t('auth.biometricPrompt'));
      if (authenticated) {
        setBiometricsEnabled(true);
      }
    }
  };

  const handleToggleScreenshot = async (val: boolean) => {
    setAllowScreenshot(val);
    if (userId) {
      await AsyncStorage.setItem(`app_screenshot_${userId}`, String(val));
    }
  };

  const handlePickAvatar = async () => {
    try {
      const file = await filePickerService.pickDocument();
      if (file && file.dataUri) {
        setCustomAvatarUri(file.dataUri);
        if (userId) {
          await AsyncStorage.setItem(`user_avatar_${userId}`, file.dataUri);
        }
      }
    } catch (e) {
      console.error('Error picking avatar:', e);
    }
  };

  const getLanguageLabel = () => {
    if (language === 'az') return 'Azərbaycan dili 🇦🇿';
    if (language === 'en') return 'English 🇬🇧';
    return 'Русский 🇷🇺';
  };

  return (
    <View style={styles.container}>
      <HeaderBar title={t('teacher.profileTitle')} subtitle={t('teacher.profileSubtitle')} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card with Avatar Upload */}
        <ThriveCard style={styles.userCard}>
          <TouchableOpacity activeOpacity={0.8} onPress={handlePickAvatar} style={styles.avatarWrapper}>
            {customAvatarUri ? (
              <Image source={{ uri: customAvatarUri }} style={styles.customAvatar} />
            ) : (
              <ThriveAvatar name={fullName} size={72} />
            )}
            <View style={styles.cameraBadge}>
              <Plus size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>{profile?.email || session?.email}</Text>
          <Text style={styles.changePhotoText} onPress={handlePickAvatar}>
            {t('common.changePhoto')}
          </Text>

          <View style={{ marginTop: Spacing.sm }}>
            <ThriveRoleBadge role="teacher" variant="pill" />
          </View>
        </ThriveCard>

        {/* Contact Info */}
        <Text style={styles.sectionTitle}>{t('teacher.contactInfo')}</Text>
        <ThriveCard style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Mail size={18} color={Colors.primary} />
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>{t('common.teacher')} {t('auth.emailDetected')}</Text>
              <Text style={styles.infoValue}>{profile?.email || t('common.notSpecified')}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Phone size={18} color={Colors.primary} />
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>{t('common.teacher')} {t('auth.phoneDetected')}</Text>
              <Text style={styles.infoValue}>{profile?.phone || t('common.notSpecified')}</Text>
            </View>
          </View>
        </ThriveCard>

        {/* Preferences & Security */}
        <Text style={styles.sectionTitle}>{t('teacher.settings')}</Text>
        <ThriveCard style={styles.infoCard}>
          {/* Language selection */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setLangModalVisible(true)}
            style={styles.settingRow}
          >
            <View style={styles.settingLeft}>
              <Globe size={20} color={Colors.primary} />
              <View>
                <Text style={styles.settingTitle}>{t('teacher.appLanguage')}</Text>
                <Text style={styles.settingSubtitle}>{getLanguageLabel()}</Text>
              </View>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Change Password */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setPasswordModalVisible(true)}
            style={styles.settingRow}
          >
            <View style={styles.settingLeft}>
              <Lock size={20} color={Colors.primary} />
              <View>
                <Text style={styles.settingTitle}>{t('auth.changePassword')}</Text>
                <Text style={styles.settingSubtitle}>••••••••</Text>
              </View>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Screenshot Permission Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Shield size={20} color={Colors.primary} />
              <View>
                <Text style={styles.settingTitle}>{t('common.screenshotPermission')}</Text>
                <Text style={styles.settingSubtitle}>
                  {allowScreenshot ? t('common.permissionAllowed') : t('common.permissionBlocked')}
                </Text>
              </View>
            </View>
            <ThriveToggle
              value={allowScreenshot}
              onValueChange={handleToggleScreenshot}
            />
          </View>

          {/* Biometrics Toggle if supported */}
          {biometricsSupported && (
            <>
              <View style={styles.divider} />
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <UserCheck size={20} color={Colors.primary} />
                  <View>
                    <Text style={styles.settingTitle}>{t('auth.enableBiometrics')}</Text>
                    <Text style={styles.settingSubtitle}>
                      {biometricsEnabled ? t('auth.biometricsEnabled') : t('auth.biometricsDisabled')}
                    </Text>
                  </View>
                </View>
                <ThriveToggle
                  value={biometricsEnabled}
                  onValueChange={handleToggleBiometrics}
                />
              </View>
            </>
          )}
        </ThriveCard>

        {/* Information & Legal */}
        <Text style={styles.sectionTitle}>{t('common.helpAndRules')}</Text>
        <ThriveCard style={styles.infoCard}>
          {/* FAQ */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFaqModalVisible(true)}
            style={styles.settingRow}
          >
            <View style={styles.settingLeft}>
              <FileText size={20} color={Colors.primary} />
              <View>
                <Text style={styles.settingTitle}>{t('common.faqTitle')}</Text>
                <Text style={styles.settingSubtitle}>{t('common.faqTeacherDesc')}</Text>
              </View>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Terms of Service */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setTermsModalVisible(true)}
            style={styles.settingRow}
          >
            <View style={styles.settingLeft}>
              <FileText size={20} color={Colors.primary} />
              <View>
                <Text style={styles.settingTitle}>{t('common.termsTitle')}</Text>
                <Text style={styles.settingSubtitle}>{t('common.termsDesc')}</Text>
              </View>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </ThriveCard>

        {/* Logout Button */}
        <View style={styles.logoutWrapper}>
          <ThriveButton
            title={t('auth.logout')}
            variant="outline"
            onPress={logout}
            icon={<LogOut size={18} color={Colors.danger} />}
            style={styles.logoutBtn}
          />
        </View>

        {/* Version Footnote */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thrive Mobile v1.0.0 (Official Build)</Text>
          <Text style={styles.footerText}>Developed by HacTag</Text>
        </View>
      </ScrollView>

      {/* Modals */}
      <LanguagePickerModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
      />

      <ChangePasswordModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
      />

      <FAQModal
        visible={faqModalVisible}
        onClose={() => setFaqModalVisible(false)}
      />

      <TermsModal
        visible={termsModalVisible}
        onClose={() => setTermsModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  userCard: {
    alignItems: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  customAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.cardBackground,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  email: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  changePhotoText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs + 2,
  },
  infoCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  infoTextCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs + 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  settingSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: Spacing.sm,
  },
  logoutWrapper: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  logoutBtn: {
    borderColor: Colors.danger,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: 2,
  },
  footerText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
