import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { User, Mail, Phone, Globe, LogOut, ChevronRight } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { HeaderBar } from '../../components/common/HeaderBar';
import { ThriveAvatar } from '../../components/common/ThriveAvatar';
import { ThriveCard } from '../../components/common/ThriveCard';
import { ThriveBadge } from '../../components/common/ThriveBadge';
import { ThriveButton } from '../../components/common/ThriveButton';
import { LanguagePickerModal } from '../../components/modals/LanguagePickerModal';

export const TeacherProfileScreen: React.FC = () => {
  const { session, logout } = useAuth();
  const { t, language } = useLanguage();
  const [langModalVisible, setLangModalVisible] = useState(false);

  const profile = session?.profile;
  const fullName = `${profile?.first_name || t('common.teacher')} ${profile?.last_name || ''}`.trim();

  const getLanguageLabel = () => {
    if (language === 'az') return 'Azərbaycan dili 🇦🇿';
    if (language === 'en') return 'English 🇬🇧';
    return 'Русский 🇷🇺';
  };

  return (
    <View style={styles.container}>
      <HeaderBar title={t('teacher.profileTitle')} subtitle={t('teacher.profileSubtitle')} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <ThriveCard style={styles.userCard}>
          <ThriveAvatar name={fullName} size={64} style={styles.avatar} />
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>{profile?.email || session?.email}</Text>
          <View style={{ marginTop: Spacing.sm }}>
            <ThriveBadge label={t('teacher.portalTitle')} variant="primary" />
          </View>
        </ThriveCard>

        {/* Info list */}
        <Text style={styles.sectionTitle}>{t('teacher.contactInfo')}</Text>
        <ThriveCard style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Mail size={18} color={Colors.primary} />
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>{t('common.teacher')} E-poçt</Text>
              <Text style={styles.infoValue}>{profile?.email || t('common.notSpecified')}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Phone size={18} color={Colors.primary} />
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>{t('common.teacher')} Telefon</Text>
              <Text style={styles.infoValue}>{profile?.phone || t('common.notSpecified')}</Text>
            </View>
          </View>
        </ThriveCard>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>{t('teacher.settings')}</Text>
        <ThriveCard style={styles.infoCard}>
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
        </ThriveCard>

        {/* Logout */}
        <ThriveButton
          title={t('common.logout')}
          variant="danger"
          onPress={logout}
          icon={<LogOut size={16} color="#FFFFFF" />}
          style={{ marginTop: Spacing.md }}
        />

        <Text style={styles.versionText}>Thrive Mobile v1.0.0 (Official Build)</Text>
      </ScrollView>

      <LanguagePickerModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
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
    backgroundColor: '#0F2744',
    borderColor: 'rgba(76, 162, 181, 0.3)',
    marginBottom: Spacing.md,
  },
  avatar: {
    marginBottom: Spacing.sm,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  email: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs + 2,
  },
  infoCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
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
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  settingSubtitle: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
  },
  versionText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
