import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '../../config/theme';
import { ThriveCard } from './ThriveCard';
import { CircularProgress } from './CircularProgress';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  circularProgress?: number;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accentColor = Colors.primary,
  circularProgress,
  style,
}) => {
  return (
    <ThriveCard style={[styles.card, style]}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{title}</Text>
        {icon && !circularProgress && (
          <View style={[styles.iconWrapper, { backgroundColor: `${accentColor}20` }]}>
            {icon}
          </View>
        )}
      </View>
      
      <View style={styles.contentRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {typeof circularProgress === 'number' && (
          <CircularProgress
            percentage={circularProgress}
            size={48}
            strokeWidth={5}
            color={accentColor}
          />
        )}
      </View>
    </ThriveCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    marginBottom: 0,
    backgroundColor: Colors.cardBackground,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
});
