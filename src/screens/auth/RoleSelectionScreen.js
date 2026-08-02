import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, SIZES } from '../../constants/theme';

export default function RoleSelectionScreen({ navigation }) {
  const { t } = useTranslation();

  const handleRoleSelect = (role) => {
    navigation.navigate('Register', { role });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.selectRole')}</Text>
      
      <TouchableOpacity style={styles.roleCard} onPress={() => handleRoleSelect('parent')}>
        <Text style={styles.roleTitle}>{t('auth.parent')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.roleCard} onPress={() => handleRoleSelect('student')}>
        <Text style={styles.roleTitle}>{t('auth.student')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.roleCard} onPress={() => handleRoleSelect('admin')}>
        <Text style={styles.roleTitle}>{t('auth.admin')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Geri Qayıt</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    backgroundColor: COLORS.deepNavy,
    padding: SIZES.padding * 2,
    justifyContent: 'center',
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 40,
    textAlign: 'center',
  },
  roleCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  roleTitle: {
    fontSize: SIZES.large,
    color: COLORS.aquaTeal,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 30,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: SIZES.medium,
  },
});
