import { createClient } from '@supabase/supabase-js';

// These should be set as environment variables in production
// For now, we'll use placeholder values that need to be configured
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Supabase URL and Anon Key must be set in environment variables!');
  console.error('Please create a .env file with:');
  console.error('VITE_SUPABASE_URL=your_project_url');
  console.error('VITE_SUPABASE_ANON_KEY=your_anon_key');
}

// Create client with fallback to prevent errors
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
