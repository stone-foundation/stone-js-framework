import { randomUUID } from 'node:crypto'
import { Job, JobOptions, DEFAULT_QUEUE } from './declarations'

/**
 * Resolve a module's default export across ESM/CJS interop.
 *
 * @param mod - The imported module namespace.
 * @returns The default export.
 */
export function resolveModuleDefault<T = any> (mod: any): T {
  return (mod?.default ?? mod) as T
}

/**
 * Build a {@link Job} from a dispatch call, applying option defaults.
 *
 * @param name - The job name.
 * @param payload - The job payload.
 * @param options - Dispatch options.
 * @param extraDelay - Additional delay in seconds (from `later`).
 * @returns A fully-formed job.
 */
export function makeJob<T> (name: string, payload: T, options: JobOptions = {}, extraDelay: number = 0): Job<T> {
  const delay = (options.delay ?? 0) + extraDelay
  return {
    id: randomUUID(),
    name,
    payload,
    queue: options.queue ?? DEFAULT_QUEUE,
    attempts: 0,
    maxAttempts: Math.max(1, options.maxAttempts ?? 1),
    backoff: Math.max(0, options.backoff ?? 0),
    availableAt: Date.now() + Math.max(0, delay) * 1000
  }
}

/**
 * The retry delay (seconds) for a job's next attempt: linear backoff (`backoff * attempts`).
 *
 * @param job - The job being retried.
 * @returns The delay in seconds.
 */
export function backoffDelay (job: Job): number {
  return job.backoff * Math.max(1, job.attempts)
}
