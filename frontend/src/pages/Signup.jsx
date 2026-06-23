import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowLeftIcon, UserIcon, BotIcon, CheckIcon } from '../components/Icons'
import BrandLogo from '../components/BrandLogo'
import api from '../utils/api'

const ROLES = [
  {
    value:       'recruiter',
    label:       'Recruiter',
    description: 'I source and coordinate candidates across all roles.',
    Icon:        UserIcon,
  },
  {
    value:       'tech_recruiter',
    label:       'Technical Recruiter',
    description: 'I specialise in engineering and technical hiring.',
    Icon:        BotIcon,
  },
]

export default function Signup() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [form, setForm] = useState({
    role:     'recruiter',
    name:     '',
    email:    '',
    org_name: '',
    password: '',
    confirm:  '',
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const setRole = (role) => setForm(f => ({ ...f, role }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/auth/register', {
        name:     form.name,
        email:    form.email,
        password: form.password,
        role:     form.role,
        org_name: form.org_name,
      })
      localStorage.setItem('auth_token', res.data.token)
      await login(form.email, form.password)
      navigate('/onboarding')
    } catch (err) {
      setError(err.response?.data?.error ?? err.response?.data?.errors?.[0]?.msg ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] flex">
      {/* Left panel — form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-10">
        {/* Back */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors cursor-pointer">
            <ArrowLeftIcon size={13} /> Back to home
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto space-y-7">
          {/* Brand */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 mb-4">
              <BrandLogo size={26} textSize="text-sm" />
            </div>
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="text-sm text-slate-500">
              Already have one?{' '}
              <Link to="/login" className="font-medium hover:opacity-80 transition-opacity cursor-pointer" style={{ color: '#00ea64' }}>
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selection */}
            <div className="space-y-2">
              <label className="label">Your role</label>
              <div className="grid grid-cols-2 gap-2.5">
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-all duration-150 cursor-pointer ${
                      form.role === r.value
                        ? 'border-[#00ea64]/30 bg-[#00ea64]/[0.05]'
                        : 'border-white/[0.06] bg-white/[0.01] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                      form.role === r.value ? 'bg-[#00ea64]/10' : 'bg-white/[0.04]'
                    }`}>
                      <r.Icon size={14} className={form.role === r.value ? '' : 'text-slate-500'}
                        style={form.role === r.value ? { color: '#00ea64' } : {}} />
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${form.role === r.value ? 'text-white' : 'text-slate-300'}`}>{r.label}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5 leading-relaxed">{r.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Full name</label>
                <input value={form.name} onChange={set('name')} className="input" placeholder="Jane Smith" required />
              </div>
              <div>
                <label className="label">Company name</label>
                <input value={form.org_name} onChange={set('org_name')} className="input" placeholder="Acme Corp" required />
              </div>
            </div>

            <div>
              <label className="label">Work email</label>
              <input type="email" value={form.email} onChange={set('email')} className="input" placeholder="you@company.com" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Password</label>
                <input type="password" value={form.password} onChange={set('password')} className="input" placeholder="Min. 8 characters" required minLength={8} />
              </div>
              <div>
                <label className="label">Confirm password</label>
                <input type="password" value={form.confirm} onChange={set('confirm')} className="input" placeholder="Repeat password" required />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-sm cursor-pointer">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner /> Creating account…
                </span>
              ) : 'Create account'}
            </button>

            <p className="text-center text-[11px] text-slate-600 leading-relaxed">
              By creating an account you agree that all monitoring signals require human review
              and may not be used as sole grounds for any decision.
            </p>
          </form>
        </div>
      </div>

      {/* Right panel — visual */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-center px-12 border-l border-white/[0.04] bg-[#070d1a] relative overflow-hidden">
        <div className="relative space-y-8 max-w-sm">
          {/* Mini product card */}
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">Alex Johnson · Live session</span>
              <span className="flex items-center gap-1 text-[#00ea64] text-[10px] font-bold font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00ea64] animate-pulse" />LIVE
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">Risk score</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-24 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-amber-400 to-orange-400" />
                </div>
                <span className="text-sm font-bold text-orange-400 font-mono tabular-nums">62</span>
              </div>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {['tab_hidden', 'paste_detected', 'cluely_pattern'].map(e => (
                <span key={e} className="rounded px-2 py-0.5 bg-red-500/10 text-red-400 text-[9px] font-mono">{e}</span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2.5 leading-snug">Designed for recruiters who care</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Interview Monitor gives you behavioural signal without replacing your judgement.
              Every flag is an observation — not a verdict.
            </p>
          </div>

          <div className="space-y-3">
            {[
              'Consent screen shown to every candidate',
              'Signals are observations, not conclusions',
              'Export full session reports for team review',
              'No automatic disqualifications',
            ].map(item => (
              <div key={item} className="flex items-start gap-3 text-sm text-slate-400">
                <div className="h-5 w-5 shrink-0 rounded-full flex items-center justify-center mt-0.5"
                  style={{ background: 'rgba(0,234,100,0.1)', color: '#00ea64' }}>
                  <CheckIcon size={11} className="text-[#00ea64]" />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
    </svg>
  )
}
