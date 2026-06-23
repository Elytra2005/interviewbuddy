import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'

const BrandLogoInline = (props) => <BrandLogo {...props} />

/* ── Reveal-on-scroll ──────────────────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.rv').forEach(el => el.classList.add('rv-in'))
      return
    }
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('rv-in'); obs.unobserve(e.target) }
      }),
      { threshold: 0.08 }
    )
    document.querySelectorAll('.rv').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

/* ── Static data ───────────────────────────────────────────────────────────── */
const NAV_LINKS = ['Products', 'Solutions', 'Resources']

// Casing matches each brand's actual wordmark style
const PARTNERS = [
  { name: 'Google',    family: 'sans-serif',    weight: '500', size: '15px', spacing: '-0.02em' },
  { name: 'Microsoft', family: 'sans-serif',    weight: '600', size: '13px', spacing: '0' },
  { name: 'stripe',    family: 'monospace',     weight: '400', size: '17px', spacing: '-0.01em' },
  { name: 'atlassian', family: 'sans-serif',    weight: '700', size: '13px', spacing: '0' },
  { name: 'Shopify',   family: 'sans-serif',    weight: '600', size: '14px', spacing: '-0.01em' },
  { name: 'figma',     family: 'sans-serif',    weight: '700', size: '14px', spacing: '-0.02em' },
]

const FEATURES = [
  {
    pill: 'DETECT',
    headline: ['Real-time', 'AI overlay', 'detection'],
    accent: 1,
    body: 'Identify Cluely, browser extensions and clipboard injections the moment they occur. Behavioural signals — typing cadence, idle gaps, paste bursts — surface patterns that manual review would miss.',
    reverse: false,
    mock: 'editor',
  },
  {
    pill: 'MONITOR',
    headline: ['Live session', 'view for', 'every interviewer'],
    accent: 0,
    body: 'Watch candidate screens in real time. The risk score updates as events arrive so your team always has an objective, explainable signal — never a binary verdict.',
    reverse: true,
    mock: 'dashboard',
  },
  {
    pill: 'REVIEW',
    headline: ['Full playback,', 'full context'],
    accent: 2,
    body: 'Replay any session snapshot by snapshot after it ends. Export a structured report with every event, timestamp and annotated risk breakdown for audits or debriefs.',
    reverse: false,
    mock: 'timeline',
  },
]

const TESTIMONIALS = [
  {
    initials: 'SK',
    logo: 'Stripe',
    quote: 'Interview Monitor cut our time-to-hire by 40% while giving us confidence that every candidate was evaluated on merit.',
    author: 'Sarah K.', role: 'Head of Engineering Hiring',
  },
  {
    initials: 'JT',
    logo: 'Atlassian',
    quote: 'The AI overlay detection is remarkably precise. We surfaced patterns we would never have caught in a traditional phone screen.',
    author: 'James T.', role: 'Senior Technical Recruiter',
  },
  {
    initials: 'PM',
    logo: 'Linear',
    quote: 'Finally a monitoring tool that respects candidates while giving hiring teams the insights they actually need.',
    author: 'Priya M.', role: 'VP of Talent',
  },
]

const FOOTER_COLS = [
  {
    heading: 'Product',
    links: [
      { label: 'Live Monitoring',  href: '/dashboard' },
      { label: 'Code Playback',    href: '/dashboard' },
      { label: 'Risk Reports',     href: '/dashboard' },
      { label: 'Session Export',   href: '/dashboard' },
    ],
  },
  {
    heading: 'Get Started',
    links: [
      { label: 'Create Free Account', href: '/signup' },
      { label: 'Log In',              href: '/login' },
      { label: 'Request Demo',        href: '#demo' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy',   href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy',    href: '/privacy' },
      { label: 'Data Processing',  href: '/privacy' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us',         href: '/about' },
      { label: 'Contact',          href: 'mailto:hello@interviewmonitor.app' },
      { label: 'Ethics Statement', href: '/about' },
      { label: 'Security',         href: '/privacy' },
    ],
  },
]

/* ── Deterministic star positions ──────────────────────────────────────────── */
const STARS = Array.from({ length: 90 }, (_, i) => ({
  cx: `${((i * 137.508) % 100).toFixed(2)}%`,
  cy: `${((i * 93.7)   % 100).toFixed(2)}%`,
  r:   (0.5 + (i % 3) * 0.4).toFixed(1),
  opacity: (0.15 + (i % 5) * 0.1).toFixed(2),
}))

/* ── Inline SVG icons ──────────────────────────────────────────────────────── */
const ChevLeft  = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)
const ChevRight = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)
const ArrowR = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)
const TwIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)
const LiIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
  </svg>
)
const GhIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
)

