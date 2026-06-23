import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'

const SECTIONS = [
  {
    id: 'overview',
    title: '1. Overview',
    content: [
      {
        type: 'p',
        text: 'InterviewMonitor ("we", "us", or "our") is a technical interview monitoring platform. This Privacy Policy describes what personal data we collect, how we use it, who we share it with, and the rights you have over your data.',
      },
      {
        type: 'p',
        text: 'By using InterviewMonitor — whether as a recruiter, hiring manager, or interview candidate — you agree to the collection and use of data as described in this policy. If you do not agree, do not use the platform.',
      },
    ],
  },
  {
    id: 'who-we-are',
    title: '2. Who We Are and How to Contact Us',
    content: [
      {
        type: 'p',
        text: 'InterviewMonitor is operated independently and is provided as a free service. For all privacy-related questions, data requests, or concerns, contact us at: privacy@interviewmonitor.app',
      },
      {
        type: 'p',
        text: 'We aim to respond to all privacy requests within 30 days.',
      },
    ],
  },
  {
    id: 'data-we-collect',
    title: '3. Data We Collect',
    content: [
      {
        type: 'subheading',
        text: '3.1 Account Data (Recruiters & Interviewers)',
      },
      {
        type: 'list',
        items: [
          'Full name and email address (required to create an account)',
          'Password (stored as a one-way bcrypt hash — never in plaintext)',
          'Account role (interviewer or admin)',
          'Account creation date and time',
        ],
      },
      {
        type: 'subheading',
        text: '3.2 Interview Configuration Data',
      },
      {
        type: 'list',
        items: [
          'Interview title, problem statement, and duration',
          'Monitoring level selected (minimal, standard, or full)',
          'Programming language',
          'Candidate email and name (entered by the recruiter)',
          'One-time invite token and expiry date',
        ],
      },
      {
        type: 'subheading',
        text: '3.3 Candidate Session Data',
      },
      {
        type: 'p',
        text: 'The following data is collected during a candidate\'s interview session, after the candidate has read and explicitly agreed to the consent disclosure:',
      },
      {
        type: 'list',
        items: [
          'Webcam snapshot — a single still image captured at session start for identity verification. Webcam use is optional; the candidate may skip it.',
          'Code snapshots — periodic saves of the code editor contents during the session.',
          'Final submitted code — the candidate\'s code at the time of submission.',
          'Screen capture frames — JPEG screenshots of the candidate\'s screen captured approximately every 30 seconds (only when the candidate has granted screen sharing permission).',
          'Behavioural events — timestamped log entries for actions such as: tab switches (leaving and returning to the interview tab), large paste events, rapid code insertion, external resource detection, and screen share disconnection. Each event includes a severity level (low, medium, or high) and structured detail data.',
          'Session metadata — start time, end time, duration, and session status.',
          'Risk score — a numerical score (0–100) calculated from the weighted severity of behavioural events logged during the session.',
        ],
      },
      {
        type: 'subheading',
        text: '3.4 Technical & Log Data',
      },
      {
        type: 'list',
        items: [
          'HTTP request logs (IP address, user agent, request path, timestamp) retained for operational security purposes',
          'WebSocket connection metadata for live session relay',
          'Error logs for debugging and service reliability',
        ],
      },
    ],
  },
  {
    id: 'how-we-use',
    title: '4. How We Use Your Data',
    content: [
      {
        type: 'table',
        rows: [
          ['Purpose', 'Legal basis'],
          ['Authenticate users and protect accounts', 'Legitimate interest (security)'],
          ['Provide the interview monitoring service', 'Contractual necessity'],
          ['Relay live screen and code feeds to the interviewer during a session', 'Contractual necessity + candidate consent'],
          ['Store session recordings for post-interview review', 'Contractual necessity + candidate consent'],
          ['Calculate risk scores from behavioural events', 'Contractual necessity + candidate consent'],
          ['Generate session reports for hiring teams', 'Contractual necessity'],
          ['Operate and improve platform reliability', 'Legitimate interest'],
          ['Respond to data access, correction, or deletion requests', 'Legal obligation'],
        ],
      },
      {
        type: 'p',
        text: 'We do not use any collected data for advertising, selling to third parties, or training AI/ML models.',
      },
    ],
  },
  {
    id: 'screen-recording',
    title: '5. Screen Recording and Monitoring',
    content: [
      {
        type: 'p',
        text: 'Screen capture is a central feature of InterviewMonitor. We want to be completely transparent about how it works:',
      },
      {
        type: 'list',
        items: [
          'Candidates are shown a full disclosure of monitoring capabilities on the Consent Screen before any session data is collected.',
          'Screen sharing is initiated via the browser\'s getDisplayMedia API, which requires the candidate to actively select a screen to share. We cannot capture the screen without this explicit browser-level permission.',
          'Frames are captured approximately every 30 seconds as JPEG images and stored encrypted in our database.',
          'A lower-resolution live feed is also relayed to the interviewer\'s browser in near real-time during the session.',
          'We do not capture audio from the candidate\'s microphone at any time.',
          'We do not access clipboard contents that are not pasted into the editor.',
          'We do not read files or applications outside of what is visible in the selected screen share.',
        ],
      },
    ],
  },
  {
    id: 'data-storage',
    title: '6. Data Storage and Security',
    content: [
      {
        type: 'p',
        text: 'All data is stored in a Supabase (PostgreSQL) database hosted on infrastructure in the United States. We apply the following security controls:',
      },
      {
        type: 'list',
        items: [
          'Passwords are hashed using bcrypt with a work factor of 10 or higher.',
          'All API requests require a signed JSON Web Token (JWT).',
          'Database access is governed by Row Level Security (RLS) policies where applicable.',
          'Connections to the database use TLS encryption in transit.',
          'Screen frame data is stored as encrypted base64 strings.',
          'WebSocket connections use secure WSS protocol.',
        ],
      },
      {
        type: 'p',
        text: 'Despite these measures, no system is perfectly secure. We will notify affected users of any confirmed data breach in accordance with applicable law.',
      },
    ],
  },
  {
    id: 'retention',
    title: '7. Data Retention',
    content: [
      {
        type: 'table',
        rows: [
          ['Data type', 'Retention period'],
          ['Account data', 'Until account is deleted'],
          ['Interview configuration', 'Until interview is deleted by the recruiter'],
          ['Candidate session data (code, events, frames)', 'Until the interview is deleted, or candidate requests deletion'],
          ['Webcam snapshot', 'Until the session is deleted'],
          ['HTTP/error logs', '90 days, then automatically purged'],
          ['Risk scores', 'Until the session is deleted'],
        ],
      },
      {
        type: 'p',
        text: 'Recruiters and administrators can delete interviews at any time via the dashboard. Deletion of an interview cascades to all associated sessions, events, code snapshots, and screen frames.',
      },
    ],
  },
  {
    id: 'sharing',
    title: '8. Data Sharing and Third Parties',
    content: [
      {
        type: 'p',
        text: 'We do not sell, rent, or share personal data with third parties for their own purposes. We share data only as follows:',
      },
      {
        type: 'list',
        items: [
          'Supabase — our database provider (see supabase.com/privacy for their policy).',
          'Within your hiring team — recruiters and administrators in your organisation can view all sessions associated with interviews they created.',
          'Legal requirements — we may disclose data if required to do so by law, court order, or to protect the rights, property, or safety of users or others.',
        ],
      },
    ],
  },
  {
    id: 'candidate-rights',
    title: '9. Candidate Rights',
    content: [
      {
        type: 'p',
        text: 'As a candidate, you have the following rights regarding your personal data:',
      },
      {
        type: 'list',
        items: [
          'Right to know — you can request a description of all data collected during your interview session.',
          'Right to access — you can request a copy of the data collected about you.',
          'Right to correction — you can request correction of inaccurate data.',
          'Right to deletion — you can request deletion of all data related to your session.',
          'Right to withdraw consent — you may refuse screen sharing or webcam capture at any time during the consent flow. Note that withdrawal of consent may prevent the session from proceeding, at the discretion of the interviewing organisation.',
        ],
      },
      {
        type: 'p',
        text: 'To exercise any of these rights, email privacy@interviewmonitor.app with "Data Request" in the subject line. Include your name, the email used for your interview invite, and the approximate date of your session.',
      },
    ],
  },
  {
    id: 'cookies',
    title: '10. Cookies and Local Storage',
    content: [
      {
        type: 'p',
        text: 'InterviewMonitor does not use tracking cookies or advertising pixels. We use:',
      },
      {
        type: 'list',
        items: [
          'localStorage — to store your authentication token (JWT) on the interviewer side, so you remain logged in between page loads. This is essential for the platform to function and cannot be disabled without breaking authentication.',
          'sessionStorage — to store the candidate\'s session token during an active interview session. This is cleared when the browser tab is closed.',
        ],
      },
      {
        type: 'p',
        text: 'We do not use analytics services such as Google Analytics, Mixpanel, or similar.',
      },
    ],
  },
  {
    id: 'automated-decisions',
    title: '11. Automated Decision-Making',
    content: [
      {
        type: 'p',
        text: 'The risk score produced by InterviewMonitor is a calculated indicator, not an automated hiring decision. It is surfaced solely to assist human reviewers in identifying areas worth examining. No candidate is accepted or rejected by an algorithm.',
      },
      {
        type: 'p',
        text: 'Under GDPR Article 22, individuals have the right not to be subject to decisions based solely on automated processing that produce legal or similarly significant effects. InterviewMonitor\'s risk score does not constitute such automated decision-making because it is always subject to human review before any hiring outcome is determined.',
      },
    ],
  },
  {
    id: 'changes',
    title: '12. Changes to This Policy',
    content: [
      {
        type: 'p',
        text: 'We may update this Privacy Policy from time to time. When we make material changes, we will update the "Last updated" date at the top of this page and notify registered users by email at least 14 days before the change takes effect. Your continued use of the platform after that period constitutes acceptance of the updated policy.',
      },
    ],
  },
]

