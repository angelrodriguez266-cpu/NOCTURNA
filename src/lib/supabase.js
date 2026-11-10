import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(
    url && 
    !url.includes('placeholder') && 
    !url.includes('tu-proyecto') &&
    key && 
    !key.includes('placeholder') &&
    !key.includes('tu-anon-key')
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
