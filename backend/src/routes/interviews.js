import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { supabase, db } from '../config/supabase.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  next()
}

// GET /api/interviews
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  // Fetch interviews with nested candidate/session ids for count computation
  const { data: rows, error } = await supabase
    .from('interviews')
    .select(`
      *,
      users!created_by ( name ),
      candidates ( id ),
      sessions ( id )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error

  const interviews = (rows ?? []).map(({ users, candidates, sessions, ...iv }) => ({
    ...iv,
    creator_name:     users?.name ?? null,
    candidate_count:  candidates?.length ?? 0,
    session_count:    sessions?.length ?? 0,
  }))

  res.json({ interviews })
}))

// POST /api/interviews
router.post(
  '/',
  requireAuth,
  [
    body('title').notEmpty().trim(),
    body('problem_statement').notEmpty(),
    body('duration_minutes').optional().isInt({ min: 5, max: 480 }),
    body('monitoring_level').optional().isIn(['minimal', 'standard', 'full']),
    body('language').optional().trim(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const {
      title,
      problem_statement,
      duration_minutes = 60,
      monitoring_level = 'standard',
      language = 'javascript',
    } = req.body

    const interview = await db(
      supabase
        .from('interviews')
        .insert({ title, problem_statement, duration_minutes, monitoring_level, language, created_by: req.user.id })
        .select()
        .single()
    )

    res.status(201).json({ interview })
  })
)

// GET /api/interviews/:id
router.get('/:id', requireAuth, asyncHandler(async (req, res) => {
  const { data: interview, error } = await supabase
    .from('interviews')
    .select('*, users!created_by ( name )')
    .eq('id', req.params.id)
    .single()

  if (error || !interview) return res.status(404).json({ error: 'Interview not found' })

  // Candidates with their latest session
  const { data: candidates } = await supabase
    .from('candidates')
    .select('*, sessions ( id, status, risk_score )')
    .eq('interview_id', req.params.id)
    .order('created_at', { ascending: false })

  const flatCandidates = (candidates ?? []).map(({ sessions, ...c }) => {
    const session = sessions?.[0]
    return {
      ...c,
      session_id:     session?.id ?? null,
      session_status: session?.status ?? null,
      risk_score:     session?.risk_score ?? null,
    }
  })

  res.json({
    interview: { ...interview, creator_name: interview.users?.name },
    candidates: flatCandidates,
  })
}))

// PUT /api/interviews/:id
router.put(
  '/:id',
  requireAuth,
  [
    body('title').optional().notEmpty().trim(),
    body('problem_statement').optional().notEmpty(),
    body('duration_minutes').optional().isInt({ min: 5, max: 480 }),
    body('monitoring_level').optional().isIn(['minimal', 'standard', 'full']),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { title, problem_statement, duration_minutes, monitoring_level, language } = req.body

    // Build update object with only provided fields
    const updates = { updated_at: new Date().toISOString() }
    if (title             !== undefined) updates.title             = title
    if (problem_statement !== undefined) updates.problem_statement = problem_statement
    if (duration_minutes  !== undefined) updates.duration_minutes  = duration_minutes
    if (monitoring_level  !== undefined) updates.monitoring_level  = monitoring_level
    if (language          !== undefined) updates.language          = language

    const { data: interview, error } = await supabase
      .from('interviews')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error || !interview) return res.status(404).json({ error: 'Interview not found' })
    res.json({ interview })
  })
)

// DELETE /api/interviews/:id
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const { error, count } = await supabase
    .from('interviews')
    .delete({ count: 'exact' })
    .eq('id', req.params.id)

  if (error) throw error
  if (count === 0) return res.status(404).json({ error: 'Interview not found' })
  res.json({ success: true })
}))

export default router
