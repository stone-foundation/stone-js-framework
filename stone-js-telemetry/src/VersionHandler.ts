import { IBlueprint, IncomingEvent } from '@stone-js/core'
import { TelemetryOptions, VersionOptions, VersionReport } from './declarations'

/** Where the build identity answers unless the application says otherwise. */
export const DEFAULT_VERSION_PATH = '/version'

/** What a release is called when nobody has said. */
export const UNDECLARED_RELEASE = 'unknown'

/**
 * Which build is answering, and on which adapter.
 *
 * A different question from `/health`, and it is worth keeping them apart. A probe is asked by a
 * platform that cannot read and only needs a verdict; this is asked by a person mid-investigation, and
 * the answer is a fact. Is the deploy live yet. Is that canary the new build. Why does production
 * behave differently.
 *
 * `platform` earns its place because a single artefact can carry several adapters, each claiming the
 * runtime it detects, so which one won is not knowable from the outside.
 *
 * The release is never read from the environment here: it comes from the blueprint, which is where an
 * application already puts what it knows about itself. State it once, from wherever you know it.
 */
export class VersionHandler {
  private readonly blueprint: IBlueprint

  /**
   * @param dependencies - Auto-wired services.
   */
  constructor ({ blueprint }: { blueprint: IBlueprint }) {
    this.blueprint = blueprint
  }

  /**
   * Answer with what this build is.
   *
   * @param event - The incoming event.
   * @returns The build identity.
   */
  handle (event: IncomingEvent): VersionReport {
    const options = this.options()

    return {
      name: this.blueprint.get<string>('stone.name', 'stone-app'),
      env: this.blueprint.get<string>('stone.env', 'unknown'),
      // The adapter that won, which is the whole reason this field exists.
      platform: this.blueprint.get<string>('stone.adapter.platform', 'unknown'),
      release: options.release ?? UNDECLARED_RELEASE
    }
  }

  /** The `stone.telemetry.version` bucket. */
  private options (): VersionOptions {
    return this.blueprint.get<TelemetryOptions>('stone.telemetry', {}).version ?? {}
  }
}
