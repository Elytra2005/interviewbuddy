import { randomBytes } from 'crypto'

/** Generate a cryptographically random URL-safe token of the given byte length. */
export function generateToken(bytes = 32) {
  return randomBytes(bytes).toString('base64url')
}

/** Return a Date `hours` hours from now. */
export function expiresAt(hours) {
  return new Date(Date.now() + hours * 60 * 60 * 1000)
}
