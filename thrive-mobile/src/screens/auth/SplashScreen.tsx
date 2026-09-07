import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../../config/theme';

const { Image, Easing } = require('react-native');

export const SplashScreen: React.FC = () => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    // 1. Entrance Fade & Spring
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Infinite Continuous Smooth Rotation
    const easingFn = Easing && Easing.linear ? Easing.linear : (t: number) => t;
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1100,
        easing: easingFn,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const size = 140;
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.preloaderWrapper,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Animated Circular Rotating Ring */}
        <Animated.View
          style={[
            styles.spinnerWrapper,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <Svg width={size} height={size}>
            {/* Background static circle track */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Active glowing spinner arc */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={Colors.primary}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference * 0.3} ${circumference * 0.7}`}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </Animated.View>

        {/* Circular Centered Logo */}
        <View style={styles.logoCircle}>
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A192F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preloaderWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  spinnerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    overflow: 'hidden',
    backgroundColor: '#112240',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CA2B5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
});
