import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { Colors, Radius, Spacing } from '../../config/theme';

export interface ThriveInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const ThriveInput: React.FC<ThriveInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          !!error && styles.inputWrapperError,
        ]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        <TextInput
          placeholderTextColor={Colors.textMuted}
          style={[styles.input, style]}
          onFocus={(e: any) => {
            setIsFocused(true);
            onFocus && onFocus(e);
          }}
          onBlur={(e: any) => {
            setIsFocused(false);
            onBlur && onBlur(e);
          }}
          {...props}
        />
        {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  inputWrapperFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.cardElevated,
  },
  inputWrapperError: {
    borderColor: Colors.danger,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    paddingVertical: Spacing.sm,
  },
  leftIconContainer: {
    marginRight: Spacing.sm,
  },
  rightIconContainer: {
    marginLeft: Spacing.sm,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
});
