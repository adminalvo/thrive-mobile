import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bhiqieseyeamiqfgjssh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoaXFpZXNleWVhbWlxZmdqc3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzAwNDgsImV4cCI6MjEwMjM0NjA0OH0._C57EWi20k9OPitcYJSYJOvhQrWwdeuSwMzQINDX-kk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
