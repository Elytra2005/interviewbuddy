export default function StatusIndicator({ label, active, unknown = false }) {
  const dot = unknown
    ? 'bg-gray-600'
    : active
    ? 'bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,.6)]'
    : 'bg-red-500'

  return (
    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dot} ${active && !unknown ? 'animate-pulse' : ''}`} />
      {label}
    </div>
  )
}
