import { createClient } from '@supabase/supabase-js'

// Fall back to placeholders so build-time imports don't crash when env
// vars are missing. Anything that actually uses supabase will fail at
// runtime — but the landing page never touches it, so the build passes.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
