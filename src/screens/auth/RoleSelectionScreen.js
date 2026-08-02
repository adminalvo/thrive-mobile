import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, SIZES } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function RoleSelectionScreen({ navigation }) {
  const { t } = useTranslation();

  const handleRoleSelect = (role) => {
    navigation.navigate('Register', { role });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.selectRole')}</Text>

      <TouchableOpacity style={styles.roleCard} onPress={() => handleRoleSelect('student')}>
        <Ionicons name="school" size={40} color={COLORS.oceanBlue} />
        <Text style={styles.roleText}>{t('auth.student')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.roleCard} onPress={() => handleRoleSelect('parent')}>
        <Ionicons name="people" size={40} color={COLORS.oceanBlue} />
        <Text style={styles.roleText}>{t('auth.parent')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.roleCard} onPress={() => handleRoleSelect('admin')}>
        <Ionicons name="settings" size={40} color={COLORS.oceanBlue} />
        <Text style={styles.roleText}>{t('auth.admin')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>{t('common.back')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayLight,
    padding: SIZES.padding * 2,
    justifyContent: 'center',
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.deepNavy,
    textAlign: 'center',
    marginBottom: 40,
  },
  roleCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  roleText: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.deepNavy,
    marginLeft: 20,
  },
  backButton: {
    marginTop: 30,
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.medium,
  },
});
