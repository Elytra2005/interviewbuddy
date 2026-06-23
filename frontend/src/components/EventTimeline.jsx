import { EVENT_ICON_MAP } from './Icons'

const SEV_STYLES = {
  low:    'border-l-emerald-500/40 bg-emerald-500/5',
  medium: 'border-l-amber-500/40  bg-amber-500/5',
  high:   'border-l-red-500/40    bg-red-500/5',
}

function detail(e) {
  if (e.details?.chars_pasted)          return ` · ${e.details.chars_pasted} chars pasted`
  if (e.details?.chars_added)           return ` · ${e.details.chars_added} chars added`
  if (e.details?.idle_seconds)          return ` · ${e.details.idle_seconds}s idle before`
  if (e.details?.key)                   return ` · ${e.details.key}`
  if (e.details?.occurrences_last_60s)  return ` · ${e.details.occurrences_last_60s}× in 60s`
  return ''
}

export default function EventTimeline({ events = [] }) {
  if (!events.length) {
    return (
      <div className="card flex flex-col items-center justify-center gap-3 py-12 text-center">
        <div className="h-10 w-10 rounded-xl bg-white/[0.03] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="text-slate-700" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p className="text-xs text-slate-600">No signals recorded yet.</p>
      </div>
    )
  }

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Event Timeline</h3>
        <span className="badge badge-info">{events.length}</span>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-1.5 pr-1">
        {[...events].reverse().map((e, i) => {
          const IconComp = EVENT_ICON_MAP[e.event_type]
          return (
            <div
              key={e.id ?? i}
              className={`event-item flex gap-3 rounded-xl border-l-2 px-3 py-2.5 ${SEV_STYLES[e.severity] ?? SEV_STYLES.low}`}
            >
              <div className="h-5 w-5 shrink-0 flex items-center justify-center mt-px">
                {IconComp
                  ? <IconComp size={13} className="text-slate-500" />
                  : <span className="h-1.5 w-1.5 rounded-full bg-slate-600 block" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-white capitalize">
                    {e.event_type.replace(/_/g, ' ')}
                  </span>
                  <span className={`badge badge-${e.severity}`}>{e.severity}</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  {detail(e)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
