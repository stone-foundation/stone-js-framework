import { backoffDelay } from './utils'
import { JobRegistry } from './JobRegistry'
import { QueueManager } from './QueueManager'
import { DEFAULT_QUEUE } from './declarations'

/**
 * Options for running the {@link Worker}.
 */
export interface WorkerRunOptions {
  /** The queues to consume, in priority order (defaults to `['default']`). */
  queues?: string[]
  /** The connection to consume from (defaults to the manager's default). */
  connection?: string
  /** Milliseconds to sleep when every queue is empty (defaults to 1000). */
  sleep?: number
}

/**
 * The long-running queue consumer.
 *
 * It reserves the next job, resolves its handler from the {@link JobRegistry}, runs it, and
 * acknowledges it; on failure it retries with linear backoff up to `maxAttempts`, then dead-letters.
 * On serverless there is no worker: the provider adapter invokes per message and routes to the same
 * registry.
 */
export class Worker {
  private running = false

  /**
   * Create a Worker.
   *
   * @param manager - The queue manager.
   * @param registry - The job handler registry.
   * @returns A new worker.
   */
  static create (manager: QueueManager, registry: JobRegistry): Worker {
    return new this(manager, registry)
  }

  /**
   * @param manager - The queue manager.
   * @param registry - The job handler registry.
   */
  constructor (
    private readonly manager: QueueManager,
    private readonly registry: JobRegistry
  ) {}

  /**
   * Reserve and process one job from a queue.
   *
   * @param queue - The queue to consume.
   * @param connection - The connection name.
   * @returns True when a job was processed, false when the queue was empty.
   */
  async processNext (queue: string = DEFAULT_QUEUE, connection?: string): Promise<boolean> {
    const conn = this.manager.connection(connection)
    const job = await conn.reserve(queue)
    if (job === undefined) { return false }

    try {
      const handler = this.registry.resolve(job.name)
      await handler(job.payload, job)
      await conn.ack(job)
    } catch (error: any) {
      if (job.attempts >= job.maxAttempts) {
        await conn.fail(job, error instanceof Error ? error : new Error(String(error)))
      } else {
        await conn.release(job, backoffDelay(job))
      }
    }

    return true
  }

  /**
   * Drain every currently-ready job across the given queues (one pass).
   *
   * @param queues - The queues to drain.
   * @param connection - The connection name.
   * @returns The number of jobs processed.
   */
  async drain (queues: string[] = [DEFAULT_QUEUE], connection?: string): Promise<number> {
    let processed = 0
    for (const queue of queues) {
      while (await this.processNext(queue, connection)) { processed += 1 }
    }
    return processed
  }

  /**
   * Run the consume loop until {@link stop} is called.
   *
   * @param options - Run options.
   */
  async run (options: WorkerRunOptions = {}): Promise<void> {
    const queues = options.queues ?? [DEFAULT_QUEUE]
    this.running = true

    while (this.running) {
      const processed = await this.drainWhileRunning(queues, options.connection)
      if (this.running && processed === 0) {
        await this.sleep(options.sleep ?? 1000)
      }
    }
  }

  /**
   * Stop the consume loop.
   */
  stop (): void {
    this.running = false
  }

  /**
   * Whether the worker is currently running.
   *
   * @returns True while the loop is active.
   */
  isRunning (): boolean {
    return this.running
  }

  /**
   * Drain the queues once, stopping early if the worker is stopped mid-pass.
   *
   * @param queues - The queues to drain.
   * @param connection - The connection name.
   * @returns The number of jobs processed.
   */
  private async drainWhileRunning (queues: string[], connection?: string): Promise<number> {
    let processed = 0
    for (const queue of queues) {
      while (this.running && await this.processNext(queue, connection)) { processed += 1 }
    }
    return processed
  }

  /**
   * Sleep for the given milliseconds (extracted so it can be controlled in tests).
   *
   * @param ms - Milliseconds to sleep.
   */
  protected async sleep (ms: number): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, ms))
  }
}
