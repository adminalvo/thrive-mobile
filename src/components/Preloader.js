import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, ActivityIndicator, Animated } from 'react-native';
import { COLORS } from '../constants/theme';

export default function Preloader() {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image 
        source={require('../../assets/logo.png')} 
        style={styles.logo} 
        resizeMode="contain" 
      />
      <ActivityIndicator size="large" color={COLORS.aquaTeal} style={{ marginTop: 20 }} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.deepNavy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
  },
});
