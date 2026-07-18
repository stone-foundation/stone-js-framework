import { TelemetryExporter, TelemetryRecord } from '../declarations'

/**
 * The default exporter: prints each record to the console as a single structured line.
 *
 * It is the zero-config fallback so telemetry is useful out of the box; swap it for an
 * OpenTelemetry / HTTP / dashboard exporter via `stone.telemetry.exporter`.
 */
export class ConsoleTelemetryExporter implements TelemetryExporter {
  /**
   * Factory.
   *
   * @param sink - The output function (defaults to `console.log`); injectable for testing.
   * @returns A new exporter.
   */
  static create (sink: (message: string) => void = console.log): ConsoleTelemetryExporter {
    return new this(sink)
  }

  /**
   * @param sink - The output function.
   */
  constructor (private readonly sink: (message: string) => void = console.log) {}

  /**
   * Print a record.
   *
   * @param record - The record to export.
   */
  export (record: TelemetryRecord): void {
    const parts = [
      `[telemetry] ${record.service}`,
      `${record.kind}=${record.name}`,
      record.status !== undefined ? `status=${record.status}` : undefined,
      record.durationMs !== undefined ? `duration=${record.durationMs}ms` : undefined,
      record.value !== undefined ? `value=${record.value}` : undefined,
      record.error !== undefined ? `error="${record.error.name}: ${record.error.message}"` : undefined,
      Object.keys(record.attributes).length > 0 ? `attrs=${JSON.stringify(record.attributes)}` : undefined
    ].filter((part) => part !== undefined)

    this.sink(parts.join(' '))
  }
}
