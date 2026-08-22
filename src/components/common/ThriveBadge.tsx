import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '../../config/theme';

interface ThriveBadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  style?: ViewStyle;
}

export const ThriveBadge: React.FC<ThriveBadgeProps> = ({
  label,
  variant = 'primary',
  style,
}) => {
  const getBadgeColors = () => {
    switch (variant) {
      case 'success':
        return { bg: Colors.successLight, text: Colors.success, border: Colors.success };
      case 'warning':
        return { bg: Colors.warningLight, text: Colors.warning, border: Colors.warning };
      case 'danger':
        return { bg: Colors.dangerLight, text: Colors.danger, border: Colors.danger };
      case 'info':
        return { bg: Colors.infoLight, text: Colors.info, border: Colors.info };
      case 'neutral':
        return { bg: Colors.cardElevated, text: Colors.textSecondary, border: Colors.border };
      case 'primary':
      default:
        return { bg: 'rgba(76, 162, 181, 0.15)', text: Colors.primary, border: Colors.primary };
    }
  };

  const { bg, text, border } = getBadgeColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }, style]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
