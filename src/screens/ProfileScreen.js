import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../api/supabase';
import { COLORS, SIZES } from '../constants/theme';
import { useTranslation } from 'react-i18next';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Xəta', 'Çıxış edərkən xəta baş verdi');
    }
    setLoading(false);
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const getRoleDisplay = (role) => {
    if (role === 'student') return 'Şagird';
    if (role === 'parent') return 'Valideyn';
    if (role === 'admin') return 'Admin';
    return role;
  };

  if (!user) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Profil</Text>
      
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={COLORS.aquaTeal} />
        </View>
        <Text style={styles.nameText}>
          {user.user_metadata?.first_name} {user.user_metadata?.last_name}
        </Text>
        <Text style={styles.emailText}>{user.email}</Text>
        
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{getRoleDisplay(user.user_metadata?.role)}</Text>
        </View>
      </View>

      {/* Language Settings */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Dil Seçimi</Text>
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

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={loading}
      >
        <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
        <Text style={styles.logoutText}>{loading ? 'Çıxılır...' : 'Hesabdan Çıx'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.deepNavy,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    padding: SIZES.padding * 1.5,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 30,
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(57, 192, 198, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  nameText: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 5,
  },
  emailText: {
    fontSize: SIZES.medium,
    color: COLORS.grayLight,
    marginBottom: 15,
  },
  roleBadge: {
    backgroundColor: COLORS.aquaTeal,
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 15,
  },
  roleText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: SIZES.small,
  },
  settingsSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 15,
  },
  langContainer: {
    flexDirection: 'row',
  },
  langBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
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
  logoutButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)', // Red with opacity
    borderWidth: 1,
    borderColor: '#FF3B30',
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
