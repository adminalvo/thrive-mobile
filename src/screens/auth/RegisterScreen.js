import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../api/supabase';
import { COLORS, SIZES } from '../../constants/theme';

export default function RegisterScreen({ route, navigation }) {
  const { role } = route.params;
  const { t } = useTranslation();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [idCard, setIdCard] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !idCard || !email || !password) {
      Alert.alert(t('auth.error'), 'Bütün xanaları doldurun');
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
      Alert.alert(t('auth.error'), error.message);
    } else {
      Alert.alert('Uğurlu!', 'Qeydiyyat tamamlandı. Zəhmət olmasa daxil olun.');
      navigation.navigate('Login');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('onboarding.register')}</Text>
      <Text style={styles.subtitle}>Rol: {t(`auth.${role}`)}</Text>

      <TextInput style={styles.input} placeholder="Ad" placeholderTextColor="rgba(255,255,255,0.5)" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Soyad" placeholderTextColor="rgba(255,255,255,0.5)" value={lastName} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="Şəxsiyyət Vəsiqəsi (FİN / Seriya)" placeholderTextColor="rgba(255,255,255,0.5)" value={idCard} onChangeText={setIdCard} />
      <TextInput style={styles.input} placeholder="E-poçt" placeholderTextColor="rgba(255,255,255,0.5)" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Şifrə" placeholderTextColor="rgba(255,255,255,0.5)" value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Yüklənir...' : t('onboarding.register')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Geri Qayıt</Text>
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
    backgroundColor: COLORS.deepNavy,
    padding: SIZES.padding * 2,
    justifyContent: 'center',
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.medium,
    color: COLORS.aquaTeal,
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: SIZES.padding,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: SIZES.medium,
    color: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  button: {
    backgroundColor: COLORS.aquaTeal,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: SIZES.medium,
  },
});
