import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import {
  ArrowLeftIcon, ClockIcon, CodeIcon, EyeIcon, UserIcon,
  PlusIcon, CopyIcon, CheckIcon, ChevronRightIcon,
} from '../components/Icons'
import api from '../utils/api'

const TrashIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)

export default function InterviewDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [invite, setInvite]   = useState({ name: '', email: '' })
  const [inviteResult, setInviteResult] = useState(null)
  const [inviting, setInviting] = useState(false)
  const [error, setError]     = useState('')
  const [copied, setCopied]   = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting]           = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/interviews/${id}`)
      navigate('/dashboard')
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const load = () => {
    api.get(`/interviews/${id}`)
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }
  useEffect(load, [id])

  const sendInvite = async (e) => {
    e.preventDefault()
    setInviting(true); setError('')
    try {
      const res = await api.post(`/interviews/${id}/candidates`, invite)
      setInviteResult(res.data)
      setInvite({ name: '', email: '' })
      load()
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to invite candidate')
    } finally {
      setInviting(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(inviteResult.invite_link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="flex h-full flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center text-slate-600 text-sm">Loading…</div>
    </div>
  )

  const { interview, candidates } = data

  return (
    <div className="flex h-full flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 overflow-y-auto px-5 py-8 space-y-6">

        {/* Breadcrumb */}
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-white transition-colors cursor-pointer">
          <ArrowLeftIcon size={13} /> Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white truncate">{interview.title}</h1>
            <div className="flex flex-wrap gap-3 mt-1.5">
              <MetaChip Icon={ClockIcon}  label={`${interview.duration_minutes}m`} />
              <MetaChip Icon={CodeIcon}   label={interview.language} />
              <MetaChip Icon={EyeIcon}    label={`${interview.monitoring_level} monitoring`} capitalize />
              <MetaChip label={new Date(interview.created_at).toLocaleDateString()} />
            </div>
          </div>

          {/* Delete controls */}
          <div className="shrink-0">
            {confirmDelete ? (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3 py-2">
                <span className="text-xs text-red-400 whitespace-nowrap">Delete interview?</span>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-2 text-xs font-medium
                           text-slate-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/[0.05] transition-all duration-150 cursor-pointer"
              >
                <TrashIcon size={13} /> Delete
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Problem statement */}
          <div className="lg:col-span-2 card space-y-3">
            <h2 className="text-sm font-semibold text-white">Problem Statement</h2>
            <pre className="text-xs text-slate-400 whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto">
              {interview.problem_statement}
            </pre>
          </div>

          {/* Invite form */}
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-white">Invite Candidate</h2>
            <form onSubmit={sendInvite} className="space-y-3">
              <div>
                <label className="label">Name</label>
                <input value={invite.name} onChange={e => setInvite(i => ({ ...i, name: e.target.value }))}
                  className="input" placeholder="Alex Johnson" required />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" value={invite.email} onChange={e => setInvite(i => ({ ...i, email: e.target.value }))}
                  className="input" placeholder="alex@example.com" required />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button type="submit" disabled={inviting} className="btn-primary w-full cursor-pointer">
                {inviting
                  ? 'Generating…'
                  : <><PlusIcon size={13} /> Generate Invite Link</>}
              </button>
            </form>

            {inviteResult && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <CheckIcon size={11} className="text-emerald-400 shrink-0" />
                  <p className="text-xs font-medium text-emerald-400">Invite link ready</p>
                </div>
                <p className="text-[11px] text-slate-400 break-all font-mono bg-black/30 rounded-lg p-2 leading-relaxed">
                  {inviteResult.invite_link}
                </p>
                <button onClick={copyLink} className="btn-ghost w-full text-xs py-1.5 cursor-pointer">
                  {copied
                    ? <><CheckIcon size={12} /> Copied!</>
                    : <><CopyIcon size={12} /> Copy link</>}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Candidates table */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Candidates</h2>
            <span className="badge badge-info">{candidates.length}</span>
          </div>

          {candidates.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="mx-auto h-10 w-10 rounded-xl bg-white/[0.03] flex items-center justify-center">
                <UserIcon size={18} className="text-slate-700" />
              </div>
              <p className="text-xs text-slate-600">No candidates invited yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.04] text-slate-600">
                    <th className="text-left pb-2.5 font-medium">Name</th>
                    <th className="text-left pb-2.5 font-medium">Email</th>
                    <th className="text-left pb-2.5 font-medium">Status</th>
                    <th className="text-left pb-2.5 font-medium">Risk</th>
                    <th />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {candidates.map(c => (
                    <tr key={c.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-2.5 text-white font-medium">{c.name}</td>
                      <td className="py-2.5 text-slate-500">{c.email}</td>
                      <td className="py-2.5"><StatusBadge status={c.session_status ?? c.status} /></td>
                      <td className="py-2.5">
                        {c.risk_score != null ? <RiskChip score={c.risk_score} /> : <span className="text-slate-700">—</span>}
                      </td>
                      <td className="py-2.5 text-right">
                        {c.session_id && (
                          <Link to={`/sessions/${c.session_id}`}
                            className="inline-flex items-center gap-0.5 hover:opacity-80 transition-opacity cursor-pointer" style={{ color: '#00ea64' }}>
                            View <ChevronRightIcon size={11} />
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function MetaChip({ Icon, label, capitalize }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs text-slate-500 ${capitalize ? 'capitalize' : ''}`}>
      {Icon && <Icon size={11} className="shrink-0" />}
      {label}
    </span>
  )
}

function StatusBadge({ status }) {
  const styles = {
    invited:     'badge bg-white/5 text-slate-500',
    in_progress: 'badge badge-info',
    active:      'badge badge-low',
    completed:   'badge bg-[#00ea64]/10 text-[#00ea64] ring-1 ring-[#00ea64]/20',
    expired:     'badge bg-white/5 text-slate-700',
    abandoned:   'badge badge-high',
  }
  return <span className={styles[status] ?? 'badge bg-white/5 text-slate-500'}>{status ?? '—'}</span>
}

function RiskChip({ score }) {
  const c = score < 20 ? 'text-emerald-400' : score < 50 ? 'text-amber-400' : score < 75 ? 'text-orange-400' : 'text-red-400'
  return <span className={`font-bold tabular-nums ${c}`}>{Math.round(score)}</span>
}
