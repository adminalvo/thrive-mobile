import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { Colors, Spacing } from '../../config/theme';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Məlumat tapılmadı',
  description,
  icon,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        {icon || <Inbox size={32} color={Colors.textMuted} />}
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
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
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 260,
  },
});
