import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  CheckIcon, EyeIcon, BotIcon, PlayIcon, ZapIcon, PlusIcon,
} from '../components/Icons'
import BrandLogo from '../components/BrandLogo'
import api from '../utils/api'

const STEPS = ['Welcome', 'Your team', 'You\'re ready']

export default function Onboarding() {
  const { user, markOnboarded } = useAuth()
  const navigate = useNavigate()
  const [step, setStep]       = useState(0)
  const [orgName, setOrgName] = useState('')
  const [saving, setSaving]   = useState(false)

  const finishOnboarding = async (goTo) => {
    setSaving(true)
    try {
      await api.put('/auth/onboard', { org_name: orgName || undefined })
      markOnboarded()
      navigate(goTo)
    } catch {
      markOnboarded()
      navigate(goTo)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 py-12">

      <div className="relative w-full max-w-lg space-y-6 animate-fade-in">
        {/* Brand */}
        <div className="flex justify-center">
          <BrandLogo size={26} textSize="text-sm" />
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-2 rounded-full transition-all duration-300 ${
                i < step  ? 'w-2 bg-[#00ea64]' :
                i === step ? 'w-6 bg-[#00ea64]' :
                             'w-2 bg-white/10'
              }`} />
              {i < STEPS.length - 1 && <div className="h-px w-4 bg-white/10" />}
            </div>
          ))}
        </div>
        <p className="text-center text-[11px] text-slate-600">Step {step + 1} of {STEPS.length}</p>

        {/* Step content */}
        {step === 0 && <StepWelcome name={user?.name} onNext={() => setStep(1)} />}
        {step === 1 && <StepTeam orgName={orgName} setOrgName={setOrgName} onNext={() => setStep(2)} />}
        {step === 2 && <StepReady saving={saving} onDashboard={() => finishOnboarding('/dashboard')} onInterview={() => finishOnboarding('/interviews/new')} />}
      </div>
    </div>
  )
}

/* ── Step 0: Welcome ─────────────────────────────────────────────────────── */
function StepWelcome({ name, onNext }) {
  const firstName = name?.split(' ')[0] ?? 'there'

  return (
    <div className="card space-y-6">
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ring-1"
          style={{ background: 'rgba(0,234,100,0.08)', ringColor: 'rgba(0,234,100,0.2)' }}>
          <ShieldIcon size={24} style={{ color: '#00ea64' }} />
        </div>
        <h1 className="text-xl font-bold text-white">Welcome, {firstName}!</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          You're joining a growing group of recruiters who believe interview integrity matters
          — and that ethical monitoring is the right way to get there.
        </p>
      </div>

      <div className="space-y-2.5">
        {[
          { Icon: EyeIcon,  title: 'Real-time session view', body: 'Watch live as candidates code. Risk score updates the moment signals come in.' },
          { Icon: BotIcon,  title: 'AI overlay detection',   body: 'Detects Cluely and similar tools via behavioural patterns.' },
          { Icon: PlayIcon, title: 'Code playback',          body: 'Replay any session snapshot by snapshot after it ends.' },
          { Icon: ZapIcon,  title: 'Instant risk score',     body: '0–100 weighted score with a full breakdown of contributing signals.' },
        ].map(({ Icon, title, body }) => (
          <div key={title} className="flex gap-3 rounded-xl bg-white/[0.02] border border-white/[0.04] px-3 py-2.5">
            <div className="h-6 w-6 shrink-0 flex items-center justify-center rounded-md bg-white/[0.04]">
              <Icon size={12} className="text-slate-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{title}</p>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 px-3 py-2.5">
        <p className="text-[11px] text-amber-400/80 leading-relaxed">
          Every signal requires human review. Interview Monitor does not make hiring decisions — you do.
        </p>
      </div>

      <button onClick={onNext} className="btn-primary w-full py-2.5 cursor-pointer">
        Continue
      </button>
    </div>
  )
}

/* ── Step 1: Team setup ──────────────────────────────────────────────────── */
function StepTeam({ orgName, setOrgName, onNext }) {
  return (
    <div className="card space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-white">Tell us about your team</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          This helps us set up your workspace. You can always update this later.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="label">Company / Organisation name</label>
          <input
            value={orgName}
            onChange={e => setOrgName(e.target.value)}
            className="input"
            placeholder="Acme Corp"
          />
          <p className="text-[11px] text-slate-600 mt-1">Leave blank to keep the name you entered during sign-up.</p>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">What to expect next</p>
        {[
          'Create your first interview in under 2 minutes',
          'Generate candidate invite links instantly',
          'Monitor sessions live or review afterwards',
        ].map((s, i) => (
          <div key={s} className="flex items-center gap-2.5 text-xs text-slate-400">
            <div className="h-5 w-5 shrink-0 flex items-center justify-center rounded-full text-[10px] font-bold"
              style={{ background: 'rgba(0,234,100,0.1)', color: '#00ea64' }}>
              {i + 1}
            </div>
            {s}
          </div>
        ))}
      </div>

      <button onClick={onNext} className="btn-primary w-full py-2.5 cursor-pointer">
        Continue
      </button>
    </div>
  )
}

/* ── Step 2: Ready ───────────────────────────────────────────────────────── */
function StepReady({ onDashboard, onInterview, saving }) {
  return (
    <div className="card space-y-6 text-center">
      <div className="space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
          <CheckIcon size={24} className="text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white">You're all set!</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Your account is ready. Start by creating your first interview,
          or explore the dashboard first.
        </p>
      </div>

      <div className="grid gap-3">
        <button
          onClick={onInterview}
          disabled={saving}
          className="btn-primary py-3 cursor-pointer flex items-center justify-center gap-2"
        >
          <PlusIcon size={15} />
          Create my first interview
        </button>
        <button
          onClick={onDashboard}
          disabled={saving}
          className="btn-ghost py-2.5 cursor-pointer"
        >
          Go to dashboard
        </button>
      </div>
    </div>
  )
}
