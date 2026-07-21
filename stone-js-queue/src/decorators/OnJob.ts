import { createKeyDecorator } from '@stone-js/key-router'

/** Metadata key under which `@OnJob` records the (job name → method) mappings on a class. */
export const ON_JOB_KEY: symbol = Symbol.for('stone.queue.onJob')

/**
 * Method decorator: mark a method as the handler for a job name.
 *
 * Use it on the methods of a class also decorated with `@JobHandler()` (which registers the class as
 * a service and marks it for scanning). One class can handle several jobs, one method each. The
 * method receives `(payload, job)` like any handler.
 *
 * @param name - The job name this method handles.
 * @returns A method decorator.
 *
 * @example
 * ```typescript
 * @JobHandler()
 * export class Jobs {
 *   @OnJob('send-email') sendEmail (payload) { ... }
 *   @OnJob('resize')     resize (payload) { ... }
 * }
 * ```
 */
export const OnJob: (name: string) => MethodDecorator = createKeyDecorator(ON_JOB_KEY)
