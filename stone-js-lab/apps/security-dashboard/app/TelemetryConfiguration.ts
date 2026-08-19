import { InMemoryTelemetryExporter } from './telemetry/InMemoryTelemetryExporter'
import { Configuration, IBlueprint, IConfiguration, Promiseable } from '@stone-js/core'

/**
 * Plugs the exporter the dashboard reads from.
 *
 * The module itself is enabled on the application with `@Telemetry()` (see Application), or with
 * `telemetryBlueprint` on the manifest for the imperative API. This class only configures, which is
 * what a `@Configuration` is for: reaching into `telemetryBlueprint` here to re-register its
 * provider and middleware by hand worked, but it froze a copy of what the module declares, so
 * anything the module added later would silently stop being applied.
 *
 * Setting the exporter at blueprint scope is the key: it is created once and shared across every
 * request's ephemeral telemetry collector, which is what makes cross-request aggregation possible.
 */
@Configuration()
export class TelemetryConfiguration implements IConfiguration {
  configure (blueprint: IBlueprint): Promiseable<void> {
    blueprint.set('stone.telemetry.exporter', new InMemoryTelemetryExporter())
  }
}
