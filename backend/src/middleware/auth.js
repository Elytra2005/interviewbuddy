import jwt from 'jsonwebtoken'
import { supabase, db } from '../config/supabase.js'

/** Protects interviewer/admin routes. Expects: Authorization: Bearer <token> */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' })
  }

  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await db(
      supabase.from('users').select('id, email, name, role').eq('id', payload.sub).single()
    )
    req.user = user
    next()
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
    return res.status(401).json({ error: msg })
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

/** Validates x-session-token header for candidate routes. */
export async function requireCandidateSession(req, res, next) {
  const token = req.headers['x-session-token']
  if (!token) return res.status(401).json({ error: 'Missing x-session-token header' })

  try {
    const { data: session, error } = await supabase
      .from('sessions')
      .select(`
        *,
        candidates!candidate_id ( name, email, interview_id ),
        interviews!interview_id ( monitoring_level, duration_minutes, problem_statement, language )
      `)
      .eq('session_token', token)
      .in('status', ['pending', 'active'])
      .single()

    if (error || !session) return res.status(401).json({ error: 'Invalid or expired session token' })

    req.candidateSession = {
      ...session,
      candidate_name:    session.candidates?.name,
      candidate_email:   session.candidates?.email,
      candidate_id:      session.candidate_id,
      interview_id:      session.candidates?.interview_id ?? session.interview_id,
      monitoring_level:  session.interviews?.monitoring_level,
      duration_minutes:  session.interviews?.duration_minutes,
      problem_statement: session.interviews?.problem_statement,
      language:          session.interviews?.language,
    }
    next()
  } catch (err) {
    next(err)
  }
}
