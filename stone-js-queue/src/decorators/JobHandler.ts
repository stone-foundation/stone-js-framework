import { queueBlueprint } from '../options/QueueBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType, SERVICE_KEY, setMetadata } from '@stone-js/core'

/**
 * Options for the `@JobHandler` decorator.
 */
export interface JobHandlerOptions {
  /** The method that processes the job (defaults to `handle`). */
  action?: string
}

/**
 * Class decorator: mark a class as the handler for a job name.
 *
 * The class is registered as a container service and contributed to `stone.queue.handlers`; the
 * {@link QueueServiceProvider} resolves it (with dependency injection) and routes jobs of `name` to
 * its `handle(payload, job)` method.
 *
 * @param name - The job name this class handles.
 * @param options - The action method (defaults to `handle`).
 * @returns A class decorator.
 *
 * @example
 * ```typescript
 * @JobHandler('send-email')
 * export class SendEmail {
 *   constructor (private readonly mailer) {}
 *   async handle (payload: { to: string }) { await this.mailer.send(payload.to) }
 * }
 * ```
 */
export const JobHandler = <T extends ClassType = ClassType>(name: string, options: JobHandlerOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    setMetadata(context, SERVICE_KEY, { singleton: true, isClass: true })
    addBlueprint(target, context, queueBlueprint, {
      stone: {
        queue: {
          handlers: [{ name, module: target, isClass: true, action: options.action ?? 'handle' }]
        }
      }
    })
  })
}
