import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { PlusIcon, ClockIcon, UserIcon, BarChartIcon, ChevronRightIcon } from '../components/Icons'
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

export default function Dashboard() {
  const { user } = useAuth()
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    api.get('/interviews').then(r => setInterviews(r.data.interviews)).finally(() => setLoading(false))
  }, [])

  const deleteInterview = useCallback(async (id) => {
    await api.delete(`/interviews/${id}`)
    setInterviews(prev => prev.filter(i => i.id !== id))
  }, [])

  const totalCandidates = interviews.reduce((s, i) => s + (i.candidate_count ?? 0), 0)
  const totalSessions   = interviews.reduce((s, i) => s + (i.session_count ?? 0),   0)

  const firstName = user?.name?.split(' ')[0] ?? 'there'
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="flex h-full flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 overflow-y-auto px-5 py-8 space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{greeting}, {firstName}</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {interviews.length === 0
                ? 'Create your first interview to get started'
                : `${interviews.length} interview${interviews.length !== 1 ? 's' : ''} · ${totalSessions} session${totalSessions !== 1 ? 's' : ''} completed`}
            </p>
          </div>
          <Link to="/interviews/new" className="btn-primary shrink-0 cursor-pointer">
            <PlusIcon size={15} />New Interview
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard value={interviews.length} label="Interviews" Icon={BarChartIcon} color="text-indigo-400"   glow="rgba(99,102,241,0.15)" />
          <StatCard value={totalCandidates}   label="Candidates" Icon={UserIcon}     color="text-[#00ea64]"    glow="rgba(0,234,100,0.12)"  />
          <StatCard value={totalSessions}     label="Sessions"   Icon={ClockIcon}    color="text-amber-400"   glow="rgba(245,158,11,0.12)" />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex h-52 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <svg className="h-5 w-5 animate-spin text-slate-600" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
              </svg>
              <span className="text-xs text-slate-600">Loading interviews…</span>
            </div>
          </div>
        ) : interviews.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {interviews.map(iv => <InterviewCard key={iv.id} interview={iv} onDelete={deleteInterview} />)}
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({ value, label, Icon, color, glow }) {
  return (
    <div className="stat-card cursor-default group hover:border-white/10 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <span className="stat-label">{label}</span>
        <div className="h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-200"
          style={{ background: glow }}>
          <Icon size={14} className={color} />
        </div>
      </div>
      <span className="stat-value">{value}</span>
    </div>
  )
}

function InterviewCard({ interview: iv, onDelete }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting]     = useState(false)

  const handleDelete = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDeleting(true)
    try {
      await onDelete(iv.id)
    } catch {
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <div className="card group relative overflow-hidden hover:border-white/10 hover:-translate-y-0.5
                    transition-all duration-200 hover:shadow-xl hover:shadow-black/40 space-y-3">
      {/* Top accent on hover */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ea64]/30 to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between gap-2">
        <Link to={`/interviews/${iv.id}`} className="flex-1 min-w-0">
          <h2 className="font-semibold text-white group-hover:text-[#00ea64] transition-colors line-clamp-2 leading-snug">
            {iv.title}
          </h2>
        </Link>
        <div className="flex items-center gap-1.5 shrink-0">
          <MonitoringBadge level={iv.monitoring_level} />
          {/* Delete button */}
          {!confirming && (
            <button
              onClick={e => { e.preventDefault(); setConfirming(true) }}
              aria-label="Delete interview"
              className="opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded-md
                         text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 cursor-pointer"
            >
              <TrashIcon size={13} />
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{iv.problem_statement}</p>

      {/* Inline delete confirmation */}
      {confirming ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-red-500/20 bg-red-500/[0.06] px-3 py-2">
          <span className="text-xs text-red-400">Delete this interview and all its data?</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={e => { e.preventDefault(); setConfirming(false) }}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors cursor-pointer disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 pt-3 border-t border-[rgba(255,255,255,0.04)] text-[11px] text-slate-600">
          <span className="flex items-center gap-1"><ClockIcon size={11} />{iv.duration_minutes}m</span>
          <span className="flex items-center gap-1"><UserIcon size={11} />{iv.candidate_count}</span>
          <span className="flex items-center gap-1"><BarChartIcon size={11} />{iv.session_count}</span>
          <Link to={`/interviews/${iv.id}`}
            className="ml-auto flex items-center gap-0.5 text-slate-700 group-hover:text-[#00ea64] transition-colors">
            View <ChevronRightIcon size={11} />
          </Link>
        </div>
      )}
    </div>
  )
}

function MonitoringBadge({ level }) {
  const styles = {
    minimal:  'bg-slate-700/40 text-slate-400 border border-slate-600/30',
    standard: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    full:     'bg-[#00ea64]/10 text-[#00ea64] border border-[#00ea64]/20',
  }
  const style = styles[level] ?? styles.standard
  return (
    <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${style}`}>
      {level}
    </span>
  )
}

function EmptyState() {
  return (
    <div className="card flex flex-col items-center justify-center gap-5 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00ea64]/8 ring-1 ring-[#00ea64]/20">
        <BarChartIcon size={24} className="text-[#00ea64]/60" />
      </div>
      <div>
        <p className="font-semibold text-white">No interviews yet</p>
        <p className="text-sm text-slate-500 mt-1">Create your first interview to start monitoring candidates</p>
      </div>
      <Link to="/interviews/new" className="btn-primary cursor-pointer">
        <PlusIcon size={15} /> Create Interview
      </Link>
    </div>
  )
}
