import { Job, JobHandler } from './declarations'
import { QueueError } from './errors/QueueError'

/** A normalized handler function. */
export type JobHandlerFn = (payload: any, job: Job) => unknown | Promise<unknown>

/**
 * Registry mapping job names to their handlers.
 *
 * The {@link Worker} resolves a job's handler here. Handlers are normalized to a function, whether
 * registered as a function or an object/instance with a `handle` method. A process-wide default
 * instance lets the worker reach it without wiring.
 */
export class JobRegistry {
  private static current?: JobRegistry

  private readonly handlers = new Map<string, JobHandlerFn>()

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
   */
  register (name: string, handler: JobHandler, action: string = 'handle'): this {
    this.handlers.set(name, this.normalize(handler, action))
    return this
  }

  /**
   * Whether a handler is registered for a job name.
   *
   * @param name - The job name.
   * @returns True if registered.
   */
  has (name: string): boolean {
    return this.handlers.has(name)
  }

  /**
   * Resolve the handler for a job name.
   *
   * @param name - The job name.
   * @returns The normalized handler function.
   * @throws {QueueError} When no handler is registered.
   */
  resolve (name: string): JobHandlerFn {
    const handler = this.handlers.get(name)
    if (handler === undefined) {
      throw new QueueError(`No handler registered for job "${name}".`)
    }
    return handler
  }

  /**
   * Normalize a handler to a plain function.
   *
   * @param handler - The handler.
   * @param action - The method name for object handlers.
   * @returns A handler function.
   */
  private normalize (handler: JobHandler, action: string): JobHandlerFn {
    if (typeof handler === 'function') { return handler as JobHandlerFn }
    const method = (handler as any)[action]
    if (typeof method !== 'function') {
      throw new QueueError(`Job handler must be a function or expose a "${action}" method.`)
    }
    return method.bind(handler) as JobHandlerFn
  }
}
