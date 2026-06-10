/**
 * Centralized, validated environment configuration.
 *
 * Call getServerEnv() inside request handlers and server functions
 * — never at module top-level, so validation runs at request time
 * rather than during the build phase.
 *
 * This file must NOT be imported by 'use client' components.
 */

function required(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(
      `\n\n  Missing environment variable: ${key}\n` +
      `  Copy .env.local.example → .env.local and fill in the value.\n`
    )
  }
  return value
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback
}

export interface ServerEnv {
  supabaseUrl:         string
  supabaseAnonKey:     string
  supabaseServiceKey:  string
  pfMerchantId:        string
  pfMerchantKey:       string
  pfPassphrase:        string
  pfSandbox:           boolean
  appUrl:              string
}

/** Call this inside server functions / API route handlers. */
export function getServerEnv(): ServerEnv {
  return {
    supabaseUrl:        required('NEXT_PUBLIC_SUPABASE_URL'),
    supabaseAnonKey:    required('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    supabaseServiceKey: required('SUPABASE_SERVICE_ROLE_KEY'),
    pfMerchantId:       required('PAYFAST_MERCHANT_ID'),
    pfMerchantKey:      required('PAYFAST_MERCHANT_KEY'),
    pfPassphrase:       optional('PAYFAST_PASSPHRASE', ''),
    pfSandbox:          optional('PAYFAST_SANDBOX', 'true') === 'true',
    appUrl:             optional('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  }
}

/** Supabase-only slice — used by server.ts and middleware. */
export function getSupabaseEnv() {
  return {
    url:        required('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey:    required('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceKey: required('SUPABASE_SERVICE_ROLE_KEY'),
  }
}
