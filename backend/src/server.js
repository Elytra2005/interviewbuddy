import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server as SocketIO } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import authRoutes       from './routes/auth.js'
import interviewRoutes  from './routes/interviews.js'
import candidateRoutes  from './routes/candidates.js'
import sessionRoutes    from './routes/sessions.js'
import candidateApiRoutes from './routes/candidate.js'
import { setupWebSocket } from './websocket/handler.js'
import { errorHandler }   from './middleware/errorHandler.js'

const app  = express()
const http = createServer(app)

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new SocketIO(http, {
  cors: {
    origin:      process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  },
})
setupWebSocket(io)

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
  origin:      process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))  // allow webcam snapshot + screen frames (base64)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',                                     authRoutes)
app.use('/api/interviews',                               interviewRoutes)
app.use('/api/interviews/:interviewId/candidates',       candidateRoutes)
app.use('/api/sessions',                                 sessionRoutes)
app.use('/api/candidate',                                candidateApiRoutes)

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

// ── Error handler (must be last) ──────────────────────────────────────────────
app.use(errorHandler)

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT ?? 4000
http.listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`)
  console.log(`[server] Environment: ${process.env.NODE_ENV ?? 'development'}`)
})

export default app
