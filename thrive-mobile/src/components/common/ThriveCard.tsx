import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Colors, Radius, Spacing, Shadows } from '../../config/theme';
import { hapticService } from '../../utils/hapticService';

interface ThriveCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'glass' | 'glow';
}

export const ThriveCard: React.FC<ThriveCardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
}) => {
  const getCardStyle = (): ViewStyle => {
    if (variant === 'elevated') {
      return {
        backgroundColor: Colors.cardElevated,
        borderColor: Colors.borderLight,
        ...Shadows.md,
      };
    }
    if (variant === 'glow') {
      return {
        backgroundColor: Colors.cardBackground,
        borderColor: Colors.borderActive,
        ...Shadows.glow,
      };
    }
    if (variant === 'glass') {
      return {
        backgroundColor: Colors.glass,
        borderColor: Colors.border,
      };
    }
    return {
      backgroundColor: Colors.cardBackground,
      borderColor: Colors.border,
      ...Shadows.sm,
    };
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.78}
        onPress={() => {
          hapticService.light();
          onPress();
        }}
        style={[styles.card, getCardStyle(), style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, getCardStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
});
