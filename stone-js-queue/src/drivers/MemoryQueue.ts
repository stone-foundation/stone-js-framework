import { makeJob } from '../utils'
import { Job, JobOptions, QueueConnection, ConnectionConfig, DEFAULT_QUEUE } from '../declarations'

/** What one named connection holds: the queued jobs, what is in flight, and what died. */
interface Backing {
  queues: Map<string, Job[]>
  reserved: Set<string>
  dead: Job[]
}

/**
 * The jobs, held by the connection rather than by anything the framework owns.
 *
 * This is the one place inter-request state may live, and it lives here because **a connection is
 * the persistence boundary**: choosing this driver is choosing where the work is kept. Everything
 * else in Stone.js is rebuilt for every event, deliberately, and nothing in the framework offers a
 * place to keep things across them.
 *
 * Held per instance, the jobs did not survive the event that dispatched them. Measured on the
 * published 0.8.18: dispatch, then `size()` answers `1` from the instance that dispatched and `0`
 * from the next one, and the worker reserves nothing. Every job was dropped, silently, and
 * `@stone-js/notifications` hands its deliveries to a queue as soon as one is registered, so a
 * notification reported as queued was never delivered.
 *
 * Keyed by the connection's configured name, so two connections both backed by memory keep their own
 * work, exactly as two Redis connections with different prefixes would.
 */
const backings = new Map<string, Backing>()

/** The backing a named connection works in, created the first time that name is used. */
function backingFor (name: string): Backing {
  const existing = backings.get(name)

  if (existing !== undefined) { return existing }

  const created: Backing = { queues: new Map(), reserved: new Set(), dead: [] }
  backings.set(name, created)

  return created
}

/**
 * In-process memory queue.
 *
 * The zero-config default: jobs live in arrays keyed by queue name, with delay, reservation, retry
 * and a dead-letter list, and the whole lot lives in this module rather than in the instance.
 *
 * **It is one process wide, and that is worth saying plainly.** It is right for a single server and
 * for tests. It is not a shared queue: two instances behind a load balancer each hold their own
 * work, and on a function-as-a-service platform a cold start loses whatever had not run. Configure
 * the Redis connection there, or register your own with `connections: [{ name, factory }]`.
 */
export class MemoryQueue implements QueueConnection {
  readonly name: string

  private readonly defaultQueue: string
  private readonly queues: Map<string, Job[]>
  private readonly reserved: Set<string>
  private readonly dead: Job[]

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
    const backing = backingFor(config.name ?? 'memory')

    this.name = config.name ?? 'memory'
    this.defaultQueue = config.defaultQueue ?? DEFAULT_QUEUE
    this.queues = backing.queues
    this.reserved = backing.reserved
    this.dead = backing.dead
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
    // The dead letters too: they outlive an instance now, so a caller asking for an empty
    // connection would otherwise inherit the previous one's failures.
    this.dead.length = 0
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
