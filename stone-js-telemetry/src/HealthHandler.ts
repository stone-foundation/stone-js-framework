import { runHealthChecks, DEFAULT_HEALTH_TIMEOUT } from './health'
import { IBlueprint, IContainer, IncomingEvent } from '@stone-js/core'
import { HealthOptions, HealthReport, TelemetryOptions } from './declarations'

/** The status a healthy application answers with. */
export const HEALTH_OK = 200

/** The status an unhealthy one answers with: the code a load balancer reads as "stop routing here". */
export const HEALTH_UNAVAILABLE = 503

/** Where the probe answers unless the application says otherwise. */
export const DEFAULT_HEALTH_PATH = '/health'

/**
 * Answer the question a load balancer asks.
 *
 * A probe is not a page: it is a binary question from something that cannot read, and the answer that
 * matters is the status code. `200` means route traffic here, `503` means stop. The body exists for the
 * person who follows up, and names which dependency said no.
 *
 * Registering a check is how a module or an application makes that answer mean something. Without any,
 * the endpoint still answers `200`, which is the truthful answer to "is this process up and routing":
 * it is, and nothing has claimed otherwise. That is a liveness probe, and it is worth having on its own.
 */
export class HealthHandler {
  private readonly blueprint: IBlueprint
  private readonly container?: IContainer

  /**
   * @param dependencies - Auto-wired services.
   */
  constructor ({ blueprint, container }: { blueprint: IBlueprint, container?: IContainer }) {
    this.blueprint = blueprint
    this.container = container
  }

  /**
   * Run the checks and answer.
   *
   * @param event - The incoming event.
   * @returns The report, with the status code that carries the verdict.
   */
  async handle (event: IncomingEvent): Promise<{ content: HealthReport, statusCode: number }> {
    const options = this.options()

    const report = await runHealthChecks(
      options.checks ?? [],
      (target: any) => this.container?.resolve?.(target, true),
      options.timeout ?? DEFAULT_HEALTH_TIMEOUT
    )

    // `{ content, statusCode }`, which is the kernel's platform-neutral way to answer with a status:
    // the platform's own resolver turns it into an HTTP response, a CLI exit code, or whatever else is
    // asking. This module has no business knowing which.
    return {
      content: report,
      statusCode: report.status === 'healthy' ? HEALTH_OK : HEALTH_UNAVAILABLE
    }
  }

  /** The `stone.telemetry.health` bucket. */
  private options (): HealthOptions {
    return this.blueprint.get<TelemetryOptions>('stone.telemetry', {}).health ?? {}
  }
}
