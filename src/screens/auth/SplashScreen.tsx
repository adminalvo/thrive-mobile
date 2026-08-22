import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Spacing } from '../../config/theme';

export const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoLetter}>T</Text>
      </View>
      <Text style={styles.brandTitle}>THRIVE</Text>
      <Text style={styles.brandSubtitle}>EDUCATION CENTER</Text>
      <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: Spacing.xl }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(76, 162, 181, 0.15)',
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoLetter: {
    fontSize: 44,
    fontWeight: '900',
    color: Colors.primary,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 4,
    color: Colors.textPrimary,
  },
  brandSubtitle: {
    fontSize: 12,
    letterSpacing: 3,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 4,
  },
});
