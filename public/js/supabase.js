import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import config from './config.js'

export const isSupabaseConfigured = Boolean(config.supabaseUrl && config.supabaseAnonKey)
export const supabase = isSupabaseConfigured
  ? createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
    })
  : null
