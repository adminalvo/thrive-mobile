import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { Colors, Spacing } from '../../config/theme';
import { useLanguage } from '../../context/LanguageContext';
import { ThriveButton } from './ThriveButton';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  style,
}) => {
  const { t } = useLanguage();
  const displayMessage = message || t('common.error');

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <AlertCircle size={32} color={Colors.danger} />
      </View>
      <Text style={styles.message}>{displayMessage}</Text>
      {onRetry && (
        <ThriveButton
          title={t('common.retry')}
          size="sm"
          variant="outline"
          onPress={onRetry}
          style={{ marginTop: Spacing.md }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
});
