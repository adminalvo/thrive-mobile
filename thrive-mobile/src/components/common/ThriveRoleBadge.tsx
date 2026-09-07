import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { UserCheck, Users, BookOpen } from 'lucide-react-native';
import { Colors, Radius, Spacing, Shadows } from '../../config/theme';
import { useLanguage } from '../../context/LanguageContext';
import { hapticService } from '../../utils/hapticService';

export type ThriveUserRole = 'student' | 'teacher' | 'parent';

interface ThriveRoleBadgeProps {
  role: ThriveUserRole | string;
  variant?: 'compact' | 'hero' | 'pill';
  onPress?: () => void;
  style?: ViewStyle;
}

export const ThriveRoleBadge: React.FC<ThriveRoleBadgeProps> = ({
  role,
  variant = 'compact',
  onPress,
  style,
}) => {
  const { t, language } = useLanguage();

  const normalizedRole: ThriveUserRole =
    role === 'teacher' ? 'teacher' : role === 'parent' ? 'parent' : 'student';

  const getRoleConfig = () => {
    switch (normalizedRole) {
      case 'teacher':
        return {
          title: language === 'az' ? 'Thrive Müəllim' : language === 'ru' ? 'Thrive Преподаватель' : 'Thrive Teacher',
          icon: <UserCheck size={variant === 'hero' ? 20 : 14} color="#10B981" />,
          dotColor: '#10B981',
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.4)',
          accentColor: '#10B981',
        };
      case 'parent':
        return {
          title: language === 'az' ? 'Thrive Valideyn' : language === 'ru' ? 'Thrive Родитель' : 'Thrive Parent',
          icon: <Users size={variant === 'hero' ? 20 : 14} color="#F59E0B" />,
          dotColor: '#F59E0B',
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.4)',
          accentColor: '#F59E0B',
        };
      case 'student':
      default:
        return {
          title: language === 'az' ? 'Thrive Şagird' : language === 'ru' ? 'Thrive Ученик' : 'Thrive Student',
          icon: <BookOpen size={variant === 'hero' ? 20 : 14} color="#4CA2B5" />,
          dotColor: '#4CA2B5',
          bg: 'rgba(76, 162, 181, 0.14)',
          border: 'rgba(76, 162, 181, 0.4)',
          accentColor: '#4CA2B5',
        };
    }
  };

  const config = getRoleConfig();

  const handlePress = () => {
    if (onPress) {
      hapticService.light();
      onPress();
    }
  };

  // 1. COMPACT PILL (for HeaderBar, Lists)
  if (variant === 'compact') {
    const Component = onPress ? TouchableOpacity : View;
    return (
      <Component
        activeOpacity={0.8}
        onPress={handlePress}
        style={[
          styles.compactPill,
          {
            backgroundColor: config.bg,
            borderColor: config.border,
          },
          style,
        ]}
      >
        <View style={[styles.dot, { backgroundColor: config.dotColor }]} />
        <Text style={[styles.compactText, { color: config.accentColor }]}>
          {config.title}
        </Text>
      </Component>
    );
  }

  // 2. PILL WITH ICON (for Profile Screen)
  if (variant === 'pill') {
    const Component = onPress ? TouchableOpacity : View;
    return (
      <Component
        activeOpacity={0.8}
        onPress={handlePress}
        style={[
          styles.pillWithIcon,
          {
            backgroundColor: config.bg,
            borderColor: config.border,
          },
          style,
        ]}
      >
        <View style={styles.iconWrap}>{config.icon}</View>
        <Text style={[styles.pillTitle, { color: config.accentColor }]}>
          {config.title}
        </Text>
      </Component>
    );
  }

  // 3. HERO VIP BADGE (Clean Header on Home Screens)
  const Component = onPress ? TouchableOpacity : View;
  return (
    <Component
      activeOpacity={0.85}
      onPress={handlePress}
      style={[
        styles.heroCard,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
        },
        style,
      ]}
    >
      <View style={[styles.heroIconCircle, { borderColor: config.border }]}>
        {config.icon}
      </View>
      <Text style={[styles.heroRoleTitle, { color: config.accentColor }]}>
        {config.title}
      </Text>
    </Component>
  );
};

const styles = StyleSheet.create({
  // Compact
  compactPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  compactText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Pill with icon
  pillWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Hero Card
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderWidth: 1,
    marginBottom: Spacing.md,
    alignSelf: 'flex-start',
  },
  heroIconCircle: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  heroRoleTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
