import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, SIZES } from '../../constants/theme';
import { supabase } from '../../api/supabase';

export default function RegisterScreen({ route, navigation }) {
  const { t } = useTranslation();
  const role = route.params?.role || 'student';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [idCard, setIdCard] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !idCard || !email || !password) {
      Alert.alert('Xəta', 'Bütün xanaları doldurun');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          id_card: idCard,
          role: role,
        }
      }
    });

    setLoading(false);

    if (error) {
      Alert.alert('Xəta', error.message);
    } else {
      Alert.alert('Uğurlu', 'Qeydiyyat uğurla tamamlandı. Təsdiq linki emailinizə göndərildi (əgər aktivdirsə).');
      // Navigate to login or wait for email verification
      navigation.navigate('Login');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('auth.registerTitle')} ({t(`auth.${role}`)})</Text>

      <TextInput
        style={styles.input}
        placeholder={t('auth.firstName')}
        value={firstName}
        onChangeText={setFirstName}
      />
      
      <TextInput
        style={styles.input}
        placeholder={t('auth.lastName')}
        value={lastName}
        onChangeText={setLastName}
      />

      <TextInput
        style={styles.input}
        placeholder={t('auth.idCard')}
        value={idCard}
        onChangeText={setIdCard}
        autoCapitalize="characters"
      />

      <TextInput
        style={styles.input}
        placeholder={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.primaryButtonText}>
          {loading ? '...' : t('common.submit')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>{t('common.back')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    backgroundColor: COLORS.grayLight,
    padding: SIZES.padding * 2,
    justifyContent: 'center',
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.deepNavy,
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    fontSize: SIZES.font,
  },
  primaryButton: {
    backgroundColor: COLORS.oceanBlue,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
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
