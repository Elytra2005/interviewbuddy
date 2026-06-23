import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { io } from 'socket.io-client'
import Navbar from '../components/Navbar'
import RiskScorePanel from '../components/RiskScorePanel'
import EventTimeline from '../components/EventTimeline'
import CodePlayback from '../components/CodePlayback'
import CodeEditor from '../components/CodeEditor'
import StatusIndicator from '../components/StatusIndicator'
import { CodeIcon, PlayIcon, ListIcon, ArrowLeftIcon, DownloadIcon, PrintIcon, ScreenShareIcon } from '../components/Icons'
import api from '../utils/api'

const TABS = [
  { id: 'live',     label: 'Live Code', Icon: CodeIcon },
  { id: 'playback', label: 'Playback',  Icon: PlayIcon },
  { id: 'events',   label: 'Events',    Icon: ListIcon },
  { id: 'frames',   label: 'Screen',    Icon: ScreenShareIcon },
]

export default function SessionView() {
  const { id }    = useParams()
  const socketRef = useRef(null)

  const [session,   setSession]   = useState(null)
  const [events,    setEvents]    = useState([])
  const [snapshots, setSnapshots] = useState([])
  const [frames,    setFrames]    = useState([])
  const [notes,     setNotes]     = useState('')
  const [liveCode,  setLiveCode]  = useState('')
  const [riskScore, setRiskScore] = useState(0)
  const [status,    setStatus]    = useState({ webcam: null, screenshare: null, connected: false })
  const [loading,   setLoading]   = useState(true)
  const [tab,       setTab]       = useState('live')
  const [newEvents, setNewEvents] = useState(0)
  const [liveFrame, setLiveFrame] = useState(null)   // most recent screen frame from candidate
  const notesTimer = useRef(null)

  const load = useCallback(async () => {
    const res = await api.get(`/sessions/${id}`)
    setSession(res.data.session)
    setEvents(res.data.events)
    setSnapshots(res.data.snapshots)
    setFrames(res.data.frames ?? [])
    setNotes(res.data.notes?.[0]?.content ?? '')
    setRiskScore(res.data.session.risk_score ?? 0)
    if (res.data.session.final_code) setLiveCode(res.data.session.final_code)
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) return
    const socket = io(import.meta.env.VITE_API_URL ?? '/', { auth: { role: 'interviewer', token }, transports: ['websocket'] })
    socketRef.current = socket

    socket.on('connect',                () => socket.emit('interviewer:join', { sessionId: id }))
    socket.on('session:code_update',    ({ code }) => setLiveCode(code))
    socket.on('session:risk_update',    ({ risk_score }) => setRiskScore(risk_score))
    socket.on('session:status_update',  (s) => setStatus(p => ({ ...p, ...s })))
    socket.on('candidate:connected',    () => setStatus(p => ({ ...p, connected: true })))
    socket.on('candidate:disconnected', () => setStatus(p => ({ ...p, connected: false })))
    socket.on('session:event', (e) => {
      setEvents(prev => [...prev, { ...e, id: `ws-${Date.now()}` }])
      setNewEvents(n => n + 1)
    })
    socket.on('session:screen_frame', ({ frame, timestamp }) => {
      setLiveFrame({ frame, timestamp })
    })

    return () => socket.disconnect()
  }, [id])

  const saveNotes = useCallback((val) => {
    clearTimeout(notesTimer.current)
    notesTimer.current = setTimeout(() => api.put(`/sessions/${id}/notes`, { content: val }).catch(() => {}), 1500)
  }, [id])

  if (loading) return (
    <div className="flex h-full flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center text-slate-600 text-sm">Loading session…</div>
    </div>
  )

  const isLive = session?.status === 'active'

  return (
    <div className="flex h-full flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: code panel ── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-3 border-b border-white/[0.06] bg-black/20 px-4 py-2 shrink-0">
            <Link to={`/interviews/${session?.interview_id}`}
              className="text-slate-600 hover:text-slate-300 transition-colors cursor-pointer">
              <ArrowLeftIcon size={15} />
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-sm font-medium text-white truncate">{session?.interview_title}</span>
            {isLive && (
              <span className="badge bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                <span className="live-dot mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Live
              </span>
            )}
            <div className="ml-auto flex items-center gap-4">
              <StatusIndicator label="Candidate"  active={status.connected} />
              <StatusIndicator label="Webcam"     active={status.webcam}    unknown={status.webcam === null} />
              {/* Tab buttons */}
              <div className="flex rounded-lg bg-white/[0.04] p-0.5 gap-0.5">
                {TABS.map(t => (
                  <button key={t.id}
                    onClick={() => { setTab(t.id); if (t.id === 'events') setNewEvents(0) }}
                    className={`relative flex items-center gap-1.5 rounded-md px-3 py-1 text-xs transition-colors cursor-pointer ${
                      tab === t.id ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <t.Icon size={12} />
                    {t.label}
                    {t.id === 'events' && newEvents > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                        {newEvents > 9 ? '9+' : newEvents}
                      </span>
                    )}
                    {t.id === 'frames' && frames.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-0.5 items-center justify-center rounded-full bg-[#00ea64] text-[9px] font-bold text-black">
                        {frames.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {tab === 'live'     && <CodeEditor value={liveCode} language={session?.language ?? 'javascript'} readOnly />}
            {tab === 'playback' && <div className="h-full overflow-y-auto p-4"><CodePlayback snapshots={snapshots} /></div>}
            {tab === 'events'   && <div className="h-full overflow-y-auto p-4"><EventTimeline events={events} /></div>}
            {tab === 'frames'   && <FrameGallery frames={frames} sessionId={id} />}
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="flex w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l border-white/[0.06] bg-black/10 p-4">
          {/* Candidate info */}
          <div className="card-sm space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-[#00ea64] to-emerald-600 flex items-center justify-center text-xs font-bold text-black">
                {session?.candidate_name?.charAt(0) ?? '?'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{session?.candidate_name}</p>
                <p className="text-[11px] text-slate-500 truncate">{session?.candidate_email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Chip label="Status"  value={session?.status} />
              {session?.started_at && (
                <Chip label="Started" value={new Date(session.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
              )}
              <Chip label="Level"  value={session?.monitoring_level} />
              <Chip label="Events" value={events.length} />
            </div>
          </div>

          {/* Live screen view */}
          {liveFrame ? (
            <div className="card-sm space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-white">Live Screen</h3>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400">Live</span>
                </div>
              </div>
              <div
                className="relative rounded-lg overflow-hidden border border-white/[0.06] bg-black/40 cursor-pointer group"
                onClick={() => setTab('frames')}
                title="Click to open Screen tab"
              >
                <img
                  src={liveFrame.frame}
                  alt="Candidate screen"
                  className="w-full object-contain"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-[10px] text-white bg-black/60 rounded px-2 py-0.5">View history</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-700">
                Updated {new Date(liveFrame.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · refreshes every 3s
              </p>
            </div>
          ) : isLive ? (
            <div className="card-sm space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-white">Live Screen</h3>
                <span className="text-[10px] text-slate-600">Waiting…</span>
              </div>
              <div className="flex h-20 items-center justify-center rounded-lg border border-white/[0.04] bg-white/[0.01]">
                <div className="text-center space-y-1">
                  <ScreenShareIcon size={16} className="text-slate-700 mx-auto" />
                  <p className="text-[10px] text-slate-700">Waiting for candidate screen share</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Risk score */}
          <RiskScorePanel score={riskScore} events={events} />

          {/* Recent events */}
          <div className="card-sm space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white">Recent Signals</h3>
              <button onClick={() => setTab('events')}
                className="text-[11px] hover:opacity-70 cursor-pointer transition-opacity" style={{ color: '#00ea64' }}>
                View all →
              </button>
            </div>
            {events.length === 0
              ? <p className="text-[11px] text-slate-600">No signals yet</p>
              : [...events].slice(-4).reverse().map((e, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className={`badge badge-${e.severity} shrink-0`}>{e.severity}</span>
                    <span className="text-slate-400 capitalize truncate">{e.event_type.replace(/_/g, ' ')}</span>
                  </div>
                ))
            }
          </div>

          {/* Notes */}
          <div className="card-sm flex-1 flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-white">Interviewer Notes</h3>
            <textarea
              value={notes}
              onChange={e => { setNotes(e.target.value); saveNotes(e.target.value) }}
              placeholder="Notes visible to interviewers only…"
              className="input flex-1 min-h-[100px] resize-none text-xs leading-relaxed"
            />
            <p className="text-[10px] text-slate-700">Auto-saved</p>
          </div>

          {/* Export */}
          <div className="card-sm space-y-2">
            <h3 className="text-xs font-semibold text-white">Export Report</h3>
            <div className="flex gap-2">
              <a href={`/api/sessions/${id}/export.json`} target="_blank" rel="noreferrer"
                className="btn-outline text-xs flex-1 text-center py-1.5 inline-flex items-center justify-center gap-1">
                <DownloadIcon size={11} /> JSON
              </a>
              <a href={`/api/sessions/${id}/export.html`} target="_blank" rel="noreferrer"
                className="btn-outline text-xs flex-1 text-center py-1.5 inline-flex items-center justify-center gap-1">
                <PrintIcon size={11} /> PDF
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const PlayIcon2 = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)
const PauseIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
  </svg>
)
const ChevL = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)
const ChevR = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

function FrameGallery({ frames, sessionId }) {
  const [frameData, setFrameData]   = useState({})   // id → data URL
  const [loadingIds, setLoadingIds] = useState({})   // id → boolean
  const [selectedIdx, setSelectedIdx] = useState(frames.length > 0 ? 0 : null)
  const [playing, setPlaying]       = useState(false)
  const playRef  = useRef(null)
  const thumbRef = useRef({})

  // Load a single frame by id (idempotent)
  const loadFrame = useCallback(async (frameId) => {
    if (frameData[frameId] || loadingIds[frameId]) return
    setLoadingIds(p => ({ ...p, [frameId]: true }))
    try {
      const res = await api.get(`/sessions/${sessionId}/frames/${frameId}`)
      setFrameData(p => ({ ...p, [frameId]: res.data.frame }))
    } catch {}
    finally { setLoadingIds(p => ({ ...p, [frameId]: false })) }
  }, [frameData, loadingIds, sessionId])

  // Auto-load all frames when the list arrives
  useEffect(() => {
    frames.forEach(f => loadFrame(f.id))
  }, [frames.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // Select first frame by default once it loads
  useEffect(() => {
    if (frames.length > 0 && selectedIdx === null) setSelectedIdx(0)
  }, [frames.length, selectedIdx])

  // Slideshow playback
  useEffect(() => {
    if (!playing) return
    playRef.current = setInterval(() => {
      setSelectedIdx(i => {
        const next = (i ?? 0) + 1
        if (next >= frames.length) { setPlaying(false); return i }
        return next
      })
    }, 2_000)
    return () => clearInterval(playRef.current)
  }, [playing, frames.length])

  // Scroll selected thumbnail into view
  useEffect(() => {
    if (selectedIdx !== null && thumbRef.current[selectedIdx]) {
      thumbRef.current[selectedIdx].scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
    }
  }, [selectedIdx])

  const selectedFrame = selectedIdx !== null ? frames[selectedIdx] : null
  const selectedData  = selectedFrame ? frameData[selectedFrame.id] : null

  const goTo  = (i) => { setPlaying(false); setSelectedIdx(i) }
  const prev  = () => selectedIdx > 0 && goTo(selectedIdx - 1)
  const next  = () => selectedIdx < frames.length - 1 && goTo(selectedIdx + 1)
  const togglePlay = () => {
    if (playing) { clearInterval(playRef.current); setPlaying(false) }
    else {
      if (selectedIdx >= frames.length - 1) setSelectedIdx(0)
      setPlaying(true)
    }
  }

  if (!frames.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-3">
          <div className="mx-auto h-10 w-10 rounded-xl bg-white/[0.03] flex items-center justify-center">
            <ScreenShareIcon size={18} className="text-slate-700" />
          </div>
          <p className="text-xs text-slate-600">No screen captures yet.</p>
          <p className="text-[11px] text-slate-700">Screen sharing must be active and monitoring level must be standard or full.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* ── Main viewer ── */}
      <div className="relative flex-1 bg-black/60 overflow-hidden flex items-center justify-center min-h-0">
        {selectedData ? (
          <img
            src={selectedData}
            alt={`Screen capture at ${selectedFrame && new Date(selectedFrame.captured_at).toLocaleTimeString()}`}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-700">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
            </svg>
            <span className="text-[11px]">Loading frame…</span>
          </div>
        )}

        {/* Prev / Next overlays */}
        {selectedIdx > 0 && (
          <button onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors cursor-pointer">
            <ChevL size={16} />
          </button>
        )}
        {selectedIdx < frames.length - 1 && (
          <button onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors cursor-pointer">
            <ChevR size={16} />
          </button>
        )}

        {/* Frame metadata overlay */}
        {selectedFrame && (
          <div className="absolute bottom-2 left-3 flex items-center gap-2 bg-black/70 rounded-lg px-2.5 py-1.5">
            <span className="text-[10px] text-white/70 font-mono">
              {new Date(selectedFrame.captured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-[10px] text-white/40">·</span>
            <span className="text-[10px] text-white/50">{selectedIdx + 1} / {frames.length}</span>
            {selectedFrame.width && (
              <>
                <span className="text-[10px] text-white/40">·</span>
                <span className="text-[10px] text-white/50">{selectedFrame.width}×{selectedFrame.height}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Playback controls ── */}
      <div className="flex items-center gap-3 border-t border-white/[0.06] bg-[#0d1117] px-4 py-2 shrink-0">
        <button onClick={togglePlay}
          className="h-7 w-7 flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer"
          title={playing ? 'Pause' : 'Play recording'}>
          {playing ? <PauseIcon size={13} /> : <PlayIcon2 size={13} />}
        </button>
        <button onClick={prev} disabled={selectedIdx === 0}
          className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default">
          <ChevL size={14} />
        </button>
        <button onClick={next} disabled={selectedIdx >= frames.length - 1}
          className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default">
          <ChevR size={14} />
        </button>

        {/* Progress bar */}
        <div className="flex-1 h-1.5 bg-white/[0.07] rounded-full overflow-hidden cursor-pointer"
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect()
            const pct  = (e.clientX - rect.left) / rect.width
            goTo(Math.min(frames.length - 1, Math.floor(pct * frames.length)))
          }}>
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${frames.length > 1 ? (selectedIdx / (frames.length - 1)) * 100 : 100}%`, background: '#00ea64' }} />
        </div>

        <span className="text-[10px] text-slate-600 font-mono shrink-0">
          {frames.length} frame{frames.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Thumbnail strip ── */}
      <div className="flex gap-2 overflow-x-auto border-t border-white/[0.06] bg-[#0a0f1a] p-2 shrink-0"
        style={{ scrollbarWidth: 'thin' }}>
        {frames.map((f, i) => (
          <button
            key={f.id}
            ref={el => { thumbRef.current[i] = el }}
            onClick={() => goTo(i)}
            className={`relative shrink-0 aspect-video w-24 rounded-md overflow-hidden border transition-all duration-150 cursor-pointer ${
              i === selectedIdx
                ? 'border-[#00ea64] ring-1 ring-[#00ea64]/30'
                : 'border-white/[0.06] hover:border-white/20 opacity-60 hover:opacity-100'
            }`}
          >
            {frameData[f.id] ? (
              <img src={frameData[f.id]} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white/[0.03] flex items-center justify-center">
                {loadingIds[f.id]
                  ? <svg className="h-3 w-3 animate-spin text-slate-700" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                    </svg>
                  : <ScreenShareIcon size={12} className="text-slate-700" />
                }
              </div>
            )}
            <span className="absolute bottom-0 inset-x-0 text-[8px] text-white/60 text-center bg-black/60 py-0.5 font-mono">
              {new Date(f.captured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Chip({ label, value }) {
  return (
    <div className="rounded-lg bg-white/[0.03] px-2 py-1.5">
      <p className="text-[10px] text-slate-600">{label}</p>
      <p className="text-xs text-slate-300 font-medium capitalize truncate">{value ?? '—'}</p>
    </div>
  )
}