/* ── Shared star background ────────────────────────────────────────────────── */
function StarField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg width="100%" height="100%" className="absolute inset-0">
        {STARS.map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="white" opacity={s.opacity} />
        ))}
      </svg>
    </div>
  )
}

/* ── SVG wave section divider ──────────────────────────────────────────────── */
function WaveDivider({ from }) {
  const isDark = from === 'dark'
  return (
    <div className="relative overflow-hidden leading-none" style={{ height: 72 }}>
      <div className="absolute inset-0" style={{ background: isDark ? '#080d1a' : '#f8fafc' }} />
      <svg viewBox="0 0 1440 72" preserveAspectRatio="none"
        className="absolute bottom-0 w-full h-full"
        fill={isDark ? '#f8fafc' : '#080d1a'}>
        <path d="M0,36 C240,72 480,0 720,36 C960,72 1200,0 1440,36 L1440,72 L0,72 Z" />
      </svg>
    </div>
  )
}

/* ── Mock UI: code editor ──────────────────────────────────────────────────── */
const C = ({ c, children }) => <span className={c}>{children}</span>
const Line = ({ n, children }) => (
  <div className="flex">
    <span className="w-5 text-right mr-4 text-slate-700 shrink-0 select-none text-[11px]">{n}</span>
    <span>{children}</span>
  </div>
)

function EditorMock() {
  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0d1117] shadow-2xl text-[11px] font-mono leading-relaxed">
      <TitleBar label="solution.py — Interview Session" />
      <div className="p-4 space-y-1.5">
        <Line n={1}><C c="text-purple-400">def </C><C c="text-blue-300">two_sum</C><C c="text-slate-300">(nums, target):</C></Line>
        <Line n={2}><C c="text-slate-600">    # sliding window approach</C></Line>
        <Line n={3}><C c="text-slate-300">    seen = </C><C c="text-purple-400">{'{}'}</C></Line>
        <Line n={4}><C c="text-slate-300">    </C><C c="text-orange-300">for</C><C c="text-slate-300"> i, n </C><C c="text-orange-300">in</C><C c="text-slate-300"> enumerate(nums):</C></Line>
        <Line n={5}><C c="text-slate-300">        complement = target - n</C></Line>
        <Line n={6}><C c="text-slate-300">        </C><C c="text-orange-300">if</C><C c="text-slate-300"> complement </C><C c="text-orange-300">in</C><C c="text-slate-300"> seen:</C></Line>
        <Line n={7}><C c="text-[#00ea64]">            return [seen[complement], i]</C></Line>
        <Line n={8}><C c="text-slate-300">        seen[n] = i</C></Line>
      </div>
      <AlertBanner color="amber" text="Large paste detected — 312 chars in 0.4s · signal logged" />
    </div>
  )
}

