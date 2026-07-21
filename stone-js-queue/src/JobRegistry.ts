import { Job, JobHandler } from './declarations'
import { QueueError } from './errors/QueueError'
import { KeyRouter, KeyHandler } from '@stone-js/key-router'

/** A normalized handler function. */
export type JobHandlerFn = (payload: any, job: Job) => unknown | Promise<unknown>

/**
 * Registry mapping job names to their handlers.
 *
 * A thin, queue-flavoured facade over {@link KeyRouter} (the shared key-to-handler primitive): job
 * name → handler, normalized whether registered as a function or an object/instance with an action
 * method. A process-wide default instance lets the {@link Worker} reach it without wiring.
 */
export class JobRegistry {
  private static current?: JobRegistry

  private readonly router = KeyRouter.create()

  /**
   * Create a JobRegistry.
   *
   * @returns A new registry.
   */
  static create (): JobRegistry {
    return new this()
  }

  /**
   * Register (or replace) the process-wide default registry.
   *
   * @param registry - The registry (or `undefined` to clear).
   */
  static setInstance (registry?: JobRegistry): void {
    JobRegistry.current = registry
  }

  /**
   * The process-wide default registry, if the queue module has been booted.
   *
   * @returns The registry, or `undefined`.
   */
  static getInstance (): JobRegistry | undefined {
    return JobRegistry.current
  }

  /**
   * Register a handler for a job name.
   *
   * @param name - The job name.
   * @param handler - The handler (function or `{ handle }`).
   * @param action - The method to call when the handler is an object (defaults to `handle`).
   * @returns This registry for chaining.
   * @throws {QueueError} When the handler is malformed.
   */
  register (name: string, handler: JobHandler, action: string = 'handle'): this {
    try {
      this.router.register(name, handler as KeyHandler, action)
    } catch (error: any) {
      throw new QueueError(`Invalid handler for job "${name}".`, { cause: error })
    }
    return this
  }

  /**
   * Whether a handler is registered for a job name.
   *
   * @param name - The job name.
   * @returns True if registered.
   */
  has (name: string): boolean {
    return this.router.has(name)
  }

  /**
   * Resolve the handler for a job name.
   *
   * @param name - The job name.
   * @returns The normalized handler function.
   * @throws {QueueError} When no handler is registered.
   */
  resolve (name: string): JobHandlerFn {
    const handler = this.router.tryResolve(name)
    if (handler === undefined) {
      throw new QueueError(`No handler registered for job "${name}".`)
    }
    return handler as JobHandlerFn
  }
}
