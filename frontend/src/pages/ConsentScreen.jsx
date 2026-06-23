import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  RefreshIcon, ClipboardIcon, KeyboardIcon, BotIcon,
  TerminalIcon, CameraIcon, ClockIcon, AlertIcon, ShieldIcon, CheckIcon,
} from '../components/Icons'
import api from '../utils/api'

export default function ConsentScreen() {
  const { token } = useParams()
  const navigate  = useNavigate()
  const [agreed, setAgreed]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleContinue = async () => {
    if (!agreed) return
    setLoading(true)
    try {
      const res = await api.post('/candidate/consent', { invite_token: token })
      sessionStorage.setItem('session_token', res.data.session_token)
      sessionStorage.setItem('invite_token',  token)
      navigate('/interview/room')
    } catch (err) {
      setError(err.response?.data?.error ?? 'Could not start session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020617] px-4 py-12">
      <div className="w-full max-w-xl space-y-5 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00ea64]/[0.08] ring-1 ring-[#00ea64]/20">
            <ShieldIcon size={22} className="text-[#00ea64]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Before you begin</h1>
          <p className="text-sm text-slate-500">Please read carefully — this takes 30 seconds.</p>
        </div>

        <div className="card space-y-5">
          {/* Disclaimer banner */}
          <div className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <AlertIcon size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-400/90 leading-relaxed">
              All monitoring data is collected as <strong className="text-amber-300">behavioural signals only</strong>.
              Nothing is automatic or conclusive — flags require human review before any decisions are made.
            </p>
          </div>

          {/* What IS monitored */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">What is monitored</h2>
            <div className="space-y-2">
              {MONITORED.map(item => (
                <div key={item.title} className="flex gap-3 rounded-xl bg-white/[0.02] border border-white/[0.04] px-3 py-2.5">
                  <div className="h-6 w-6 shrink-0 flex items-center justify-center rounded-lg bg-white/[0.04]">
                    <item.Icon size={13} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">{item.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What is NOT monitored */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">What is NOT monitored</h2>
            <div className="grid grid-cols-1 gap-1.5">
              {NOT_MONITORED.map((item, i) => (
                <div key={i} className="flex gap-2 text-[11px] text-slate-500">
                  <CheckIcon size={11} className="text-emerald-500 shrink-0 mt-px" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Security note */}
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2.5">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <span className="text-slate-400 font-medium">Security measures in effect:</span> Right-click is disabled.
              Developer tool shortcuts (F12, Ctrl+Shift+I) are blocked and flagged. Context menu access is logged.
            </p>
          </div>

          {/* Checkbox */}
          <label className="flex cursor-pointer gap-3 rounded-xl border border-white/[0.06] p-3.5 hover:border-[#00ea64]/20 transition-colors">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#00ea64] shrink-0" />
            <span className="text-xs text-slate-300 leading-relaxed">
              I understand and agree that my session will be monitored as described. I acknowledge that all flags
              are behavioural signals only and require human review.
            </span>
          </label>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleContinue}
            disabled={!agreed || loading}
            className="btn-primary w-full py-3 text-sm cursor-pointer"
          >
            {loading ? 'Starting session…' : 'I Agree — Begin Interview'}
          </button>
        </div>
      </div>
    </div>
  )
}

const MONITORED = [
  { Icon: RefreshIcon,   title: 'Tab switching & window focus',
    description: 'Leaving this tab or switching to another window is detected and logged.' },
  { Icon: ClipboardIcon, title: 'Copy-paste detection',
    description: 'Text pasted into the code editor is flagged by size (small / large / very large).' },
  { Icon: KeyboardIcon,  title: 'Typing cadence',
    description: 'Keystroke rhythm is analysed. Sudden large code blocks or superhuman typing speed are flagged.' },
  { Icon: BotIcon,       title: 'AI-overlay pattern detection',
    description: 'Patterns consistent with AI overlay tools (read pause → type burst, repeated) are flagged.' },
  { Icon: TerminalIcon,  title: 'Developer tools',
    description: 'Opening DevTools (F12, Ctrl+Shift+I) is intercepted, blocked, and flagged.' },
  { Icon: CameraIcon,    title: 'Webcam snapshot',
    description: 'One photo is taken at session start to verify your presence. Camera access is optional.' },
  { Icon: ClockIcon,     title: 'Code edit history',
    description: 'Snapshots are saved every 30 seconds to enable session playback and burst detection.' },
]

const NOT_MONITORED = [
  'Your screen is not recorded or shared without your explicit action',
  'Your audio and video beyond the initial one-time snapshot',
  'Your browser history, other tabs, or other applications',
  'Your clipboard contents directly — only paste events into the editor are detected',
  'Any personal data beyond your name, email, and session activity',
]
