import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius } from '../../config/theme';

interface ThriveProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  height?: number;
  style?: ViewStyle;
}

export const ThriveProgressBar: React.FC<ThriveProgressBarProps> = ({
  progress,
  color = Colors.primary,
  height = 8,
  style,
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={[styles.container, { height, borderRadius: height / 2 }, style]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress}%`,
            backgroundColor: color,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.cardElevated,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
