import { Router } from 'express'
import { supabase, db } from '../config/supabase.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { buildSessionReport, renderReportHtml } from '../services/reportExport.js'
import { calculateRiskScore, analyseSnapshots } from '../services/riskScore.js'

const router = Router()

// GET /api/sessions/:id
router.get('/:id', requireAuth, asyncHandler(async (req, res) => {
  const { data: session, error } = await supabase
    .from('sessions')
    .select(`
      *,
      candidates!candidate_id ( name, email ),
      interviews!interview_id ( title, problem_statement, duration_minutes, monitoring_level, language )
    `)
    .eq('id', req.params.id)
    .single()

  if (error || !session) return res.status(404).json({ error: 'Session not found' })

  const [eventsRes, snapshotsRes, notesRes, framesRes] = await Promise.all([
    supabase.from('events').select('*').eq('session_id', req.params.id).order('timestamp'),
    supabase.from('code_snapshots').select('*').eq('session_id', req.params.id).order('timestamp'),
    supabase.from('interviewer_notes').select('*, users ( name )').eq('session_id', req.params.id),
    supabase.from('screen_frames').select('id, captured_at, width, height').eq('session_id', req.params.id).order('captured_at'),
  ])

  res.json({
    session:   flattenSession(session),
    events:    eventsRes.data    ?? [],
    snapshots: snapshotsRes.data ?? [],
    notes:     (notesRes.data ?? []).map(({ users, ...n }) => ({ ...n, interviewer_name: users?.name })),
    frames:    framesRes.data    ?? [],
  })
}))

// GET /api/sessions/:id/frames/:frameId
router.get('/:id/frames/:frameId', requireAuth, asyncHandler(async (req, res) => {
  const { data: frame, error } = await supabase
    .from('screen_frames')
    .select('frame_data, captured_at')
    .eq('id', req.params.frameId)
    .eq('session_id', req.params.id)
    .single()
  if (error || !frame) return res.status(404).json({ error: 'Frame not found' })
  res.json({ frame: frame.frame_data, captured_at: frame.captured_at })
}))

// GET /api/sessions/:id/events
router.get('/:id/events', requireAuth, asyncHandler(async (req, res) => {
  const { data: events } = await supabase
    .from('events').select('*').eq('session_id', req.params.id).order('timestamp')
  res.json({ events: events ?? [] })
}))

// GET /api/sessions/:id/snapshots
router.get('/:id/snapshots', requireAuth, asyncHandler(async (req, res) => {
  const { data: snapshots } = await supabase
    .from('code_snapshots').select('*').eq('session_id', req.params.id).order('timestamp')
  res.json({ snapshots: snapshots ?? [] })
}))

// PUT /api/sessions/:id/notes
router.put('/:id/notes', requireAuth, asyncHandler(async (req, res) => {
  const notes = await db(
    supabase
      .from('interviewer_notes')
      .upsert(
        { session_id: req.params.id, user_id: req.user.id, content: req.body.content ?? '', updated_at: new Date().toISOString() },
        { onConflict: 'session_id,user_id' }
      )
      .select()
      .single()
  )
  res.json({ notes })
}))

// POST /api/sessions/:id/recalculate
router.post('/:id/recalculate', requireAuth, asyncHandler(async (req, res) => {
  const [{ data: events }, { data: snapshots }] = await Promise.all([
    supabase.from('events').select('*').eq('session_id', req.params.id),
    supabase.from('code_snapshots').select('*').eq('session_id', req.params.id).order('timestamp'),
  ])

  const allEvents = [...(events ?? []), ...analyseSnapshots(snapshots ?? [])]
  const score     = calculateRiskScore(allEvents)

  await supabase.from('sessions').update({ risk_score: score }).eq('id', req.params.id)
  res.json({ risk_score: score })
}))

// GET /api/sessions/:id/export.json
router.get('/:id/export.json', requireAuth, asyncHandler(async (req, res) => {
  const report = await buildSessionReport(req.params.id)
  if (!report) return res.status(404).json({ error: 'Session not found' })
  res.setHeader('Content-Disposition', `attachment; filename="session-${req.params.id}.json"`)
  res.json(report)
}))

// GET /api/sessions/:id/export.html
router.get('/:id/export.html', requireAuth, asyncHandler(async (req, res) => {
  const report = await buildSessionReport(req.params.id)
  if (!report) return res.status(404).json({ error: 'Session not found' })
  res.setHeader('Content-Type', 'text/html')
  res.send(renderReportHtml(report))
}))

function flattenSession(s) {
  const { candidates, interviews, ...rest } = s
  return {
    ...rest,
    candidate_name:    candidates?.name,
    candidate_email:   candidates?.email,
    interview_title:   interviews?.title,
    problem_statement: interviews?.problem_statement,
    duration_minutes:  interviews?.duration_minutes,
    monitoring_level:  interviews?.monitoring_level,
    language:          interviews?.language,
  }
}

export default router
