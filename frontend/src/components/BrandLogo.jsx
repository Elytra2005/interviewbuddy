/**
 * BrandLogo — the InterviewMonitor shield + wordmark.
 * Matches the provided brand identity: dark-navy shield, green border, >_ terminal prompt.
 *
 * Props:
 *   size      — shield height in px (default 28)
 *   textSize  — wordmark font-size class (default 'text-sm')
 *   dark      — if true, "Interview" renders in dark navy (for light backgrounds)
 */
export default function BrandLogo({ size = 28, textSize = 'text-sm', dark = false }) {
  const aspect = 40 / 44   // viewBox ratio
  const w = Math.round(size * aspect)

  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      {/* Shield */}
      <svg
        width={w} height={size}
        viewBox="0 0 40 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Shield body */}
        <path
          d="M3.5 1 H36.5 Q39 1 39 3.5 V22 C39 33.5 27.5 41.5 20 43.5 C12.5 41.5 1 33.5 1 22 V3.5 Q1 1 3.5 1 Z"
          fill="#0d1827"
          stroke="#00ea64"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* >_ prompt — drawn as paths to avoid font rendering variance */}
        {/* > chevron */}
        <path
          d="M10.5 15.5 L17.5 22 L10.5 28.5"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* _ underscore */}
        <line
          x1="20" y1="28.5" x2="29" y2="28.5"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Wordmark */}
      <span
        className={`font-extrabold tracking-tight leading-none ${textSize}`}
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
      >
        <span style={{ color: dark ? '#0d1827' : 'white' }}>Interview</span>
        <span style={{ color: '#00ea64' }}>Monitor</span>
      </span>
    </span>
  )
}