function Section({ section }) {
  return (
    <div id={section.id} className="space-y-4 scroll-mt-20">
      <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {section.title}
      </h2>
      {section.content.map((block, i) => {
        if (block.type === 'p') {
          return <p key={i} className="text-sm text-slate-400 leading-relaxed">{block.text}</p>
        }
        if (block.type === 'subheading') {
          return <h3 key={i} className="text-sm font-semibold text-slate-300 pt-2">{block.text}</h3>
        }
        if (block.type === 'list') {
          return (
            <ul key={i} className="space-y-2">
              {block.items.map((item, j) => (
                <li key={j} className="flex items-start gap-3 text-sm text-slate-400 leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: '#00ea64' }} />
                  {item}
                </li>
              ))}
            </ul>
          )
        }
        if (block.type === 'table') {
          const [header, ...rows] = block.rows
          return (
            <div key={i} className="overflow-x-auto rounded-lg border border-white/[0.06]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                    {header.map((col, k) => (
                      <th key={k} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, k) => (
                    <tr key={k} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.01]">
                      {row.map((cell, l) => (
                        <td key={l} className="px-4 py-2.5 text-xs text-slate-500 leading-relaxed">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        return null
      })}
    </div>
  )
}

export default function PrivacyPolicy() {
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
      <div className="border-b border-white/[0.05] py-14 px-5" style={{ background: '#070c18' }}>
        <div className="mx-auto max-w-4xl space-y-3">
          <span className="text-[10px] font-bold tracking-[0.16em] text-[#00ea64] uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}>Legal</span>
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Privacy Policy
          </h1>
          <p className="text-slate-500 text-sm">Last updated: June 22, 2026</p>
        </div>
      </div>

      {/* Layout */}
      <div className="mx-auto max-w-4xl px-5 py-12 lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
        {/* TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-1">
            <p className="mb-3 text-[10px] font-bold tracking-[0.12em] text-slate-600 uppercase">Contents</p>
            {SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`}
                className="block text-xs text-slate-600 hover:text-slate-300 transition-colors py-0.5 cursor-pointer">
                {s.title}
              </a>
            ))}
          </div>
        </aside>

        {/* Body */}
        <main className="space-y-12 min-w-0">
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] px-4 py-3">
            <p className="text-xs text-amber-400/80 leading-relaxed">
              <strong className="text-amber-400">Plain-language summary:</strong> We collect only what we need to run interview sessions. Candidate screen frames and behavioural events are collected only after explicit consent. We do not sell data. All data is deleted when an interview is deleted. Candidates may request deletion at any time.
            </p>
          </div>
          {SECTIONS.map(s => <Section key={s.id} section={s} />)}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-6 px-5 text-center">
        <p className="text-xs text-slate-700">
          © {new Date().getFullYear()} InterviewMonitor ·{' '}
          <Link to="/about" className="hover:text-slate-500 transition-colors cursor-pointer">About</Link>
          {' · '}
          <Link to="/terms" className="hover:text-slate-500 transition-colors cursor-pointer">Terms of Service</Link>
        </p>
      </footer>
    </div>
  )
}
