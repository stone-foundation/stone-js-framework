/** The default queue name when none is specified. */
export const DEFAULT_QUEUE = 'default'

/**
 * Options controlling how a job is dispatched and retried.
 */
export interface JobOptions {
  /** The named queue to place the job on (defaults to `default`). */
  queue?: string
  /** Seconds to wait before the job becomes available. */
  delay?: number
  /** Maximum attempts before the job is considered failed (defaults to 1). */
  maxAttempts?: number
  /** Base backoff in seconds between retries (grows linearly with the attempt). */
  backoff?: number
}

/**
 * A queued job.
 */
export interface Job<T = any> {
  /** Unique job id. */
  id: string
  /** The job name (maps to a registered handler). */
  name: string
  /** The job payload. */
  payload: T
  /** The queue the job lives on. */
  queue: string
  /** How many times the job has been attempted. */
  attempts: number
  /** Maximum attempts before failure. */
  maxAttempts: number
  /** Base backoff (seconds) between retries. */
  backoff: number
  /** Epoch ms at/after which the job may be reserved. */
  availableAt: number
}

/**
 * The agnostic queue connection contract.
 *
 * A backend (memory, Redis, a provider queue) implements it; application code depends only on this
 * interface. Producers use `dispatch`/`later`; consumers (the {@link Worker}) use
 * `reserve`/`ack`/`release`/`fail`.
 */
export interface QueueConnection {
  /** A human-readable connection name (e.g. `'memory'`, `'redis'`). */
  readonly name: string

  /** Enqueue a job; resolves to its id. */
  dispatch: <T = unknown>(name: string, payload: T, options?: JobOptions) => Promise<string>

  /** Enqueue a job delayed by `delay` seconds; resolves to its id. */
  later: <T = unknown>(delay: number, name: string, payload: T, options?: JobOptions) => Promise<string>

  /** Reserve the next available job on `queue` (marking it in-flight), or `undefined` when empty. */
  reserve: (queue?: string) => Promise<Job | undefined>

  /** Acknowledge a completed job (remove it). */
  ack: (job: Job) => Promise<void>

  /** Return a job for retry after `delay` seconds. */
  release: (job: Job, delay?: number) => Promise<void>

  /** Move a job to the failed (dead-letter) set. */
  fail: (job: Job, error: Error) => Promise<void>

  /** Number of ready jobs on `queue`. */
  size: (queue?: string) => Promise<number>

  /** Remove every job from `queue` (or all queues when omitted). */
  clear: (queue?: string) => Promise<void>
}

/**
 * A job handler: a function, or an object/instance exposing `handle`.
 */
export type JobHandler<T = any> =
  | ((payload: T, job: Job<T>) => unknown | Promise<unknown>)
  | { handle: (payload: T, job: Job<T>) => unknown | Promise<unknown> }

/**
 * A factory that builds a {@link QueueConnection} from its options.
 */
export type QueueConnectionFactory = (config: ConnectionConfig) => QueueConnection

/** Built-in driver identifiers. `memory` and `redis` ship now; provider queues follow. */
export type QueueDriver = 'memory' | 'redis' | string

/**
 * Options common to every connection, plus the driver selector.
 */
export interface ConnectionConfig {
  /** The connection name, used to resolve it via `queueManager.connection(name)`. */
  name: string
  /** Which driver backs this connection. */
  driver: QueueDriver
  /** A key prefix/namespace applied to backend keys. */
  prefix?: string
  /** Default queue name for this connection. */
  defaultQueue?: string
  /** Driver-specific options (see {@link RedisConnectionOptions}). */
  [key: string]: unknown
}

/**
 * Options for the Redis connection.
 */
export interface RedisConnectionOptions extends ConnectionConfig {
  /** A Redis connection URL (e.g. `redis://localhost:6379`). */
  url?: string
  /** An existing `ioredis` client to reuse. */
  client?: unknown
  /** Inline `ioredis` options when no `url`/`client` is given. */
  options?: Record<string, unknown>
}

/**
 * A registered job-handler meta-module (`stone.queue.handlers`).
 */
export interface JobHandlerMeta {
  /** The job name this handler processes. Omitted for classes that only carry `@OnJob` methods. */
  name?: string
  /** The handler: a class, a factory, or a function/instance. */
  module: unknown
  /** The class method to call (defaults to `handle`) when `isClass`/`isFactory`. */
  action?: string
  /** Whether `module` is a class to resolve from the container. */
  isClass?: boolean
  /** Whether `module` is a factory to resolve from the container. */
  isFactory?: boolean
}

/**
 * The `stone.queue` configuration bucket.
 */
export interface QueueConfig {
  /** The default connection name (resolved by `queueManager.connection()` / injected as `queue`). */
  default?: string
  /** The connections to register. */
  connections?: ConnectionConfig[]
  /** Registered job handlers. */
  handlers?: JobHandlerMeta[]
}
