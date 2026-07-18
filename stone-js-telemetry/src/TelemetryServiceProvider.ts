import { Telemetry } from './Telemetry'
import { TelemetryOptions } from './declarations'
import { IBlueprint, IContainer, IServiceProvider, Promiseable } from '@stone-js/core'

/**
 * Registers the {@link Telemetry} service (singleton) in the container from `stone.telemetry`
 * config, aliased as `telemetry`/`Telemetry` so middleware and user code can resolve it.
 */
export class TelemetryServiceProvider implements IServiceProvider {
  /**
   * @param container - The service container.
   */
  constructor (private readonly container: IContainer) {}

  /**
   * Register the telemetry service.
   */
  register (): Promiseable<void> {
    const options = this.container.make<IBlueprint>('blueprint').get<TelemetryOptions>('stone.telemetry', {})

    this.container
      .singletonIf(Telemetry, () => Telemetry.create(options))
      .alias(Telemetry, ['telemetry', 'Telemetry'])
  }
}
