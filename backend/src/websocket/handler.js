import jwt from 'jsonwebtoken'
import { supabase } from '../config/supabase.js'
import { calculateRiskScore } from '../services/riskScore.js'

export function setupWebSocket(io) {
  // ── Auth middleware ──────────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    const { token, sessionToken, role } = socket.handshake.auth

    if (role === 'interviewer' && token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        const { data: user } = await supabase.from('users').select('id, name, role').eq('id', payload.sub).single()
        if (!user) return next(new Error('User not found'))
        socket.user     = user
        socket.userRole = 'interviewer'
        return next()
      } catch {
        return next(new Error('Invalid interviewer token'))
      }
    }

    if (role === 'candidate' && sessionToken) {
      const { data: session } = await supabase
        .from('sessions')
        .select('*, candidates!candidate_id ( name )')
        .eq('session_token', sessionToken)
        .in('status', ['pending', 'active'])
        .single()

      if (!session) return next(new Error('Invalid session token'))
      socket.candidateSession = { ...session, candidate_name: session.candidates?.name }
      socket.userRole         = 'candidate'
      return next()
    }

    next(new Error('Missing authentication'))
  })

  io.on('connection', (socket) => {
    const { userRole } = socket

    // ── Interviewer ────────────────────────────────────────────────────────────
    if (userRole === 'interviewer') {
      socket.on('interviewer:join', async ({ sessionId }) => {
        const { data } = await supabase.from('sessions').select('id').eq('id', sessionId).single()
        if (!data) return socket.emit('error', 'Session not found')
        socket.join(`session:${sessionId}`)
        socket.emit('joined', { sessionId })
      })

      socket.on('interviewer:leave', ({ sessionId }) => socket.leave(`session:${sessionId}`))
    }

    // ── Candidate ──────────────────────────────────────────────────────────────
    if (userRole === 'candidate') {
      const session   = socket.candidateSession
      const sessionId = session.id
      const room      = `session:${sessionId}`

      socket.join(room)
      socket.to(room).emit('candidate:connected', { candidate_name: session.candidate_name, timestamp: new Date().toISOString() })

      socket.on('candidate:code_update', ({ code }) => {
        socket.to(room).emit('session:code_update', { code, timestamp: new Date().toISOString() })
      })

      socket.on('candidate:event', async ({ event_type, severity, details }) => {
        if (!event_type || !severity) return
        try {
          await supabase.from('events').insert({ session_id: sessionId, event_type, severity, details: details ?? {} })
          const { data: events } = await supabase.from('events').select('event_type, severity').eq('session_id', sessionId)
          const score = calculateRiskScore(events ?? [])
          await supabase.from('sessions').update({ risk_score: score }).eq('id', sessionId)

          io.to(room).emit('session:event',       { event_type, severity, details, timestamp: new Date().toISOString() })
          io.to(room).emit('session:risk_update', { risk_score: score })
        } catch (err) {
          console.error('[WS] event persist error:', err.message)
        }
      })

      socket.on('candidate:screen_frame', ({ frame }) => {
        if (!frame || typeof frame !== 'string') return
        // Relay compressed live frame to all interviewers watching this session.
        socket.to(room).emit('session:screen_frame', { frame, timestamp: new Date().toISOString() })
      })

      socket.on('candidate:heartbeat',      () => socket.to(room).emit('session:heartbeat', { timestamp: new Date().toISOString() }))
      socket.on('candidate:status_update',  (s) => socket.to(room).emit('session:status_update', { ...s, timestamp: new Date().toISOString() }))
      socket.on('disconnect',               () => socket.to(room).emit('candidate:disconnected', { timestamp: new Date().toISOString() }))
    }
  })
}
