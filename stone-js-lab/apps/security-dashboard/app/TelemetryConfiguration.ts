import { telemetryBlueprint } from '@stone-js/telemetry'
import { InMemoryTelemetryExporter } from './telemetry/InMemoryTelemetryExporter'
import { Configuration, IBlueprint, IConfiguration, Promiseable } from '@stone-js/core'

/**
 * Wires the telemetry module into this app, declaratively.
 *
 * `@Configuration()` runs imperative config at blueprint-build time. Here it reuses the module's
 * own `telemetryBlueprint` (its provider + kernel middleware) so nothing is hard-coded, then
 * overrides `stone.telemetry.exporter` with our shared in-memory exporter. Setting the exporter
 * at blueprint scope is the key: it is created once and shared across every request's ephemeral
 * telemetry collector, which is what makes cross-request aggregation possible.
 *
 * (Imperative apps would instead pass `telemetryBlueprint` in the `defineStoneApp` blueprints
 * array — same effect.)
 */
@Configuration()
export class TelemetryConfiguration implements IConfiguration {
  configure (blueprint: IBlueprint): Promiseable<void> {
    blueprint
      .add('stone.providers', telemetryBlueprint.stone.providers)
      .add('stone.kernel.middleware', telemetryBlueprint.stone.kernel?.middleware)
      .set('stone.telemetry', {
        ...telemetryBlueprint.stone.telemetry,
        serviceName: 'security-dashboard',
        exporter: new InMemoryTelemetryExporter()
      })
  }
}
