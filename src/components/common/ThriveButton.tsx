import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Radius, Spacing } from '../../config/theme';

interface ThriveButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const ThriveButton: React.FC<ThriveButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const getContainerStyle = (): ViewStyle => {
    let bg: string = Colors.primary;
    let border: string = 'transparent';

    if (variant === 'secondary') bg = Colors.cardElevated;
    else if (variant === 'outline') {
      bg = 'transparent';
      border = Colors.primary;
    } else if (variant === 'danger') bg = Colors.danger;
    else if (variant === 'success') bg = Colors.success;

    let paddingVertical = Spacing.md - 2;
    let paddingHorizontal = Spacing.lg;

    if (size === 'sm') {
      paddingVertical = Spacing.xs + 2;
      paddingHorizontal = Spacing.md;
    } else if (size === 'lg') {
      paddingVertical = Spacing.md + 2;
      paddingHorizontal = Spacing.xl;
    }

    return {
      backgroundColor: bg,
      borderColor: border,
      borderWidth: variant === 'outline' ? 1 : 0,
      paddingVertical,
      paddingHorizontal,
      opacity: disabled ? 0.6 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    let color: string = '#FFFFFF';
    if (variant === 'outline') color = Colors.primary;

    let fontSize = 15;
    if (size === 'sm') fontSize = 13;
    else if (size === 'lg') fontSize = 16;

    return {
      color,
      fontSize,
    };
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.baseButton, getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.primary : '#FFFFFF'} size="small" />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[styles.baseText, getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  baseText: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
