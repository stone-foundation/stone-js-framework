import { metricsStore } from './MetricsStore'
import { TelemetryExporter, TelemetryRecord } from '@stone-js/telemetry'

/**
 * A telemetry exporter that feeds the shared {@link metricsStore} instead of the console.
 *
 * Placed in `stone.telemetry.exporter` (blueprint = shared scope), so the SAME exporter — and
 * the same store — is used across every request's ephemeral Telemetry collector. That is how a
 * live dashboard aggregates metrics under Stone.js's per-request-isolated architecture.
 */
export class InMemoryTelemetryExporter implements TelemetryExporter {
  /**
   * Export one record into the shared store.
   *
   * @param record - The telemetry record.
   */
  export (record: TelemetryRecord): void {
    metricsStore.record(record)
  }
}
