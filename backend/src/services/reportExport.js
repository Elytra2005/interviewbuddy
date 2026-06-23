import { supabase } from '../config/supabase.js'
import { riskLabel } from './riskScore.js'

export async function buildSessionReport(sessionId) {
  const [sessionRes, eventsRes, snapshotsRes, notesRes] = await Promise.all([
    supabase
      .from('sessions')
      .select(`*, candidates!candidate_id ( name, email ), interviews!interview_id ( title, problem_statement, duration_minutes, monitoring_level )`)
      .eq('id', sessionId)
      .single(),
    supabase.from('events').select('event_type, severity, details, timestamp').eq('session_id', sessionId).order('timestamp'),
    supabase.from('code_snapshots').select('char_count, timestamp').eq('session_id', sessionId).order('timestamp'),
    supabase.from('interviewer_notes').select('content, updated_at, users ( name )').eq('session_id', sessionId),
  ])

  const session = sessionRes.data
  if (!session) return null

  const events = eventsRes.data ?? []
  const { label: riskLevelLabel, color: riskColor } = riskLabel(session.risk_score)

  const eventSummary = events.reduce((acc, e) => {
    acc[e.event_type] = (acc[e.event_type] || 0) + 1
    return acc
  }, {})

  return {
    generated_at: new Date().toISOString(),
    disclaimer: 'All flags are behavioural signals only. They are not proof of misconduct and require human review before any conclusions are drawn.',
    session: {
      id:               session.id,
      status:           session.status,
      started_at:       session.started_at,
      ended_at:         session.ended_at,
      consent_given:    session.consent_given,
      monitoring_level: session.interviews?.monitoring_level,
    },
    interview: {
      title:             session.interviews?.title,
      problem_statement: session.interviews?.problem_statement,
    },
    candidate: {
      name:  session.candidates?.name,
      email: session.candidates?.email,
    },
    risk_assessment: {
      score:      session.risk_score,
      label:      riskLevelLabel,
      color:      riskColor,
      disclaimer: 'Score is computed from weighted behavioural signals. A high score warrants review, not automatic disqualification.',
    },
    event_summary:   eventSummary,
    events,
    code_activity: {
      snapshot_count: snapshotsRes.data?.length ?? 0,
      snapshots:      snapshotsRes.data ?? [],
    },
    final_code: session.final_code ?? null,
    interviewer_notes: (notesRes.data ?? []).map(({ users, ...n }) => ({ ...n, interviewer_name: users?.name })),
  }
}

export function renderReportHtml(report) {
  const eventsHtml = report.events.map(e => `
    <tr>
      <td>${new Date(e.timestamp).toLocaleTimeString()}</td>
      <td>${e.event_type.replace(/_/g, ' ')}</td>
      <td class="sev-${e.severity}">${e.severity}</td>
      <td>${e.details?.note ?? JSON.stringify(e.details ?? {})}</td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Interview Report — ${report.candidate.name}</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 40px; color: #111; }
  h1   { font-size: 1.5rem; }
  h2   { font-size: 1.1rem; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 32px; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { text-align: left; padding: 6px 10px; border-bottom: 1px solid #eee; }
  th   { background: #f5f5f5; }
  .risk-score { font-size: 2rem; font-weight: bold; }
  .sev-low    { color: #16a34a; }
  .sev-medium { color: #d97706; }
  .sev-high   { color: #dc2626; }
  .disclaimer { background:#fef3c7; border:1px solid #fcd34d; padding:10px 16px; border-radius:6px; font-size:0.85rem; }
</style>
</head>
<body>
<h1>Interview Session Report</h1>
<p class="disclaimer">${report.disclaimer}</p>

<h2>Candidate</h2>
<p><strong>${report.candidate.name}</strong> &lt;${report.candidate.email}&gt;</p>

<h2>Interview</h2>
<p>${report.interview.title}</p>

<h2>Risk Assessment</h2>
<p class="risk-score" style="color:${report.risk_assessment.color}">${report.risk_assessment.score}/100 — ${report.risk_assessment.label}</p>
<p><em>${report.risk_assessment.disclaimer}</em></p>

<h2>Event Summary</h2>
<table>
  <tr><th>Event Type</th><th>Count</th></tr>
  ${Object.entries(report.event_summary).map(([k,v]) =>
    `<tr><td>${k.replace(/_/g,' ')}</td><td>${v}</td></tr>`).join('')}
</table>

<h2>Event Timeline</h2>
<table>
  <tr><th>Time</th><th>Event</th><th>Severity</th><th>Details</th></tr>
  ${eventsHtml}
</table>

<h2>Final Code</h2>
<pre style="background:#f9f9f9;padding:12px;overflow:auto;font-size:0.8rem">${report.final_code ?? '(no code submitted)'}</pre>

<p style="color:#999;font-size:0.75rem;margin-top:40px">Generated ${report.generated_at}</p>
</body>
</html>`
}
