import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  Platform,
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
      {label && (
        <Text style={[styles.label, isFocused && styles.labelFocused]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          !!error && styles.inputWrapperError,
        ]}
      >
        {leftIcon && (
          <View style={[styles.leftIconContainer, isFocused && styles.iconActive]}>
            {leftIcon}
          </View>
        )}
        <TextInput
          placeholderTextColor="rgba(148, 163, 184, 0.6)"
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
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  labelFocused: {
    color: Colors.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1E38',
    borderWidth: 1.5,
    borderColor: '#1E3A5F',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    minHeight: 52,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputWrapperFocused: {
    borderColor: Colors.primary,
    backgroundColor: '#0F2C4C',
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputWrapperError: {
    borderColor: Colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm + 4 : Spacing.sm,
  },
  leftIconContainer: {
    marginRight: Spacing.sm + 2,
    opacity: 0.8,
  },
  iconActive: {
    opacity: 1,
  },
  rightIconContainer: {
    marginLeft: Spacing.sm,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 4,
    fontWeight: '500',
  },
});
