import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useTranslation } from 'react-i18next';
import { COLORS, SIZES } from '../constants/theme';
import '../api/i18n'; // Initialize i18n

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const pagerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <View style={styles.container}>
      <PagerView 
        style={styles.pagerView} 
        initialPage={0}
        ref={pagerRef}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {/* Page 1: Logo & Welcome */}
        <View key="1" style={styles.page}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />
          <Text style={styles.title}>{t('onboarding.welcome')}</Text>
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

        {/* Page 2: Summary */}
        <View key="2" style={styles.page}>
          <Text style={styles.title}>{t('onboarding.welcome')}</Text>
          <Text style={styles.summary}>{t('onboarding.summary')}</Text>
        </View>

        {/* Page 3: Auth Gateway */}
        <View key="3" style={styles.page}>
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
      </PagerView>

      {/* Dots Indicator */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((i) => (
          <View 
            key={i} 
            style={[styles.dot, currentPage === i && styles.activeDot]} 
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.deepNavy, // Matching the logo background visually
  },
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  logo: {
    width: width * 0.7,
    height: 120,
    marginBottom: 40,
  },
  logoSmall: {
    width: width * 0.5,
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
  summary: {
    fontSize: SIZES.medium,
    color: COLORS.grayLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 50,
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
    marginTop: 30,
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
});
