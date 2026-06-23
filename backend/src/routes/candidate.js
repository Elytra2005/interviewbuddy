import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { supabase, db } from '../config/supabase.js'
import { requireCandidateSession } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { generateToken } from '../services/tokenService.js'
import { calculateRiskScore } from '../services/riskScore.js'

const router = Router()

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  next()
}

// GET /api/candidate/verify/:token
router.get('/verify/:token', asyncHandler(async (req, res) => {
  const { data: candidate } = await supabase
    .from('candidates')
    .select('*, interviews ( title, problem_statement, duration_minutes, monitoring_level, language )')
    .eq('invite_token', req.params.token)
    .single()

  if (!candidate) return res.status(404).json({ error: 'Invite link not found or expired' })
  if (candidate.status === 'completed') return res.status(410).json({ error: 'This interview has already been completed' })
  if (new Date(candidate.token_expires_at) < new Date()) {
    await supabase.from('candidates').update({ status: 'expired' }).eq('id', candidate.id)
    return res.status(410).json({ error: 'Invite link has expired' })
  }

  const iv = candidate.interviews
  res.json({
    candidate: { id: candidate.id, name: candidate.name, email: candidate.email },
    interview: {
      title:             iv?.title,
      problem_statement: iv?.problem_statement,
      duration_minutes:  iv?.duration_minutes,
      monitoring_level:  iv?.monitoring_level,
      language:          iv?.language,
    },
  })
}))

// POST /api/candidate/consent
router.post(
  '/consent',
  [body('invite_token').notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const { invite_token } = req.body

    const { data: candidate } = await supabase
      .from('candidates')
      .select('*, interviews ( id )')
      .eq('invite_token', invite_token)
      .single()

    if (!candidate) return res.status(404).json({ error: 'Invalid token' })
    if (candidate.status === 'completed') return res.status(410).json({ error: 'Interview already completed' })
    if (new Date(candidate.token_expires_at) < new Date()) {
      return res.status(410).json({ error: 'Invite link has expired' })
    }

    // Resume existing pending/active session
    const { data: existing } = await supabase
      .from('sessions')
      .select('*')
      .eq('candidate_id', candidate.id)
      .in('status', ['pending', 'active'])
      .single()

    let session
    if (existing) {
      session = existing
      if (!session.consent_given) {
        await supabase.from('sessions').update({ consent_given: true, consent_given_at: new Date().toISOString() }).eq('id', session.id)
      }
    } else {
      const session_token = generateToken()
      session = await db(
        supabase
          .from('sessions')
          .insert({
            candidate_id:     candidate.id,
            interview_id:     candidate.interview_id,
            session_token,
            consent_given:    true,
            consent_given_at: new Date().toISOString(),
            status:           'pending',
          })
          .select()
          .single()
      )
      await supabase.from('candidates').update({ status: 'in_progress' }).eq('id', candidate.id)
    }

    res.json({ session_token: session.session_token })
  })
)

// POST /api/candidate/session/start
router.post('/session/start', requireCandidateSession, asyncHandler(async (req, res) => {
  const { webcam_snapshot } = req.body
  await supabase
    .from('sessions')
    .update({ status: 'active', started_at: new Date().toISOString(), webcam_snapshot: webcam_snapshot ?? null })
    .eq('id', req.candidateSession.id)

  res.json({ started: true })
}))

// POST /api/candidate/event
router.post(
  '/event',
  requireCandidateSession,
  [body('event_type').notEmpty(), body('severity').isIn(['low', 'medium', 'high'])],
  validate,
  asyncHandler(async (req, res) => {
    const { event_type, severity, details } = req.body
    const sessionId = req.candidateSession.id

    await supabase.from('events').insert({ session_id: sessionId, event_type, severity, details: details ?? {} })

    // Recalculate risk score
    const { data: events } = await supabase.from('events').select('event_type, severity').eq('session_id', sessionId)
    const score = calculateRiskScore(events ?? [])
    await supabase.from('sessions').update({ risk_score: score }).eq('id', sessionId)

    res.json({ recorded: true, risk_score: score })
  })
)

// POST /api/candidate/snapshot
router.post(
  '/snapshot',
  requireCandidateSession,
  [body('content').exists()],
  validate,
  asyncHandler(async (req, res) => {
    const { content } = req.body
    await supabase.from('code_snapshots').insert({
      session_id: req.candidateSession.id,
      content,
      char_count: content.length,
    })
    res.json({ saved: true })
  })
)

// POST /api/candidate/session/end
router.post('/session/end', requireCandidateSession, asyncHandler(async (req, res) => {
  const { final_code } = req.body
  const { id: sessionId, candidate_id } = req.candidateSession

  await Promise.all([
    supabase.from('sessions').update({ status: 'completed', ended_at: new Date().toISOString(), final_code: final_code ?? '' }).eq('id', sessionId),
    supabase.from('candidates').update({ status: 'completed' }).eq('id', candidate_id),
  ])

  res.json({ completed: true })
}))

// POST /api/candidate/frame  — stores a periodic screen capture frame for reviewer
router.post('/frame', requireCandidateSession, asyncHandler(async (req, res) => {
  const { frame, width, height } = req.body
  if (!frame || typeof frame !== 'string') return res.status(400).json({ error: 'Missing frame data' })
  await supabase.from('screen_frames').insert({
    session_id: req.candidateSession.id,
    frame_data: frame,
    width:      width  ?? null,
    height:     height ?? null,
  })
  res.json({ saved: true })
}))

// GET /api/candidate/session
router.get('/session', requireCandidateSession, asyncHandler(async (req, res) => {
  const s = req.candidateSession
  res.json({
    session: {
      id:               s.id,
      status:           s.status,
      started_at:       s.started_at,
      monitoring_level: s.monitoring_level,
      duration_minutes: s.duration_minutes,
      problem_statement: s.problem_statement,
      language:         s.language,
    },
  })
}))

export default router
