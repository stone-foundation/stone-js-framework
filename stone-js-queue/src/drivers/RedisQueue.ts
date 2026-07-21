import { makeJob, resolveModuleDefault } from '../utils'
import { QueueError } from '../errors/QueueError'
import { Job, JobOptions, QueueConnection, RedisConnectionOptions, DEFAULT_QUEUE } from '../declarations'

/**
 * Redis queue (via `ioredis`).
 *
 * A reliable, shared queue: ready jobs are ids on a per-queue LIST, delayed jobs on a ZSET (scored
 * by availability), in-flight jobs on a processing LIST, and each job's data under its own key.
 * `reserve` atomically moves an id to the processing list (`RPOPLPUSH`), so a crashed worker leaves
 * the job recoverable. `ioredis` is imported lazily as an optional peer dependency.
 */
export class RedisQueue implements QueueConnection {
  readonly name: string

  private readonly prefix: string
  private readonly defaultQueue: string
  private readonly options: RedisConnectionOptions
  private clientPromise?: Promise<any>

  /**
   * Create a Redis queue.
   *
   * @param options - The connection options.
   * @returns A new connection.
   */
  static create (options: RedisConnectionOptions): RedisQueue {
    return new this(options)
  }

  /**
   * @param options - The connection options.
   */
  constructor (options: RedisConnectionOptions) {
    this.options = options
    this.name = options.name ?? 'redis'
    this.prefix = options.prefix ?? 'queue'
    this.defaultQueue = options.defaultQueue ?? DEFAULT_QUEUE
  }

  /** @inheritdoc */
  async dispatch <T = unknown>(name: string, payload: T, options: JobOptions = {}): Promise<string> {
    return await this.enqueue(makeJob(name, payload, { queue: this.defaultQueue, ...options }))
  }

  /** @inheritdoc */
  async later <T = unknown>(delay: number, name: string, payload: T, options: JobOptions = {}): Promise<string> {
    return await this.enqueue(makeJob(name, payload, { queue: this.defaultQueue, ...options }, delay))
  }

  /** @inheritdoc */
  async reserve (queue: string = this.defaultQueue): Promise<Job | undefined> {
    const client = await this.client()
    await this.migrateDue(queue)

    const id: string | null = await client.rpoplpush(this.readyKey(queue), this.processingKey(queue))
    if (id === null) { return undefined }

    const raw: string | null = await client.get(this.jobKey(id))
    if (raw === null) {
      await client.lrem(this.processingKey(queue), 1, id)
      return undefined
    }

    const job = JSON.parse(raw) as Job
    job.attempts += 1
    await client.set(this.jobKey(id), JSON.stringify(job))
    return job
  }

  /** @inheritdoc */
  async ack (job: Job): Promise<void> {
    const client = await this.client()
    await client.lrem(this.processingKey(job.queue), 1, job.id)
    await client.del(this.jobKey(job.id))
  }

  /** @inheritdoc */
  async release (job: Job, delay: number = 0): Promise<void> {
    const client = await this.client()
    await client.lrem(this.processingKey(job.queue), 1, job.id)
    await client.set(this.jobKey(job.id), JSON.stringify(job))
    if (delay > 0) {
      await client.zadd(this.delayedKey(job.queue), Date.now() + delay * 1000, job.id)
    } else {
      await client.lpush(this.readyKey(job.queue), job.id)
    }
  }

  /** @inheritdoc */
  async fail (job: Job, _error: Error): Promise<void> {
    const client = await this.client()
    await client.lrem(this.processingKey(job.queue), 1, job.id)
    await client.del(this.jobKey(job.id))
    await client.lpush(this.failedKey(), JSON.stringify(job))
  }

  /** @inheritdoc */
  async size (queue?: string): Promise<number> {
    const client = await this.client()
    if (queue !== undefined) {
      const length: number = await client.llen(this.readyKey(queue))
      return length
    }
    const queues: string[] = await client.smembers(this.queuesKey())
    let total = 0
    for (const name of queues) {
      const length: number = await client.llen(this.readyKey(name))
      total += length
    }
    return total
  }

  /** @inheritdoc */
  async clear (queue?: string): Promise<void> {
    const client = await this.client()
    if (queue === undefined) {
      await this.scanDelete(`${this.prefix}:*`)
      return
    }
    await client.del(this.readyKey(queue), this.processingKey(queue), this.delayedKey(queue))
    await client.srem(this.queuesKey(), queue)
  }

  /**
   * Store a job and place its id on the ready list or the delayed set.
   *
   * @param job - The job to enqueue.
   * @returns The job id.
   */
  private async enqueue (job: Job): Promise<string> {
    const client = await this.client()
    await client.sadd(this.queuesKey(), job.queue)
    await client.set(this.jobKey(job.id), JSON.stringify(job))
    if (job.availableAt > Date.now()) {
      await client.zadd(this.delayedKey(job.queue), job.availableAt, job.id)
    } else {
      await client.lpush(this.readyKey(job.queue), job.id)
    }
    return job.id
  }

  /**
   * Move now-due delayed jobs onto the ready list.
   *
   * @param queue - The queue name.
   */
  private async migrateDue (queue: string): Promise<void> {
    const client = await this.client()
    const ids: string[] = await client.zrangebyscore(this.delayedKey(queue), 0, Date.now(), 'LIMIT', 0, 50)
    for (const id of ids) {
      const removed: number = await client.zrem(this.delayedKey(queue), id)
      if (removed > 0) { await client.lpush(this.readyKey(queue), id) }
    }
  }

  private readyKey (queue: string): string { return `${this.prefix}:${queue}` }
  private processingKey (queue: string): string { return `${this.prefix}:${queue}:processing` }
  private delayedKey (queue: string): string { return `${this.prefix}:${queue}:delayed` }
  private jobKey (id: string): string { return `${this.prefix}:job:${id}` }
  private failedKey (): string { return `${this.prefix}:failed` }
  private queuesKey (): string { return `${this.prefix}:queues` }

  /**
   * Delete every key matching a pattern, using a non-blocking SCAN.
   *
   * @param pattern - The match pattern.
   */
  private async scanDelete (pattern: string): Promise<void> {
    const client = await this.client()
    let cursor = '0'
    do {
      const [next, keys]: [string, string[]] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100)
      cursor = next
      if (keys.length > 0) { await client.del(...keys) }
    } while (cursor !== '0')
  }

  /**
   * Lazily build (and memoize) the `ioredis` client.
   *
   * @returns The client.
   */
  private async client (): Promise<any> {
    this.clientPromise = this.clientPromise ?? this.build()
    return await this.clientPromise
  }

  /**
   * Resolve the client from a provided instance, a URL, or inline options.
   *
   * @returns The client.
   * @throws {QueueError} When `ioredis` is not installed.
   */
  private async build (): Promise<any> {
    if (this.options.client !== undefined && this.options.client !== null) {
      return this.options.client
    }

    const IORedis = await import('ioredis').then(resolveModuleDefault).catch(() => {
      throw new QueueError('The Redis queue requires "ioredis". Install it: npm i ioredis')
    })

    return typeof this.options.url === 'string'
      ? new IORedis(this.options.url)
      : new IORedis(this.options.options ?? {})
  }
}
