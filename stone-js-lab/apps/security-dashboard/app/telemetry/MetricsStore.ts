import { TelemetryRecord } from '@stone-js/telemetry'

/** A security-relevant event surfaced on the dashboard. */
export interface SecurityEvent {
  timestamp: number
  kind: string
  username: string
  detail: string
}

/** The aggregated snapshot rendered by the dashboard. */
export interface MetricsSnapshot {
  uptimeMs: number
  runtime: {
    totalRequests: number
    ok: number
    error: number
    errorRatePct: number
    avgLatencyMs: number
    p95LatencyMs: number
    perType: Record<string, number>
  }
  security: {
    loginSuccess: number
    loginFailed: number
    recent: SecurityEvent[]
  }
}

/**
 * In-memory metrics aggregator.
 *
 * IMPORTANT — this lives at MODULE scope (a process-level singleton), deliberately OUTSIDE the
 * per-request ephemeral container. In Stone.js each request gets a fresh container, so
 * cross-request aggregation cannot live there: it belongs to a shared sink, exactly like the
 * adapter. The telemetry exporter (also shared, via `stone.telemetry.exporter`) feeds this store;
 * the dashboard reads it. This is the idiomatic place for app-lifetime state.
 */
export class MetricsStore {
  private readonly startedAt = Date.now()
  private totalRequests = 0
  private ok = 0
  private error = 0
  private readonly latencies: number[] = []
  private readonly perType: Record<string, number> = {}
  private loginSuccess = 0
  private loginFailed = 0
  private readonly securityEvents: SecurityEvent[] = []

  /**
   * Ingest one telemetry record. Dispatches runtime spans and security counters.
   *
   * @param record - The telemetry record.
   */
  record (record: TelemetryRecord): void {
    if (record.kind === 'span' && record.name === 'stone.event') {
      this.totalRequests++
      // The telemetry middleware already applies the OpenTelemetry convention (thrown error or
      // 5xx → status 'error'; 4xx stays 'ok'), so the span status is the single source of truth.
      if (record.status === 'error') { this.error++ } else { this.ok++ }
      if (typeof record.durationMs === 'number') { this.latencies.push(record.durationMs) }
      const type = String(record.attributes.type ?? 'unknown')
      this.perType[type] = (this.perType[type] ?? 0) + 1
      return
    }

    if (record.name === 'security.login.success') {
      this.loginSuccess += record.value ?? 1
      this.pushSecurity('login.success', record, 'Successful sign-in')
    } else if (record.name === 'security.login.failed') {
      this.loginFailed += record.value ?? 1
      this.pushSecurity('login.failed', record, 'Rejected credentials')
    }
  }

  /**
   * @returns The current aggregated snapshot.
   */
  snapshot (): MetricsSnapshot {
    const sorted = [...this.latencies].sort((a, b) => a - b)
    const avg = sorted.length > 0 ? sorted.reduce((s, v) => s + v, 0) / sorted.length : 0
    const p95 = sorted.length > 0 ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] : 0

    return {
      uptimeMs: Date.now() - this.startedAt,
      runtime: {
        totalRequests: this.totalRequests,
        ok: this.ok,
        error: this.error,
        errorRatePct: this.totalRequests > 0 ? Math.round((this.error / this.totalRequests) * 1000) / 10 : 0,
        avgLatencyMs: Math.round(avg * 100) / 100,
        p95LatencyMs: Math.round(p95 * 100) / 100,
        perType: { ...this.perType }
      },
      security: {
        loginSuccess: this.loginSuccess,
        loginFailed: this.loginFailed,
        recent: [...this.securityEvents].slice(-10).reverse()
      }
    }
  }

  /**
   * Append a security event (bounded ring buffer of the last 100).
   */
  private pushSecurity (kind: string, record: TelemetryRecord, detail: string): void {
    this.securityEvents.push({
      timestamp: record.timestamp,
      kind,
      username: String(record.attributes.username ?? 'unknown'),
      detail
    })
    if (this.securityEvents.length > 100) { this.securityEvents.shift() }
  }
}

/**
 * The shared, process-level metrics store singleton.
 * The exporter writes to it; the dashboard reads from it.
 */
export const metricsStore = new MetricsStore()
