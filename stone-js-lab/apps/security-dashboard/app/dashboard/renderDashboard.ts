import { MetricsSnapshot } from '../telemetry/MetricsStore'

/** Escape a value for safe HTML interpolation. */
function esc (value: unknown): string {
  return String(value).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c
  ))
}

/** Format a duration in ms as a compact `h m s` string. */
function uptime (ms: number): string {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return `${h}h ${m}m ${s % 60}s`
}

/**
 * Renders the live dashboard as a self-contained HTML page (no external assets).
 *
 * A `<meta refresh>` makes it "live" without client JS; the data comes straight from the shared
 * metrics store snapshot. Runtime metrics on the left, security metrics on the right.
 *
 * @param snapshot - The aggregated metrics snapshot.
 * @returns The HTML document.
 */
export function renderDashboard (snapshot: MetricsSnapshot): string {
  const { runtime, security } = snapshot

  const perType = Object.entries(runtime.perType)
    .map(([type, count]) => `<tr><td>${esc(type)}</td><td class="num">${count}</td></tr>`)
    .join('') || '<tr><td colspan="2" class="muted">no events yet</td></tr>'

  const events = security.recent
    .map((e) => `<tr>
      <td>${new Date(e.timestamp).toISOString().slice(11, 19)}</td>
      <td><span class="tag ${e.kind === 'login.failed' ? 'bad' : 'good'}">${esc(e.kind)}</span></td>
      <td>${esc(e.username)}</td>
      <td class="muted">${esc(e.detail)}</td>
    </tr>`)
    .join('') || '<tr><td colspan="4" class="muted">no security events yet — try the form</td></tr>'

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="refresh" content="3" />
  <title>Security Dashboard — Stone.js Lab</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body { margin: 0; font: 15px/1.5 -apple-system, system-ui, sans-serif; background: #0f1117; color: #e6e8ee; }
    header { padding: 24px 32px; border-bottom: 1px solid #232838; display: flex; align-items: baseline; gap: 16px; }
    header h1 { margin: 0; font-size: 20px; }
    header .up { color: #8b93a7; font-size: 13px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; padding: 24px 32px; }
    .card { background: #161a24; border: 1px solid #232838; border-radius: 12px; padding: 20px; }
    .card h2 { margin: 0 0 16px; font-size: 13px; text-transform: uppercase; letter-spacing: .08em; color: #8b93a7; }
    .kpis { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .kpi { background: #0f1117; border: 1px solid #232838; border-radius: 10px; padding: 14px; }
    .kpi .v { font-size: 26px; font-weight: 700; }
    .kpi .l { font-size: 12px; color: #8b93a7; }
    .kpi.good .v { color: #4ade80; } .kpi.bad .v { color: #f87171; } .kpi.warn .v { color: #fbbf24; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #232838; }
    th { color: #8b93a7; font-weight: 600; font-size: 12px; text-transform: uppercase; }
    td.num { text-align: right; font-variant-numeric: tabular-nums; }
    .muted { color: #6b7280; }
    .tag { padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 600; }
    .tag.good { background: #12351f; color: #4ade80; } .tag.bad { background: #3a1414; color: #f87171; }
    form { display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap; }
    input, button { font: inherit; padding: 8px 12px; border-radius: 8px; border: 1px solid #232838; background: #0f1117; color: #e6e8ee; }
    button { background: #2563eb; border-color: #2563eb; cursor: pointer; font-weight: 600; }
    .hint { font-size: 12px; color: #6b7280; margin-top: 10px; }
    code { background: #0f1117; padding: 1px 6px; border-radius: 6px; }
  </style>
</head>
<body>
  <header>
    <h1>🛡️ Security Dashboard</h1>
    <span class="up">Stone.js Lab · service <code>security-dashboard</code> · uptime ${uptime(snapshot.uptimeMs)} · auto-refresh 3s</span>
  </header>
  <div class="grid">
    <section class="card">
      <h2>Runtime metrics</h2>
      <div class="kpis">
        <div class="kpi"><div class="v">${runtime.totalRequests}</div><div class="l">total requests</div></div>
        <div class="kpi ${runtime.errorRatePct > 0 ? 'bad' : 'good'}"><div class="v">${runtime.errorRatePct}%</div><div class="l">error rate</div></div>
        <div class="kpi"><div class="v">${runtime.avgLatencyMs}<small>ms</small></div><div class="l">avg latency</div></div>
        <div class="kpi warn"><div class="v">${runtime.p95LatencyMs}<small>ms</small></div><div class="l">p95 latency</div></div>
      </div>
      <table style="margin-top:16px">
        <thead><tr><th>Event type</th><th class="num">Count</th></tr></thead>
        <tbody>${perType}</tbody>
      </table>
    </section>

    <section class="card">
      <h2>Security metrics</h2>
      <div class="kpis">
        <div class="kpi good"><div class="v">${security.loginSuccess}</div><div class="l">successful logins</div></div>
        <div class="kpi bad"><div class="v">${security.loginFailed}</div><div class="l">failed logins</div></div>
      </div>
      <form method="post" action="/login">
        <input name="username" placeholder="username" autocomplete="off" />
        <input name="password" type="password" placeholder="password" autocomplete="off" />
        <button type="submit">Attempt login</button>
      </form>
      <p class="hint">Valid demo credentials: <code>admin</code> / <code>stone</code>. Everything else is a failed attempt.</p>
      <table style="margin-top:8px">
        <thead><tr><th>Time</th><th>Kind</th><th>User</th><th>Detail</th></tr></thead>
        <tbody>${events}</tbody>
      </table>
    </section>
  </div>
</body>
</html>`
}
