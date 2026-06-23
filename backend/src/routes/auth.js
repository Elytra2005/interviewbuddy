import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import { supabase, db } from '../config/supabase.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  next()
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  )
}

function publicUser(u) {
  return {
    id:              u.id,
    email:           u.email,
    name:            u.name,
    role:            u.role,
    is_onboarded:    u.is_onboarded,
    organization_id: u.organization_id,
  }
}

// POST /api/auth/login
router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    res.json({ token: signToken(user), user: publicUser(user) })
  })
)

// GET /api/auth/me
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const { data: user } = await supabase
    .from('users')
    .select('id, email, name, role, is_onboarded, organization_id')
    .eq('id', req.user.id)
    .single()
  res.json({ user: publicUser(user) })
}))

// POST /api/auth/register
// Open to anyone — role must be recruiter or tech_recruiter
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('role').isIn(['recruiter', 'tech_recruiter']).withMessage('Role must be recruiter or tech_recruiter'),
    body('org_name').notEmpty().trim().withMessage('Company name is required'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { email, password, name, role, org_name } = req.body

    // Check duplicate email
    const { data: existing } = await supabase
      .from('users').select('id').eq('email', email).maybeSingle()
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' })

    // Create organization first
    const { data: org, error: orgErr } = await supabase
      .from('organizations').insert({ name: org_name.trim() }).select('id').single()
    if (orgErr) throw orgErr

    const password_hash = await bcrypt.hash(password, 12)

    const user = await db(
      supabase
        .from('users')
        .insert({
          email,
          password_hash,
          name,
          role,
          organization_id: org.id,
          is_onboarded:    false,
        })
        .select('id, email, name, role, is_onboarded, organization_id')
        .single()
    )

    res.status(201).json({ user: publicUser(user), token: signToken(user) })
  })
)

// PUT /api/auth/onboard — complete onboarding, optionally update org name
router.put('/onboard', requireAuth, asyncHandler(async (req, res) => {
  const { org_name } = req.body

  const { data: fullUser } = await supabase
    .from('users').select('organization_id').eq('id', req.user.id).single()

  if (org_name?.trim() && fullUser?.organization_id) {
    await supabase
      .from('organizations')
      .update({ name: org_name.trim() })
      .eq('id', fullUser.organization_id)
  }

  await supabase.from('users').update({ is_onboarded: true }).eq('id', req.user.id)
  res.json({ onboarded: true })
}))

export default router
