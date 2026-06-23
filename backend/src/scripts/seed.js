/**
 * Seed script — creates a demo admin account in Supabase.
 * Run: node src/scripts/seed.js
 */
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { supabase } from '../config/supabase.js'

const email    = process.env.SEED_EMAIL    ?? 'admin@example.com'
const password = process.env.SEED_PASSWORD ?? 'changeme123'
const name     = process.env.SEED_NAME     ?? 'Admin'

async function seed() {
  const hash = await bcrypt.hash(password, 12)

  const { error } = await supabase.from('users').upsert(
    { email, password_hash: hash, name, role: 'admin' },
    { onConflict: 'email' }
  )

  if (error) { console.error('Seed failed:', error.message); process.exit(1) }
  console.log(`✓ Admin account ready: ${email} / ${password}`)
  process.exit(0)
}

seed()
