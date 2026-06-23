import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Select from '../components/Select'
import { ArrowLeftIcon } from '../components/Icons'
import api from '../utils/api'

const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python',     label: 'Python' },
  { value: 'java',       label: 'Java' },
  { value: 'cpp',        label: 'C++' },
  { value: 'go',         label: 'Go' },
  { value: 'rust',       label: 'Rust' },
  { value: 'sql',        label: 'SQL' },
]

const MONITORING_LEVELS = [
  {
    value:       'minimal',
    label:       'Minimal',
    description: 'Tab switching only. Lowest impact on candidate experience.',
    badge:       'badge-info',
  },
  {
    value:       'standard',
    label:       'Standard',
    description: 'Tab switching + paste detection + large code insertions.',
    badge:       'badge-medium',
  },
  {
    value:       'full',
    label:       'Full',
    description: 'All signals including typing cadence, DevTools, and AI-overlay patterns.',
    badge:       'badge-high',
  },
]

export default function CreateInterview() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title:             '',
    problem_statement: '',
    duration_minutes:  60,
    monitoring_level:  'standard',
    language:          'javascript',
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field) => (val) =>
    setForm(f => ({ ...f, [field]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/interviews', { ...form, duration_minutes: Number(form.duration_minutes) })
      navigate(`/interviews/${res.data.interview.id}`)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to create interview')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-5 py-8 space-y-6">
        {/* Back */}
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-white transition-colors cursor-pointer">
          <ArrowLeftIcon size={13} /> Dashboard
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-white">New Interview</h1>
          <p className="text-sm text-slate-500 mt-1">Set up a coding interview session with monitoring.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-white">Details</h2>
            <div>
              <label className="label" htmlFor="title">Interview title</label>
              <input
                id="title"
                value={form.title}
                onChange={e => set('title')(e.target.value)}
                className="input"
                placeholder="Senior Frontend Engineer — React"
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="problem">Problem statement</label>
              <textarea
                id="problem"
                value={form.problem_statement}
                onChange={e => set('problem_statement')(e.target.value)}
                className="input min-h-[200px] resize-y font-mono text-xs leading-relaxed"
                placeholder="Describe the coding problem here…"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="duration">Duration (minutes)</label>
                <input
                  id="duration"
                  type="number" min={5} max={480}
                  value={form.duration_minutes}
                  onChange={e => set('duration_minutes')(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <Select
                  label="Language"
                  value={form.language}
                  onChange={set('language')}
                  options={LANGUAGE_OPTIONS}
                />
              </div>
            </div>
          </div>

          {/* Monitoring level */}
          <div className="card space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Monitoring Level</h2>
              <p className="text-xs text-slate-500 mt-0.5">All signals require human review — none are conclusive.</p>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {MONITORING_LEVELS.map(m => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => set('monitoring_level')(m.value)}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-150 cursor-pointer ${
                    form.monitoring_level === m.value
                      ? 'border-[#00ea64]/30 bg-[#00ea64]/[0.04]'
                      : 'border-[rgba(255,255,255,0.06)] bg-white/[0.01] hover:border-[rgba(255,255,255,0.12)] hover:bg-white/[0.03]'
                  }`}
                >
                  {/* Radio dot */}
                  <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                    form.monitoring_level === m.value
                      ? 'border-[#00ea64]'
                      : 'border-slate-600'
                  }`}
                    style={form.monitoring_level === m.value ? { background: '#00ea64' } : {}}>
                    {form.monitoring_level === m.value && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{m.label}</span>
                      <span className={m.badge}>{m.value}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{m.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Link to="/dashboard" className="btn-outline flex-none cursor-pointer">Cancel</Link>
            <button type="submit" disabled={loading} className="btn-primary flex-1 cursor-pointer">
              {loading ? (
                <><Spinner /> Creating…</>
              ) : 'Create Interview'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
    </svg>
  )
}
