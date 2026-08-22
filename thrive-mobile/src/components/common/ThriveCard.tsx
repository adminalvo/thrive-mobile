import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Colors, Radius, Spacing } from '../../config/theme';

interface ThriveCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'glass';
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
        borderColor: Colors.border,
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
    };
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
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
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
});
