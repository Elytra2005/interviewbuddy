import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { supabase, db } from '../config/supabase.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { generateToken, expiresAt } from '../services/tokenService.js'

const router = Router({ mergeParams: true })

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  next()
}

// POST /api/interviews/:interviewId/candidates
router.post(
  '/',
  requireAuth,
  [body('email').isEmail().normalizeEmail(), body('name').notEmpty().trim()],
  validate,
  asyncHandler(async (req, res) => {
    const { interviewId } = req.params
    const { email, name } = req.body

    // Verify the interview exists
    const { data: iv } = await supabase.from('interviews').select('id').eq('id', interviewId).single()
    if (!iv) return res.status(404).json({ error: 'Interview not found' })

    const invite_token  = generateToken()
    const token_expires = expiresAt(parseInt(process.env.INVITE_TOKEN_HOURS ?? '72'))

    const candidate = await db(
      supabase
        .from('candidates')
        .insert({ interview_id: interviewId, email, name, invite_token, token_expires_at: token_expires.toISOString() })
        .select()
        .single()
    )

    const inviteLink = `${process.env.FRONTEND_URL}/interview/join/${invite_token}`

    res.status(201).json({
      candidate,
      invite_link: inviteLink,
      note: 'In production, email this link to the candidate.',
    })
  })
)

// GET /api/interviews/:interviewId/candidates
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const { data: candidates } = await supabase
    .from('candidates')
    .select('*, sessions ( id, status, risk_score, started_at, ended_at )')
    .eq('interview_id', req.params.interviewId)
    .order('created_at', { ascending: false })

  const flat = (candidates ?? []).map(({ sessions, ...c }) => {
    const s = sessions?.[0]
    return {
      ...c,
      session_id:     s?.id ?? null,
      session_status: s?.status ?? null,
      risk_score:     s?.risk_score ?? null,
      started_at:     s?.started_at ?? null,
      ended_at:       s?.ended_at ?? null,
    }
  })

  res.json({ candidates: flat })
}))

// DELETE /api/interviews/:interviewId/candidates/:candidateId
router.delete('/:candidateId', requireAuth, asyncHandler(async (req, res) => {
  const { error, count } = await supabase
    .from('candidates')
    .delete({ count: 'exact' })
    .eq('id', req.params.candidateId)
    .eq('interview_id', req.params.interviewId)

  if (error) throw error
  if (count === 0) return res.status(404).json({ error: 'Candidate not found' })
  res.json({ success: true })
}))

export default router
