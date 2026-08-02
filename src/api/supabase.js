import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Vercel '@vercel/connect' paketinin getToken funksiyasının
 * Mobil/Client-side tətbiqimizə uyğunlaşdırılmış versiyası.
 * Cari aktiv istifadəçinin (usr_...) access_token-ini qaytarır.
 */
export const getToken = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    console.warn('Sessiya tapılmadı və ya xəta baş verdi:', error);
    return null;
  }
  return session.access_token;
};
