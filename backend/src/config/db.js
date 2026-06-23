import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // keep SSL for hosted providers; disable locally if needed
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL client error:', err.message)
})

/**
 * Execute a parameterised query and return the result rows.
 * Usage: const rows = await query('SELECT * FROM users WHERE id = $1', [id])
 */
export async function query(text, params) {
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    if (process.env.NODE_ENV === 'development' && duration > 500) {
      console.warn(`Slow query (${duration}ms): ${text}`)
    }
    return result
  } catch (err) {
    console.error('Database query error:', err.message, '\nQuery:', text)
    throw err
  }
}

/** Obtain a client for transactions. Remember to call client.release() in finally. */
export function getClient() {
  return pool.connect()
}

export default pool
