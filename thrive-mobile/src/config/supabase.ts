import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { secureStorage } from '../utils/securityService';

const extra = Constants.expoConfig?.extra || {};

const supabaseUrl = extra.supabaseUrl || 'https://bhiqieseyeamiqfgjssh.supabase.co';
const supabaseAnonKey = extra.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoaXFpZXNleWVhbWlxZmdqc3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzAwNDgsImV4cCI6MjEwMjM0NjA0OH0._C57EWi20k9OPitcYJSYJOvhQrWwdeuSwMzQINDX-kk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
