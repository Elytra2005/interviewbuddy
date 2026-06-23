import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY   // service-role key — bypasses RLS

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment')
  process.exit(1)
}

/**
 * Admin Supabase client for the Express backend.
 * Uses the service-role key so it operates outside RLS — never expose to the browser.
 */
export const supabase = createClient(url, key, {
  auth: {
    // We manage our own JWT auth; disable Supabase Auth session persistence
    persistSession:    false,
    autoRefreshToken:  false,
    detectSessionInUrl: false,
  },
})

/**
 * Thin helper that unwraps a Supabase call and throws on error.
 * Usage:  const data = await db(supabase.from('users').select('*').eq('id', id).single())
 */
export async function db(promise) {
  const { data, error } = await promise
  if (error) {
    const err = new Error(error.message)
    err.code   = error.code
    err.status = error.status ?? 500
    throw err
  }
  return data
}