/* ── Mock UI: live dashboard ───────────────────────────────────────────────── */
function DashboardMock() {
  const bars = [40, 55, 78, 33, 62, 48, 91]
  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0d1117] shadow-2xl text-[11px] font-mono">
      <TitleBar label="Live Session — Alex Johnson" badge="LIVE" />
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500">Risk Score</span>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-amber-400 to-orange-400" />
            </div>
            <span className="font-bold text-orange-400 tabular-nums">62</span>
          </div>
        </div>
        <div className="flex items-end gap-1 h-14">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-t" style={{
              height: `${h}%`,
              background: h > 80 ? '#f97316' : h > 60 ? '#f59e0b' : 'rgba(99,102,241,0.4)',
            }} />
          ))}
        </div>
        <div className="text-[9px] text-slate-700 text-center tracking-wide">Typing cadence · last 7 minutes</div>
        <div className="space-y-2 border-t border-white/[0.05] pt-2">
          {[
            { e: 'tab_hidden',     s: 'medium', t: '14:23' },
            { e: 'paste_detected', s: 'high',   t: '14:31' },
            { e: 'cluely_pattern', s: 'high',   t: '14:38' },
          ].map(({ e, s, t }) => (
            <div key={e} className="flex items-center gap-2">
              <span className={`shrink-0 rounded px-1.5 py-0.5 font-semibold text-[9px] ${
                s === 'high' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'
              }`}>{s}</span>
              <span className="text-slate-400 flex-1 truncate">{e}</span>
              <span className="text-slate-700 text-[9px]">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Mock UI: session timeline ─────────────────────────────────────────────── */
function TimelineMock() {
  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0d1117] shadow-2xl text-[11px] font-mono">
      <TitleBar label="Session Report — Export ready" />
      <div className="p-4 space-y-3">
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-3 grid grid-cols-3 gap-2 text-center">
          {[['Risk', '78', 'text-red-400'], ['Events', '14', 'text-white'], ['Duration', '58m', 'text-white']].map(([l, v, c]) => (
            <div key={l}>
              <div className="text-[9px] text-slate-600 mb-0.5">{l}</div>
              <div className={`text-xl font-bold ${c}`}>{v}</div>
            </div>
          ))}
        </div>
        <div className="space-y-2.5 pt-1">
          {[
            { t: '00:04', e: 'Session started',           c: 'text-[#00ea64]' },
            { t: '12:18', e: 'Tab hidden (3.2s)',          c: 'text-amber-400' },
            { t: '23:45', e: 'Paste — 284 chars',         c: 'text-red-400' },
            { t: '31:02', e: 'Cluely pattern suspected',  c: 'text-red-400' },
            { t: '58:11', e: 'Session submitted',          c: 'text-slate-500' },
          ].map(({ t, e, c }) => (
            <div key={t} className="flex items-center gap-2 text-[10px]">
              <span className="text-slate-700 w-10 shrink-0 tabular-nums">{t}</span>
              <span className="h-px flex-1 bg-white/[0.05]" />
              <span className={c}>{e}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Shared mock sub-components ────────────────────────────────────────────── */
function TitleBar({ label, badge }) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 bg-[#161b22] border-b border-white/[0.06]">
      <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
      <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#00ea64]/60" />
      <span className="ml-3 text-[10px] text-slate-500 flex-1">{label}</span>
      {badge && (
        <span className="flex items-center gap-1 text-[#00ea64] text-[9px] font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00ea64] animate-pulse" />{badge}
        </span>
      )}
    </div>
  )
}
function AlertBanner({ color, text }) {
  const styles = {
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-400', text: 'text-amber-300' },
    red:   { bg: 'bg-red-500/10',   border: 'border-red-500/20',   dot: 'bg-red-400',   text: 'text-red-300'   },
  }
  const s = styles[color] || styles.amber
  return (
    <div className={`mx-4 mb-4 rounded-lg ${s.bg} border ${s.border} px-3 py-2 flex items-center gap-2`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot} animate-pulse shrink-0`} />
      <span className={`text-[10px] ${s.text}`}>{text}</span>
    </div>
  )
}

/* ── Hero product visual ───────────────────────────────────────────────────── */
function HeroVisual() {
  return (
    <div className="relative select-none pointer-events-none">

      {/* Browser chrome wrapper */}
      <div className="relative rounded-xl overflow-hidden border border-white/15 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.7)]">
        {/* Browser bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#0f1117] border-b border-white/[0.06]">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#00ea64]/60" />
          </div>
          <div className="flex-1 mx-3">
            <div className="bg-[#1a1f2e] rounded-md px-3 py-1.5 text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00ea64]/50 shrink-0" />
              interviewmonitor.app/sessions/abc-123
            </div>
          </div>
        </div>
        {/* Dashboard content */}
        <div className="bg-[#0d1117] p-4">
          <DashboardMock />
        </div>
      </div>

      {/* Floating risk-score chip */}
      <div className="absolute -top-5 -right-5 rounded-xl bg-[#0d1117] border border-white/10 px-4 py-3 shadow-xl text-center min-w-[88px]">
        <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wide">Risk</p>
        <p className="text-2xl font-bold text-orange-400 font-mono tabular-nums leading-tight">62</p>
        <p className="text-[9px] text-amber-500 font-mono">↑ Medium</p>
      </div>

      {/* Floating event notification */}
      <div className="absolute -bottom-5 -left-5 rounded-xl bg-[#0d1117] border border-white/10 p-3 shadow-xl flex items-center gap-2.5 max-w-[220px]">
        <div className="h-8 w-8 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
          <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-white leading-tight">Risk signal detected</p>
          <p className="text-[9px] text-slate-500 mt-0.5 font-mono">paste_detected · high</p>
        </div>
      </div>
    </div>
  )
}

/* ── Navbar ────────────────────────────────────────────────────────────────── */
function Nav({ scrolled }) {
  const [open, setOpen] = useState(false)
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-[#080d1a]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-xl shadow-black/40'
        : 'bg-transparent'
    }`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        {/* Logo */}
        <Link to="/" className="cursor-pointer">
          <BrandLogoInline size={26} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5" aria-label="Main">
          {NAV_LINKS.map(l => (
            <button key={l}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-all duration-200 cursor-pointer">
              {l}
            </button>
          ))}
        </nav>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/login" className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer">
            Log In
          </Link>
          <button className="px-4 py-2 text-sm text-white border border-white/20 rounded-lg hover:border-white/40 hover:bg-white/[0.04] transition-all duration-200 cursor-pointer">
            Request Demo
          </button>
          <Link to="/signup"
            className="px-5 py-2 text-sm font-semibold rounded-lg text-black transition-all duration-200 hover:opacity-90 cursor-pointer"
            style={{ background: '#00ea64' }}>
            Create free account
          </Link>
        </div>

        {/* Mobile burger */}
        <button onClick={() => setOpen(o => !o)} aria-label="Toggle menu"
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open
              ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#080d1a]/98 backdrop-blur-xl px-5 py-4 space-y-1">
          {NAV_LINKS.map(l => (
            <button key={l} className="block w-full text-left px-3 py-2.5 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.04] cursor-pointer transition-colors">
              {l}
            </button>
          ))}
          <div className="pt-3 space-y-2 border-t border-white/[0.06] mt-2">
            <Link to="/login" className="block text-center py-2.5 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer">Log In</Link>
            <Link to="/signup"
              className="block text-center py-2.5 text-sm font-semibold rounded-lg text-black cursor-pointer hover:opacity-90 transition-opacity"
              style={{ background: '#00ea64' }}>
              Create free account
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

/* ── Hero ──────────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-5 pt-24 pb-16"
      style={{ background: 'linear-gradient(160deg, #07101f 0%, #0b1322 55%, #080d1a 100%)' }}>
      <StarField />


      {/* Two-column layout: text left, visual right */}
      <div className="relative z-10 mx-auto max-w-6xl w-full grid lg:grid-cols-[1fr,1.05fr] gap-12 lg:gap-16 items-center">

        {/* Left: copy */}
        <div className="space-y-7 text-center lg:text-left">
          {/* Headline */}
          <h1 style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-4xl sm:text-5xl lg:text-[58px] font-bold leading-[1.07] tracking-tight text-white">
            Hire engineers<br />
            who <span style={{ color: '#00ea64' }}>actually</span><br />
            wrote the code
          </h1>

          {/* Sub */}
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
            className="text-lg text-slate-400 leading-relaxed max-w-lg mx-auto lg:mx-0">
            Real-time behavioural monitoring for technical interviews. Detect AI overlays, paste injections and anomalous typing — without punishing honest candidates.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
            <Link to="/signup"
              className="inline-flex items-center gap-2 rounded-lg px-7 py-3.5 text-sm font-semibold text-black transition-all duration-200 hover:opacity-90 cursor-pointer"
              style={{ background: '#00ea64' }}>
              Get started free <ArrowR size={14} />
            </Link>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-7 py-3.5 text-sm font-medium text-white hover:border-white/40 hover:bg-white/[0.05] transition-all duration-200 cursor-pointer">
              Watch a demo
            </button>
          </div>

          {/* Partner names */}
          <div className="pt-2 space-y-4">
            <p style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
              className="text-[10px] uppercase tracking-[0.16em] text-slate-600 text-center lg:text-left">
              Trusted by teams at
            </p>
            <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start">
              {PARTNERS.map(p => (
                <span key={p.name}
                  style={{
                    fontFamily: p.family === 'monospace' ? "'JetBrains Mono', monospace" : "'IBM Plex Sans', sans-serif",
                    fontWeight: p.weight,
                    fontSize: p.size,
                    letterSpacing: p.spacing,
                    color: 'rgba(255,255,255,0.28)',
                  }}
                  className="cursor-default hover:opacity-60 transition-opacity duration-200">
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: product visual (desktop only) */}
        <div className="hidden lg:block">
          <HeroVisual />
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-28"
        style={{ background: 'linear-gradient(to bottom, transparent, #080d1a)' }} />
    </section>
  )
}

/* ── Feature row ───────────────────────────────────────────────────────────── */
const MOCKS = { editor: EditorMock, dashboard: DashboardMock, timeline: TimelineMock }

function FeatureRow({ pill, headline, accent, body, reverse, mock }) {
  const Mock = MOCKS[mock]
  return (
    <section className="bg-[#f8fafc] py-24 px-5">
      <div className={`mx-auto max-w-6xl flex flex-col gap-12 lg:gap-20 items-center ${
        reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'
      }`}>
        {/* Text */}
        <div className="flex-1 space-y-6 rv">
          <span className="inline-block rounded-full bg-[#111827] px-4 py-1.5 text-[9px] font-bold tracking-[0.18em] text-white uppercase">
            {pill}
          </span>
          <h2 style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.1] text-[#0f172a]">
            {headline.map((word, i) => (
              <span key={i}>
                {i === accent
                  ? <span style={{ color: '#00ea64' }}>{word}</span>
                  : word}
                {i < headline.length - 1 && <br />}
              </span>
            ))}
          </h2>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
            className="text-[15px] text-slate-600 leading-relaxed max-w-lg">
            {body}
          </p>
          <a href="#"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0f172a] hover:text-[#00c454] transition-colors duration-200 border-b border-current pb-px cursor-pointer">
            Learn more <ArrowR size={13} />
          </a>
        </div>
        {/* Mock */}
        <div className="flex-1 w-full rv">
          <Mock />
        </div>
      </div>
    </section>
  )
}

/* ── Testimonials ──────────────────────────────────────────────────────────── */
function Testimonials() {
  const [idx, setIdx] = useState(0)
  const timer = useRef(null)

  const restart = useCallback((i) => {
    clearInterval(timer.current)
    setIdx(((i % TESTIMONIALS.length) + TESTIMONIALS.length) % TESTIMONIALS.length)
    timer.current = setInterval(() => setIdx(x => (x + 1) % TESTIMONIALS.length), 5500)
  }, [])

  useEffect(() => {
    timer.current = setInterval(() => setIdx(x => (x + 1) % TESTIMONIALS.length), 5500)
    return () => clearInterval(timer.current)
  }, [])

  const { initials, logo, quote, author, role } = TESTIMONIALS[idx]

  return (
    <section className="relative py-32 px-5 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #070c18 0%, #0a1020 60%, #060b14 100%)' }}>
      <StarField />

      <div className="relative z-10 mx-auto max-w-2xl text-center space-y-10 rv">
        {/* Company "logo" — styled initials + wordmark */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <span className="text-sm font-bold text-white/40">{initials}</span>
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/25">{logo}</span>
        </div>

        {/* Quote */}
        <blockquote key={idx}
          style={{ fontFamily: "'IBM Plex Sans', sans-serif", animation: 'quoteIn 0.4s ease' }}
          className="text-xl sm:text-2xl text-slate-300 leading-relaxed font-light">
          "{quote}"
        </blockquote>

        {/* Author */}
        <div>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
            className="text-sm font-semibold text-white">{author}</p>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
            className="text-xs text-slate-500 mt-0.5">{role}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => restart(idx - 1)} aria-label="Previous"
            className="h-9 w-9 rounded-full border border-white/20 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/50 transition-all duration-200 cursor-pointer">
            <ChevLeft size={14} />
          </button>
          <div className="flex items-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => restart(i)} aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === idx ? 'w-6 bg-[#00ea64]' : 'w-1.5 bg-white/20 hover:bg-white/40'
                }`} />
            ))}
          </div>
          <button onClick={() => restart(idx + 1)} aria-label="Next"
            className="h-9 w-9 rounded-full border border-white/20 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/50 transition-all duration-200 cursor-pointer">
            <ChevRight size={14} />
          </button>
        </div>
      </div>

      <style>{`@keyframes quoteIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }`}</style>
    </section>
  )
}

/* ── Split CTA ─────────────────────────────────────────────────────────────── */
function SplitCTA() {
  return (
    <section className="bg-[#f8fafc] py-24 px-5">
      <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-6">
        {/* Developers */}
        <div className="rv rounded-2xl border border-slate-200 bg-white p-10 space-y-5 hover:shadow-2xl hover:shadow-slate-200/80 hover:-translate-y-0.5 transition-all duration-300">
          <span className="inline-block rounded-full bg-slate-900 px-4 py-1.5 text-[9px] font-bold tracking-[0.18em] text-white uppercase">
            For Developers
          </span>
          <h3 style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-2xl font-bold text-[#0f172a] leading-snug">
            Interview with<br /><span style={{ color: '#00ea64' }}>full transparency</span>.
          </h3>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
            className="text-sm text-slate-600 leading-relaxed">
            Every signal requires human review. No black boxes, no automatic disqualifications. Know exactly what is being recorded before you start.
          </p>
          <a href="#"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-[#0f172a] px-6 py-3 text-sm font-semibold text-[#0f172a] hover:bg-[#0f172a] hover:text-white transition-all duration-200 cursor-pointer">
            Learn how it works <ArrowR size={13} />
          </a>
        </div>

        {/* Companies */}
        <div className="rv rounded-2xl p-10 space-y-5"
          style={{ background: 'linear-gradient(135deg, #0d1117 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <span className="inline-block rounded-full border border-[#00ea64]/30 bg-[#00ea64]/[0.07] px-4 py-1.5 text-[9px] font-bold tracking-[0.18em] text-[#00ea64] uppercase">
            For Companies
          </span>
          <h3 style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-2xl font-bold text-white leading-snug">
            Hire with <span style={{ color: '#00ea64' }}>integrity</span>.<br />Start for free.
          </h3>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
            className="text-sm text-slate-400 leading-relaxed">
            Set up your first monitored interview in under 2 minutes. No credit card, no commitment — just real signal on every technical screen.
          </p>
          <Link to="/signup"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-black hover:opacity-90 transition-opacity duration-200 cursor-pointer"
            style={{ background: '#00ea64' }}>
            Get started free <ArrowR size={13} />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── Footer ────────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background: '#05080f' }} className="border-t border-white/[0.05]">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 pt-16 pb-10 grid grid-cols-2 md:grid-cols-4 gap-10">
        {FOOTER_COLS.map(col => (
          <div key={col.heading}>
            <h4 style={{ fontFamily: "'JetBrains Mono', monospace" }}
              className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600 mb-5">
              {col.heading}
            </h4>
            <ul className="space-y-3">
              {col.links.map(l => (
                <li key={l.label}>
                  {l.href.startsWith('mailto:') ? (
                    <a href={l.href}
                      style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                      className="text-sm text-slate-500 hover:text-white transition-colors duration-200 cursor-pointer">
                      {l.label}
                    </a>
                  ) : (
                    <Link to={l.href.startsWith('/') ? l.href : '#'}
                      style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                      className="text-sm text-slate-500 hover:text-white transition-colors duration-200 cursor-pointer">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Ethics note */}
      <div className="mx-auto max-w-7xl px-5 lg:px-8 pb-8">
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-5 py-4">
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
            className="text-xs text-slate-600 leading-relaxed max-w-2xl">
            <span className="text-slate-500 font-semibold">Ethics commitment —</span>{' '}
            Every monitoring signal requires human review. Interview Monitor does not make or automate hiring decisions.
            Candidates are informed and must consent before any session begins.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="cursor-pointer">
            <BrandLogoInline size={22} textSize="text-xs" />
          </Link>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
            className="text-xs text-slate-700">
            © {new Date().getFullYear()} InterviewMonitor. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {[{ Icon: TwIcon, label: 'Twitter' }, { Icon: LiIcon, label: 'LinkedIn' }, { Icon: GhIcon, label: 'GitHub' }].map(({ Icon, label }) => (
              <a key={label} href="#" aria-label={label}
                className="h-8 w-8 rounded-lg border border-white/[0.07] flex items-center justify-center text-slate-600 hover:text-white hover:border-white/20 transition-all duration-200 cursor-pointer">
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ── Page root ─────────────────────────────────────────────────────────────── */
export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  useReveal()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      <style>{`
        .rv { opacity: 0; transform: translateY(26px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .rv.rv-in { opacity: 1; transform: none; }
        @media (prefers-reduced-motion: reduce) { .rv { opacity: 1 !important; transform: none !important; transition: none !important; } }
        html { scroll-behavior: smooth; }
      `}</style>
      <div className="overflow-x-hidden">
        <Nav scrolled={scrolled} />
        <Hero />
        <WaveDivider from="dark" />
        {FEATURES.map(f => <FeatureRow key={f.pill} {...f} />)}
        <WaveDivider from="light" />
        <Testimonials />
        <WaveDivider from="dark" />
        <SplitCTA />
        <Footer />
      </div>
    </>
  )
}
