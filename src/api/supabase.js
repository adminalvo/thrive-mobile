import { createClient } from '@supabase/supabase-js';

// Vercel-dəki mövcud EXPO dəyişənlərini dəstəkləyirik (Next.js üçün NEXT_PUBLIC_ tövsiyə olunur)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // Callback URL-dən tokeni avtomatik tutması üçün vacibdir
  },
});

export const getToken = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return null;
  return session.access_token;
};
