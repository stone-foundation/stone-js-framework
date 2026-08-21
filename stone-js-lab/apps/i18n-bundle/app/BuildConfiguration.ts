import { Configuration, IBlueprint, IConfiguration } from '@stone-js/core'

/** The release comes from the blueprint, never from the environment, which is the framework's rule. */
@Configuration()
export class BuildConfiguration implements IConfiguration {
  configure (blueprint: IBlueprint): void {
    blueprint.set('stone.telemetry.version.release', '2026.08.21-lab')
  }
}
