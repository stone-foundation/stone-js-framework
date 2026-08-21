/**
 * Outcome of a telemetry span.
 */
export type TelemetryStatus = 'ok' | 'error'

/**
 * The kind of a telemetry record.
 */
export type TelemetryKind = 'span' | 'counter' | 'gauge'

/**
 * A single, exporter-agnostic telemetry record.
 */
export interface TelemetryRecord {
  /** Metric/span name (e.g. `stone.event`). */
  name: string
  /** Record kind. */
  kind: TelemetryKind
  /** Owning service name (from config). */
  service: string
  /** Wall-clock timestamp (ms) when the record was emitted. */
  timestamp: number
  /** Arbitrary key/value attributes. */
  attributes: Record<string, unknown>
  /** Span outcome (spans only). */
  status?: TelemetryStatus
  /** Span duration in milliseconds (spans only). */
  durationMs?: number
  /** Counter/gauge value. */
  value?: number
  /** Captured error, if any (spans only). */
  error?: { name: string, message: string }
}

/**
 * A telemetry exporter. Implement this to ship records anywhere (console, OpenTelemetry,
 * a metrics endpoint, an in-memory dashboard feed, …).
 */
export interface TelemetryExporter {
  /** Export a single record. */
  export: (record: TelemetryRecord) => void | Promise<void>
  /** Optional flush hook, called on shutdown. */
  flush?: () => void | Promise<void>
}

/**
 * A running span. Call {@link TelemetrySpan.end} to emit it.
 */
export interface TelemetrySpan {
  /** Add one attribute. */
  setAttribute: (key: string, value: unknown) => TelemetrySpan
  /** Merge several attributes. */
  setAttributes: (attributes: Record<string, unknown>) => TelemetrySpan
  /** Record an error on the span (sets status to `error`). */
  recordError: (error: Error) => TelemetrySpan
  /** Finish the span and export it. Safe to call once; further calls are ignored. */
  end: (status?: TelemetryStatus) => void
}

/**
 * The telemetry service contract.
 */
export interface ITelemetry {
  /** Whether telemetry is active. */
  isEnabled: () => boolean
  /** Start a span. */
  startSpan: (name: string, attributes?: Record<string, unknown>) => TelemetrySpan
  /** Emit a counter increment (default `1`). */
  counter: (name: string, value?: number, attributes?: Record<string, unknown>) => void
  /** Emit a gauge value. */
  gauge: (name: string, value: number, attributes?: Record<string, unknown>) => void
  /** Flush the exporter. */
  flush: () => Promise<void>
}

/**
 * Telemetry configuration (`stone.telemetry.*`).
 */
export interface TelemetryOptions {
  /** Master switch. Default `true`. */
  enabled?: boolean
  /** Service name stamped on every record. Default `stone-app`. */
  serviceName?: string
  /** The exporter. Defaults to the console exporter. */
  exporter?: TelemetryExporter
  /** Injectable monotonic-ish clock (ms). Defaults to `Date.now`. Mainly for testing. */
  now?: () => number
  /** The health probe: where it answers, what it checks, how long a check may take. */
  health?: HealthOptions
}

/**
 * What one check answered.
 *
 * A boolean is enough to route traffic; a detail is what the person paged at 3am reads.
 */
export interface HealthCheckResult {
  healthy: boolean
  detail?: string
}

/**
 * A class-shaped check.
 *
 * Resolved through the container, so a check can hold the very client it is checking: the database
 * pool, the cache, the queue.
 */
export interface IHealthCheck {
  check: () => HealthCheckResult | boolean | Promise<HealthCheckResult | boolean>
}

/** A check written as a plain function. */
export type FunctionalHealthCheck = () => HealthCheckResult | boolean | Promise<HealthCheckResult | boolean>

/**
 * A declared check, in any of the three forms the framework accepts.
 *
 * `name` is what the report calls it, and what a dashboard groups by; without one, the module's own
 * name is used.
 */
export interface MetaHealthCheck {
  module: unknown
  name?: string
  isClass?: boolean
  isFactory?: boolean
}

/** What the endpoint answers: one status, and a line per check. */
export interface HealthReport {
  status: 'healthy' | 'unhealthy'
  checks: Record<string, HealthCheckResult>
}

/**
 * How the health probe is configured (`stone.telemetry.health.*`).
 */
export interface HealthOptions {
  /**
   * Where the probe answers. Default `/health`, `false` to serve nothing.
   *
   * A probe is an inbound question from something that cannot read a log: a load balancer deciding
   * whether to route traffic, a platform deciding whether to replace an instance.
   */
  path?: string | false
  /** The registered checks. Modules and applications add to this list. */
  checks?: MetaHealthCheck[]
  /** How long a single check may take before it counts as failed. Default 2000ms. */
  timeout?: number
}
