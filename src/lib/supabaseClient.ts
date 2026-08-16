import { createClient } from '@supabase/supabase-js';

// Get the environment variables directly, assuming they are set. 
// If using Next.js public variables, they should have NEXT_PUBLIC_ prefix.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
