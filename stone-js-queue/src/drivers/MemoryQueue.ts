import { makeJob } from '../utils'
import { Job, JobOptions, QueueConnection, ConnectionConfig, DEFAULT_QUEUE } from '../declarations'

/**
 * In-process memory queue.
 *
 * The zero-config default: jobs live in arrays keyed by queue name, with delay, reservation,
 * retry and a dead-letter list. Scoped to a single process (use the Redis connection to share work
 * across instances), ideal for development, tests and single-node apps.
 */
export class MemoryQueue implements QueueConnection {
  readonly name: string

  private readonly defaultQueue: string
  private readonly queues = new Map<string, Job[]>()
  private readonly reserved = new Set<string>()
  private readonly dead: Job[] = []

  /**
   * Create a memory queue.
   *
   * @param config - The connection options.
   * @returns A new connection.
   */
  static create (config: Partial<ConnectionConfig> = {}): MemoryQueue {
    return new this(config)
  }

  /**
   * @param config - The connection options.
   */
  constructor (config: Partial<ConnectionConfig> = {}) {
    this.name = config.name ?? 'memory'
    this.defaultQueue = config.defaultQueue ?? DEFAULT_QUEUE
  }

  /** @inheritdoc */
  async dispatch <T = unknown>(name: string, payload: T, options: JobOptions = {}): Promise<string> {
    const job = makeJob(name, payload, { queue: this.defaultQueue, ...options })
    this.bucket(job.queue).push(job)
    return job.id
  }

  /** @inheritdoc */
  async later <T = unknown>(delay: number, name: string, payload: T, options: JobOptions = {}): Promise<string> {
    const job = makeJob(name, payload, { queue: this.defaultQueue, ...options }, delay)
    this.bucket(job.queue).push(job)
    return job.id
  }

  /** @inheritdoc */
  async reserve (queue?: string): Promise<Job | undefined> {
    const bucket = this.bucket(queue ?? this.defaultQueue)
    const now = Date.now()
    const job = bucket.find((candidate) => candidate.availableAt <= now && !this.reserved.has(candidate.id))
    if (job === undefined) { return undefined }
    this.reserved.add(job.id)
    job.attempts += 1
    return job
  }

  /** @inheritdoc */
  async ack (job: Job): Promise<void> {
    this.remove(job)
  }

  /** @inheritdoc */
  async release (job: Job, delay: number = 0): Promise<void> {
    this.reserved.delete(job.id)
    job.availableAt = Date.now() + Math.max(0, delay) * 1000
  }

  /** @inheritdoc */
  async fail (job: Job, _error: Error): Promise<void> {
    this.remove(job)
    this.dead.push(job)
  }

  /** @inheritdoc */
  async size (queue?: string): Promise<number> {
    const now = Date.now()
    const count = (jobs: Job[]): number => jobs.filter((job) => job.availableAt <= now && !this.reserved.has(job.id)).length
    if (queue !== undefined) { return count(this.bucket(queue)) }
    let total = 0
    for (const jobs of this.queues.values()) { total += count(jobs) }
    return total
  }

  /** @inheritdoc */
  async clear (queue?: string): Promise<void> {
    if (queue !== undefined) { this.queues.delete(queue); return }
    this.queues.clear()
    this.reserved.clear()
  }

  /**
   * The dead-letter jobs (failed after exhausting attempts). Not part of the contract; useful for
   * inspection and tests.
   *
   * @returns The failed jobs.
   */
  failedJobs (): Job[] {
    return [...this.dead]
  }

  /**
   * The jobs array for a queue (created on first use).
   *
   * @param queue - The queue name.
   * @returns The jobs array.
   */
  private bucket (queue: string): Job[] {
    const existing = this.queues.get(queue)
    if (existing !== undefined) { return existing }
    const created: Job[] = []
    this.queues.set(queue, created)
    return created
  }

  /**
   * Remove a job from its queue and the reserved set.
   *
   * @param job - The job to remove.
   */
  private remove (job: Job): void {
    this.reserved.delete(job.id)
    const bucket = this.queues.get(job.queue)
    if (bucket === undefined) { return }
    const index = bucket.findIndex((candidate) => candidate.id === job.id)
    if (index >= 0) { bucket.splice(index, 1) }
  }
}
