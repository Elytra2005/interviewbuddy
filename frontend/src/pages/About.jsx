import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'

const ArrowR = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)

const VALUES = [
  {
    title: 'Signals, not verdicts',
    body:  'Every detection we surface is a behavioural observation — a prompt for a human conversation, never an automated outcome. No candidate is disqualified by an algorithm.',
    icon:  '⚖',
  },
  {
    title: 'Consent first, always',
    body:  'Candidates read exactly what is and isn\'t monitored before a single event is logged. Informed consent is not a checkbox — it\'s the foundation of every session.',
    icon:  '✋',
  },
  {
    title: 'Transparent by design',
    body:  'The risk score formula is explainable. Every flag links to a specific event with a timestamp. Nothing is hidden from the candidate or the hiring team.',
    icon:  '🔍',
  },
  {
    title: 'No surveillance creep',
    body:  'We monitor what we say we monitor. Keystrokes outside the editor, audio, and clipboard content outside the code window are never captured.',
    icon:  '🛡',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Recruiter creates an interview',
    body:  'Set the problem, language, duration, and monitoring level. Generate a one-time invite link in under two minutes.',
  },
  {
    step: '02',
    title: 'Candidate reads and consents',
    body:  'Before a single event is recorded, the candidate sees a full disclosure of what will and won\'t be monitored — and must agree to continue.',
  },
  {
    step: '03',
    title: 'Live session with real-time signal',
    body:  'The interviewer watches a live code view and a live screen feed. Behavioural signals surface as they happen, each with a severity and full detail.',
  },
  {
    step: '04',
    title: 'Human review after the session',
    body:  'Replay the screen recording frame by frame, scrub through code snapshots, and read the event timeline. Export a structured report for team review.',
  },
]

const STATS = [
  { value: '30s',    label: 'Screen capture interval' },
  { value: '0',      label: 'Automated hiring decisions' },
  { value: '100%',   label: 'Candidate consent rate required' },
  { value: '0–100',  label: 'Explainable risk score range' },
]

export default function About() {
  return (
    <div className="min-h-screen bg-[#020617] text-white" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
      {/* Nav */}
      <header className="border-b border-white/[0.06] bg-[#020617]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="cursor-pointer">
            <BrandLogo size={26} textSize="text-sm" />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer">Log in</Link>
            <Link to="/signup"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-black cursor-pointer hover:opacity-90 transition-opacity"
              style={{ background: '#00ea64' }}>
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-5"
        style={{ background: 'linear-gradient(160deg, #07101f 0%, #0b1322 60%, #080d1a 100%)' }}>
        <div className="relative z-10 mx-auto max-w-3xl text-center space-y-6">
          <span className="inline-block rounded-full border border-[#00ea64]/25 bg-[#00ea64]/[0.07] px-4 py-1.5 text-[10px] font-bold tracking-[0.16em] text-[#00ea64] uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            About InterviewMonitor
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold leading-[1.1] tracking-tight"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Great engineers deserve<br />
            <span style={{ color: '#00ea64' }}>fair interviews.</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-xl mx-auto">
            Interview Monitor gives hiring teams objective behavioural signal while making
            the monitoring process transparent, consent-driven, and free of automated verdicts.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/[0.05] bg-[#0a0f1a]">
        <div className="mx-auto max-w-4xl px-5 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-white tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-5">
        <div className="mx-auto max-w-3xl space-y-6">
          <span className="text-[10px] font-bold tracking-[0.16em] text-[#00ea64] uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}>Our mission</span>
          <h2 className="text-2xl sm:text-3xl font-bold leading-snug"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Integrity on both sides of the screen
          </h2>
          <div className="space-y-4 text-slate-400 leading-relaxed text-[15px]">
            <p>
              Cheating in technical interviews harms companies and honest candidates alike. It distorts
              hiring signal, fills engineering teams with people who can't do the work they claimed, and
              undercuts the candidates who prepared and showed up with real skills.
            </p>
            <p>
              At the same time, surveillance technology has a long history of being used unjustly. We
              built Interview Monitor with one rule we will never compromise: <strong className="text-white">no signal we surface
              can be the sole basis for a hiring decision.</strong> Every flag is a behavioural observation
              that requires a human to interpret, contextualise, and act on.
            </p>
            <p>
              Our monitoring is transparent by design. Candidates know what is being recorded before they
              start. The risk score is explainable — every contributing event is logged with a timestamp,
              a type, and a severity. There are no black boxes.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-5 border-t border-white/[0.05]" style={{ background: '#070c18' }}>
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold tracking-[0.16em] text-[#00ea64] uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}>How it works</span>
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              From setup to review in four steps
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {HOW_IT_WORKS.map(s => (
              <div key={s.step} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-3">
                <span className="text-2xl font-bold tabular-nums" style={{ color: '#00ea64', fontFamily: "'JetBrains Mono', monospace" }}>
                  {s.step}
                </span>
                <h3 className="text-sm font-semibold text-white">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-5 border-t border-white/[0.05]">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold tracking-[0.16em] text-[#00ea64] uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}>Our principles</span>
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              What we will not compromise on
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {VALUES.map(v => (
              <div key={v.title} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-3">
                <div className="text-2xl select-none">{v.icon}</div>
                <h3 className="text-sm font-semibold text-white">{v.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we don't do */}
      <section className="py-20 px-5 border-t border-white/[0.05]" style={{ background: '#070c18' }}>
        <div className="mx-auto max-w-3xl space-y-6">
          <span className="text-[10px] font-bold tracking-[0.16em] text-[#00ea64] uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}>What we don't monitor</span>
          <h2 className="text-2xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Hard limits we set and honour
          </h2>
          <div className="grid gap-3">
            {[
              'Keystrokes or mouse movement outside the code editor window',
              'Audio from the candidate\'s microphone or environment',
              'Clipboard content that was not pasted into the editor',
              'Personal files, browser history, or applications not related to the session',
              'Biometric data of any kind',
              'Anything not explicitly listed in the candidate\'s consent screen',
            ].map(item => (
              <div key={item} className="flex items-start gap-3 text-sm text-slate-400">
                <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center text-[9px] text-red-400 font-bold">✕</div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-5 border-t border-white/[0.05] text-center">
        <div className="mx-auto max-w-xl space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Ready to monitor with integrity?
          </h2>
          <p className="text-slate-400">
            Interview Monitor is free. No credit card, no commitment — create your first interview in under two minutes.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/signup"
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-black hover:opacity-90 transition-opacity cursor-pointer"
              style={{ background: '#00ea64' }}>
              Create free account <ArrowR />
            </Link>
            <Link to="/" className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">
              Back to home
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-6 px-5 text-center">
        <p className="text-xs text-slate-700">
          © {new Date().getFullYear()} InterviewMonitor ·{' '}
          <Link to="/privacy" className="hover:text-slate-500 transition-colors cursor-pointer">Privacy Policy</Link>
          {' · '}
          <Link to="/terms" className="hover:text-slate-500 transition-colors cursor-pointer">Terms of Service</Link>
        </p>
      </footer>
    </div>
  )
}
