/**
 * Client-safe environment variables.
 * Only NEXT_PUBLIC_* vars are available in the browser.
 * Import this in 'use client' components that need env access.
 */

export const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL!
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const APP_URL           = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
