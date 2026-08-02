import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, useWindowDimensions, ScrollView, Platform, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import '../api/i18n';

// Typewriter Hook
function useTypewriter(text, speed = 50) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i === text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return displayedText;
}

export default function OnboardingScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const scrollViewRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const { width: windowWidth } = useWindowDimensions();
  
  const isWebDesktop = Platform.OS === 'web' && windowWidth > 500;
  const contentWidth = isWebDesktop ? 500 : windowWidth;

  const typewriterText = useTypewriter(t('onboarding.welcome'), 60);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(contentOffsetX / contentWidth);
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.mobileWrapper, { width: contentWidth }]}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          style={styles.pagerView}
        >
          {/* Page 1: Logo & Welcome */}
          <View style={[styles.page, { width: contentWidth }]}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.logo} 
              resizeMode="contain" 
            />
            <Text style={styles.title}>{typewriterText}<Text style={{color: COLORS.aquaTeal}}>|</Text></Text>
            
            <View style={styles.langContainer}>
              <TouchableOpacity onPress={() => changeLanguage('az')} style={[styles.langBtn, i18n.language === 'az' && styles.langBtnActive]}>
                <Text style={[styles.langText, i18n.language === 'az' && styles.langTextActive]}>AZ</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => changeLanguage('en')} style={[styles.langBtn, i18n.language === 'en' && styles.langBtnActive]}>
                <Text style={[styles.langText, i18n.language === 'en' && styles.langTextActive]}>EN</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => changeLanguage('ru')} style={[styles.langBtn, i18n.language === 'ru' && styles.langBtnActive]}>
                <Text style={[styles.langText, i18n.language === 'ru' && styles.langTextActive]}>RU</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Page 2: Features Redesign */}
          <View style={[styles.page, { width: contentWidth }]}>
            <Text style={[styles.title, { marginBottom: 40 }]}>{t('onboarding.summary')}</Text>
            
            <View style={styles.featureItem}>
              <View style={styles.iconCircle}>
                <Ionicons name="earth" size={32} color={COLORS.aquaTeal} />
              </View>
              <Text style={styles.featureText}>{t('onboarding.feature1')}</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.iconCircle}>
                <Ionicons name="briefcase" size={32} color={COLORS.aquaTeal} />
              </View>
              <Text style={styles.featureText}>{t('onboarding.feature2')}</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.iconCircle}>
                <Ionicons name="bulb" size={32} color={COLORS.aquaTeal} />
              </View>
              <Text style={styles.featureText}>{t('onboarding.feature3')}</Text>
            </View>
          </View>

          {/* Page 3: Auth Gateway */}
          <View style={[styles.page, { width: contentWidth }]}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.logoSmall} 
              resizeMode="contain" 
            />
            <Text style={styles.title}>{t('onboarding.getStarted')}</Text>
            
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.primaryButtonText}>{t('onboarding.login')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('RoleSelection')}
            >
              <Text style={styles.secondaryButtonText}>{t('onboarding.register')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Dots Indicator */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((i) => (
            <View 
              key={i} 
              style={[styles.dot, currentPage === i && styles.activeDot]} 
            />
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>www.thrive.az</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.deepNavy,
    alignItems: 'center',
  },
  mobileWrapper: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  pagerView: {
    flex: 1,
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
    paddingBottom: 100, // Leave space for footer
  },
  logo: {
    width: '70%',
    height: 120,
    marginBottom: 40,
  },
  logoSmall: {
    width: '50%',
    height: 80,
    marginBottom: 30,
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginBottom: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 15,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(57, 192, 198, 0.1)', // Aqua teal with low opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  featureText: {
    fontSize: SIZES.large,
    color: COLORS.white,
    fontWeight: '600',
    flex: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 80,
    width: '100%',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 5,
  },
  activeDot: {
    width: 20,
    backgroundColor: COLORS.aquaTeal,
  },
  langContainer: {
    flexDirection: 'row',
    marginTop: 40,
  },
  langBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  langBtnActive: {
    backgroundColor: COLORS.aquaTeal,
    borderColor: COLORS.aquaTeal,
  },
  langText: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 'bold',
  },
  langTextActive: {
    color: COLORS.white,
  },
  primaryButton: {
    backgroundColor: COLORS.aquaTeal,
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.aquaTeal,
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  secondaryButtonText: {
    color: COLORS.aquaTeal,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.grayLight,
    fontSize: SIZES.small,
    letterSpacing: 1,
    opacity: 0.6,
  }
});
