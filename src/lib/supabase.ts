import { createClient } from '@supabase/supabase-js'

// Valores públicos do projeto. Variáveis de ambiente continuam podendo sobrescrever estes valores.
const DEFAULT_SUPABASE_URL = 'https://zueipqzurbjlbpyzzlqi.supabase.co'
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_CvpWXKPPb3WLV3mFZTdOUw_Rjm4_A_c'

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || DEFAULT_SUPABASE_URL
const publishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) || DEFAULT_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(url && publishableKey)

export const supabase = createClient(url, publishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
