import { createBrowserClient } from '@supabase/ssr'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env.client'

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
