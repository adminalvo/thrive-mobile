import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Globe, ArrowRight, BookOpen, Users, UserCheck, Award } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../../config/theme';
import { useLanguage } from '../../context/LanguageContext';
import { ThriveButton } from '../../components/common/ThriveButton';
import { LanguagePickerModal } from '../../components/modals/LanguagePickerModal';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  const { t, language } = useLanguage();
  const [langModalVisible, setLangModalVisible] = useState(false);

  const getLanguageLabel = () => {
    if (language === 'az') return 'AZ 🇦🇿';
    if (language === 'en') return 'EN 🇬🇧';
    return 'RU 🇷🇺';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Top Language Bar */}
      <View style={styles.topBar}>
        <View style={styles.badgePill}>
          <Award size={13} color={Colors.primary} />
          <Text style={styles.badgePillText}>Thrive Mobile Portal</Text>
        </View>

        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setLangModalVisible(true)}
          activeOpacity={0.7}
        >
          <Globe size={16} color={Colors.primary} />
          <Text style={styles.langBtnText}>{getLanguageLabel()}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Brand Hero */}
        <View style={styles.brandHero}>
          <View style={styles.logoAura}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoLetter}>T</Text>
            </View>
          </View>

          <Text style={styles.brandName}>THRIVE</Text>
          <Text style={styles.brandTagline}>{t('welcome.title')}</Text>
          <Text style={styles.brandDescription}>{t('welcome.subtitle')}</Text>
        </View>

        {/* Feature Cards Grid */}
        <View style={styles.featuresSection}>
          {/* Student Card */}
          <View style={styles.featureCard}>
            <View style={[styles.featureIconBox, { backgroundColor: 'rgba(76, 162, 181, 0.15)' }]}>
              <BookOpen size={22} color={Colors.primary} />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureRole}>{t('common.student')}</Text>
              <Text style={styles.featureDesc}>{t('welcome.studentFeature')}</Text>
            </View>
          </View>

          {/* Parent Card */}
          <View style={styles.featureCard}>
            <View style={[styles.featureIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Users size={22} color={Colors.success} />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureRole}>{t('common.parent')}</Text>
              <Text style={styles.featureDesc}>{t('welcome.parentFeature')}</Text>
            </View>
          </View>

          {/* Teacher Card */}
          <View style={styles.featureCard}>
            <View style={[styles.featureIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <UserCheck size={22} color={Colors.warning} />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureRole}>{t('common.teacher')}</Text>
              <Text style={styles.featureDesc}>{t('welcome.teacherFeature')}</Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <ThriveButton
            title={t('welcome.getStarted')}
            size="lg"
            variant="primary"
            onPress={onGetStarted}
            icon={<ArrowRight size={20} color="#FFFFFF" />}
            style={styles.startBtn}
          />
          <Text style={styles.footerNote}>{t('welcome.alreadyHaveAccount')}</Text>
        </View>
      </ScrollView>

      {/* Language Picker Modal */}
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl + 4,
    paddingBottom: Spacing.xs,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 5,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(76, 162, 181, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(76, 162, 181, 0.25)',
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.3,
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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  brandHero: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  logoAura: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: 'rgba(76, 162, 181, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(76, 162, 181, 0.2)',
    marginBottom: Spacing.sm,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#0F2744',
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.primary,
  },
  brandName: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 6,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  brandTagline: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 4,
    textAlign: 'center',
  },
  brandDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: '85%',
    lineHeight: 18,
  },
  featuresSection: {
    gap: Spacing.sm + 2,
    marginVertical: Spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  featureIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextCol: {
    flex: 1,
  },
  featureRole: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  featureDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  actionContainer: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  startBtn: {
    width: '100%',
  },
  footerNote: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: Spacing.sm + 2,
    textAlign: 'center',
  },
});
