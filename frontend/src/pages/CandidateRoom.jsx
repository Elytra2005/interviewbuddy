import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import CodeEditor from '../components/CodeEditor'
import WebcamCapture from '../components/WebcamCapture'
import { useAntiCheat } from '../hooks/useAntiCheat'
import { useScreenCapture } from '../hooks/useScreenCapture'
import { ShieldIcon, ClockIcon, ChevronRightIcon, ScreenShareIcon } from '../components/Icons'
import api from '../utils/api'

const SNAPSHOT_INTERVAL_MS = 30_000

export default function CandidateRoom() {
  const navigate     = useNavigate()
  const socketRef    = useRef(null)
  const snapshotRef  = useRef(null)
  const heartbeatRef = useRef(null)

  const [phase, setPhase]           = useState('webcam')
  const [session, setSession]       = useState(null)
  const [code, setCode]             = useState('// Write your solution here\n')
  const [timeLeft, setTimeLeft]     = useState(null)
  const [signalCount, setSignalCount] = useState(0)
  const [showProblem, setShowProblem] = useState(true)
  const [sharePrompt, setSharePrompt] = useState(false)

  const sessionToken = sessionStorage.getItem('session_token')
  const screenCapture = useScreenCapture({ intervalMs: 30_000, liveIntervalMs: 3_000, socketRef })

  useEffect(() => {
    if (!sessionToken) { navigate('/'); return }
    api.get('/candidate/session')
      .then(r => setSession(r.data.session))
      .catch(() => navigate('/'))
  }, [sessionToken, navigate])

  // Socket
  useEffect(() => {
    if (!sessionToken) return
    const socket = io(import.meta.env.VITE_API_URL ?? '/', { auth: { role: 'candidate', sessionToken }, transports: ['websocket'] })
    socketRef.current = socket
    return () => socket.disconnect()
  }, [sessionToken])

  // Start after webcam
  const startSession = useCallback(async (snapshot) => {
    try {
      await api.post('/candidate/session/start', { webcam_snapshot: snapshot ?? null })
      setPhase('interview')
      if (session?.duration_minutes) setTimeLeft(session.duration_minutes * 60)

      // Auto-prompt screen share for standard/full monitoring
      if (session?.monitoring_level !== 'minimal') {
        setSharePrompt(true)
        const granted = await screenCapture.start()
        setSharePrompt(false)
        if (!granted) {
          api.post('/candidate/event', {
            event_type: 'screen_share_denied',
            severity:   'medium',
            details:    { note: 'Candidate denied screen sharing request' },
          }).catch(() => {})
        }
      }
    } catch {}
  }, [session, screenCapture])

  // Timer
  useEffect(() => {
    if (phase !== 'interview' || timeLeft === null) return
    if (timeLeft <= 0) { handleSubmit(); return }
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000)
    return () => clearInterval(t)
  }, [phase, timeLeft])

  // Snapshots
  useEffect(() => {
    if (phase !== 'interview') return
    snapshotRef.current = setInterval(() => {
      api.post('/candidate/snapshot', { content: code }).catch(() => {})
    }, SNAPSHOT_INTERVAL_MS)
    return () => clearInterval(snapshotRef.current)
  }, [phase, code])

  // Heartbeat
  useEffect(() => {
    if (phase !== 'interview') return
    heartbeatRef.current = setInterval(() => socketRef.current?.emit('candidate:heartbeat'), 10_000)
    return () => clearInterval(heartbeatRef.current)
  }, [phase])

  // Anti-cheat
  const { attachToEditor } = useAntiCheat({
    monitoringLevel: session?.monitoring_level ?? 'standard',
    socketRef,
    onEvent: () => setSignalCount(n => n + 1),
  })

  const handleEditorMount = useCallback((editor, monaco) => attachToEditor(editor, monaco), [attachToEditor])
  const handleCodeChange  = useCallback((val) => {
    setCode(val ?? '')
    socketRef.current?.emit('candidate:code_update', { code: val ?? '' })
  }, [])

  const handleSubmit = useCallback(async () => {
    clearInterval(snapshotRef.current)
    clearInterval(heartbeatRef.current)
    screenCapture.stop()
    await api.post('/candidate/snapshot',    { content: code }).catch(() => {})
    await api.post('/candidate/session/end', { final_code: code }).catch(() => {})
    setPhase('done')
  }, [code, screenCapture])

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617]">
        <svg className="h-6 w-6 animate-spin text-[#00ea64]" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
        </svg>
      </div>
    )
  }

  // ── Webcam phase ────────────────────────────────────────────────────────────
  if (phase === 'webcam') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] px-4">
        <div className="w-full max-w-sm card space-y-5">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#00ea64]/[0.08] ring-1 ring-[#00ea64]/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="text-[#00ea64]" aria-hidden="true">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white">Identity Snapshot</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              A single photo confirms your presence. Camera access is optional.
            </p>
          </div>
          <WebcamCapture onCapture={startSession} autoCapture />
          <button onClick={() => startSession(null)} className="btn-ghost w-full text-xs cursor-pointer">
            Skip — continue without camera
          </button>
        </div>
      </div>
    )
  }

  // ── Done phase ──────────────────────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] px-4">
        <div className="card max-w-sm text-center space-y-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00ea64]/5 to-indigo-600/5" />
          <div className="relative space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Interview Submitted</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your solution has been recorded. You may now close this window.
            </p>
            <p className="text-xs text-slate-600">Thank you for your time.</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Interview room ──────────────────────────────────────────────────────────
  const urgent = timeLeft !== null && timeLeft < 300

  return (
    <div className="flex h-screen flex-col bg-[#020617] overflow-hidden select-none">
      {/* Screen share prompt overlay */}
      {sharePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="card max-w-sm text-center space-y-4 animate-fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#00ea64]/[0.08] ring-1 ring-[#00ea64]/20">
              <ScreenShareIcon size={22} className="text-[#00ea64]" />
            </div>
            <h2 className="text-base font-semibold text-white">Screen Sharing Required</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select your <strong className="text-white">entire screen</strong> (not just a window) in the system prompt.
              Your screen is captured periodically for review — Cluely and similar overlays are excluded from capture.
            </p>
            <p className="text-[11px] text-slate-600">Waiting for browser permission prompt…</p>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-black/40 backdrop-blur-xl px-4 h-12 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#00ea64]">
            <ShieldIcon size={12} className="text-black" />
          </div>
          <span className="text-xs text-slate-500 hidden sm:block capitalize">
            {session.monitoring_level} monitoring active
          </span>
          {signalCount > 0 && (
            <span className="badge badge-medium text-[10px]">
              {signalCount} signal{signalCount !== 1 ? 's' : ''} logged
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Screen share / recording status */}
          {session.monitoring_level !== 'minimal' && (
            screenCapture.sharing ? (
              <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#00ea64]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00ea64] animate-pulse" />
                Recording
                {screenCapture.frameCount > 0 && (
                  <span className="text-[#00ea64]/60">· {screenCapture.frameCount} frame{screenCapture.frameCount !== 1 ? 's' : ''} saved</span>
                )}
              </span>
            ) : (
              <button
                onClick={async () => {
                  setSharePrompt(true)
                  await screenCapture.start()
                  setSharePrompt(false)
                }}
                className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <ScreenShareIcon size={12} />
                Share screen
              </button>
            )
          )}

          {/* Timer */}
          {timeLeft !== null && (
            <div className={`flex items-center gap-1.5 rounded-xl px-3 py-1 font-mono text-sm font-bold tabular-nums ${
              urgent
                ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/30 animate-pulse'
                : 'bg-white/5 text-white'
            }`}>
              <ClockIcon size={13} className={urgent ? 'text-red-400' : 'text-slate-500'} />
              {formatTime(timeLeft)}
            </div>
          )}

          <button
            onClick={() => { if (window.confirm('Submit your solution now?')) handleSubmit() }}
            className="btn-primary text-xs px-4 py-1.5 cursor-pointer"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Problem panel */}
        <div className={`flex flex-col border-r border-white/[0.06] bg-black/20 transition-all duration-300 ${
          showProblem ? 'w-72' : 'w-10'
        } shrink-0 overflow-hidden`}>
          <button
            onClick={() => setShowProblem(p => !p)}
            className="flex h-10 w-full items-center justify-between px-3 text-xs text-slate-500 hover:text-slate-300 border-b border-white/[0.04] shrink-0 cursor-pointer"
          >
            {showProblem ? (
              <>
                <span className="font-medium text-slate-400">Problem</span>
                <ChevronRightIcon size={13} className="rotate-180" />
              </>
            ) : (
              <ChevronRightIcon size={13} className="mx-auto" />
            )}
          </button>
          {showProblem && (
            <div className="flex-1 overflow-y-auto p-4">
              <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                {session.problem_statement ?? 'Loading problem…'}
              </pre>
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <CodeEditor
            value={code}
            onChange={handleCodeChange}
            language={session.language ?? 'javascript'}
            onEditorMount={handleEditorMount}
          />
        </div>
      </div>

      {/* Monitoring bar */}
      <div className="flex items-center justify-between border-t border-white/[0.04] bg-black/30 px-4 py-1.5 shrink-0">
        <p className="text-[10px] text-slate-700">
          Session monitored · Tab switches, paste events, and typing cadence are logged as signals for reviewer.
        </p>
        <p className="text-[10px] text-slate-700">{session.language}</p>
      </div>
    </div>
  )
}

function formatTime(s) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
}
