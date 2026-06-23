import { EVENT_ICON_MAP } from './Icons'

export default function RiskScorePanel({ score = 0, events = [] }) {
  const { label, stroke, textCls, glowCls } = meta(score)

  const summary = Object.entries(
    events.reduce((acc, e) => { acc[e.event_type] = (acc[e.event_type] || 0) + 1; return acc }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 8)

  const R   = 36
  const C   = 2 * Math.PI * R
  const arc = C * (1 - Math.min(score, 100) / 100)

  return (
    <div className={`card space-y-4 ${glowCls}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Risk Signals</h3>
        <span className={`badge ${score < 20 ? 'badge-info' : score < 50 ? 'badge-medium' : 'badge-high'}`}>
          {label}
        </span>
      </div>

      {/* Gauge */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90" aria-hidden="true">
            <circle cx="44" cy="44" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
            <circle
              cx="44" cy="44" r={R} fill="none"
              stroke={stroke} strokeWidth="7"
              strokeDasharray={C} strokeDashoffset={arc}
              strokeLinecap="round"
              className="risk-arc"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-xl font-bold tabular-nums ${textCls}`}>{score}</span>
            <span className="text-[9px] font-semibold text-slate-600 uppercase tracking-wide">/ 100</span>
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>{events.length} signal{events.length !== 1 ? 's' : ''}</span>
              <span className={textCls}>{label}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className="risk-arc h-full rounded-full"
                style={{ width: `${score}%`, background: stroke }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Higher scores warrant closer human review before any conclusions.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 px-3 py-2.5">
        <p className="text-[11px] text-amber-400/80 leading-relaxed">
          All flags are behavioural signals only — not proof of misconduct. Human review required.
        </p>
      </div>

      {/* Breakdown */}
      {summary.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">Breakdown</p>
          {summary.map(([type, count]) => {
            const IconComp = EVENT_ICON_MAP[type]
            return (
              <div key={type} className="flex items-center gap-2.5 text-xs">
                <div className="h-5 w-5 shrink-0 flex items-center justify-center rounded-md bg-white/5">
                  {IconComp ? <IconComp size={11} className="text-slate-400" /> : null}
                </div>
                <span className="flex-1 text-slate-400 capitalize truncate">{type.replace(/_/g, ' ')}</span>
                <span className="tabular-nums font-semibold text-slate-500 shrink-0">×{count}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function meta(score) {
  if (score < 20) return { label: 'Low',      stroke: '#22c55e', textCls: 'text-emerald-400', glowCls: '' }
  if (score < 50) return { label: 'Medium',   stroke: '#f59e0b', textCls: 'text-amber-400',   glowCls: '' }
  if (score < 75) return { label: 'High',     stroke: '#f97316', textCls: 'text-orange-400',  glowCls: 'glow-orange' }
  return              { label: 'Very High', stroke: '#ef4444', textCls: 'text-red-400',     glowCls: 'glow-red' }
}
