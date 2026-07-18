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
}
