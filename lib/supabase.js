import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if credentials are set and are not placeholder values
const isConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key-here' &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '';

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const supabaseConfigured = isConfigured;
