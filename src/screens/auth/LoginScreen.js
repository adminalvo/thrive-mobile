import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../api/supabase';
import { COLORS, SIZES } from '../../constants/theme';

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('auth.error'), 'Məlumatları tam daxil edin');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert(t('auth.error'), error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('onboarding.login')}</Text>
      <Text style={styles.subtitle}>Hesabınıza daxil olun</Text>

      <TextInput 
        style={styles.input} 
        placeholder="E-poçt" 
        placeholderTextColor="rgba(255,255,255,0.5)"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Şifrə" 
        placeholderTextColor="rgba(255,255,255,0.5)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity 
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Yüklənir...' : t('onboarding.login')}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
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
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.medium,
    color: COLORS.grayLight,
    marginBottom: 30,
    textAlign: 'center',
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
