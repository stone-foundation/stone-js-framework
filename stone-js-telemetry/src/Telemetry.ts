import {
  ITelemetry,
  TelemetrySpan,
  TelemetryStatus,
  TelemetryRecord,
  TelemetryOptions,
  TelemetryExporter
} from './declarations'
import { ConsoleTelemetryExporter } from './exporters/ConsoleTelemetryExporter'

/**
 * The telemetry collector.
 *
 * Creates spans/counters/gauges and hands the resulting {@link TelemetryRecord}s to a pluggable
 * exporter. Platform-agnostic: it knows nothing about HTTP/CLI/etc.; callers attach whatever
 * attributes make sense. When disabled, every operation is a cheap no-op.
 */
export class Telemetry implements ITelemetry {
  private readonly enabled: boolean
  private readonly service: string
  private readonly exporter: TelemetryExporter
  private readonly now: () => number

  /**
   * Factory.
   *
   * @param options - Telemetry options.
   * @returns A new Telemetry instance.
   */
  static create (options: TelemetryOptions = {}): Telemetry {
    return new this(options)
  }

  /**
   * @param options - Telemetry options.
   */
  constructor (options: TelemetryOptions = {}) {
    this.enabled = options.enabled ?? true
    this.service = options.serviceName ?? 'stone-app'
    this.exporter = options.exporter ?? ConsoleTelemetryExporter.create()
    this.now = options.now ?? (() => Date.now())
  }

  /**
   * @returns Whether telemetry is active.
   */
  isEnabled (): boolean {
    return this.enabled
  }

  /**
   * Starts a span. When disabled, returns a no-op span so call sites stay branch-free.
   *
   * @param name - Span name.
   * @param attributes - Initial attributes.
   * @returns The span.
   */
  startSpan (name: string, attributes: Record<string, unknown> = {}): TelemetrySpan {
    if (!this.enabled) { return NOOP_SPAN }

    const startedAt = this.now()
    const attrs: Record<string, unknown> = { ...attributes }
    let error: { name: string, message: string } | undefined
    let ended = false

    const span: TelemetrySpan = {
      setAttribute: (key, value) => { attrs[key] = value; return span },
      setAttributes: (values) => { Object.assign(attrs, values); return span },
      recordError: (err) => { error = { name: err.name, message: err.message }; return span },
      end: (status: TelemetryStatus = error !== undefined ? 'error' : 'ok') => {
        if (ended) { return }
        ended = true
        this.emit({
          name,
          kind: 'span',
          service: this.service,
          timestamp: this.now(),
          attributes: attrs,
          status,
          durationMs: this.now() - startedAt,
          error
        })
      }
    }

    return span
  }

  /**
   * Emits a counter increment.
   *
   * @param name - Counter name.
   * @param value - Increment (default `1`).
   * @param attributes - Attributes.
   */
  counter (name: string, value = 1, attributes: Record<string, unknown> = {}): void {
    if (!this.enabled) { return }
    this.emit({ name, kind: 'counter', service: this.service, timestamp: this.now(), attributes, value })
  }

  /**
   * Emits a gauge value.
   *
   * @param name - Gauge name.
   * @param value - Value.
   * @param attributes - Attributes.
   */
  gauge (name: string, value: number, attributes: Record<string, unknown> = {}): void {
    if (!this.enabled) { return }
    this.emit({ name, kind: 'gauge', service: this.service, timestamp: this.now(), attributes, value })
  }

  /**
   * Flushes the underlying exporter.
   */
  async flush (): Promise<void> {
    await this.exporter.flush?.()
  }

  /**
   * Exports a record, swallowing exporter failures so telemetry never breaks the app.
   *
   * @param record - The record to export.
   */
  private emit (record: TelemetryRecord): void {
    try {
      void this.exporter.export(record)
    } catch {
      /* Telemetry must never throw into the application path. */
    }
  }
}

/**
 * Shared no-op span used when telemetry is disabled.
 */
const NOOP_SPAN: TelemetrySpan = {
  setAttribute: () => NOOP_SPAN,
  setAttributes: () => NOOP_SPAN,
  recordError: () => NOOP_SPAN,
  end: () => {}
}
