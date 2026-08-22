import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '../../config/theme';

interface ThriveSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const ThriveSkeleton: React.FC<ThriveSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = Radius.sm,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const SkeletonCardList: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <View style={{ gap: Spacing.md }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.cardSkeleton}>
          <ThriveSkeleton width="60%" height={18} style={{ marginBottom: 10 }} />
          <ThriveSkeleton width="90%" height={14} style={{ marginBottom: 6 }} />
          <ThriveSkeleton width="40%" height={14} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.cardElevated,
  },
  cardSkeleton: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
