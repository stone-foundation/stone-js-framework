import { Job, JobHandler, JobHandlerType } from '@stone-js/queue'

/**
 * The decorator, used as the documentation writes it.
 *
 * This file exists because a decorator is a value, and the public entry point once carried a type of
 * the same name. Two `export *` lines offering one name make the export ambiguous (TS2308), so
 * TypeScript kept neither and `@JobHandler('send-receipt')` failed with TS2693 for every consumer,
 * while the JavaScript bundle exported the function perfectly well. Renaming the shape to
 * `JobHandlerType` freed the name; this proves it stays free.
 */
@JobHandler('send-receipt')
export class SendReceipt {
  async handle (payload: { orderId: string }, job: Job<{ orderId: string }>): Promise<string> {
    return `${payload.orderId}:${job.name}`
  }
}

/** And the shape, still usable as a type, under its own name, in both of its forms. */
export const asObject: JobHandlerType<{ orderId: string }> = new SendReceipt()
export const asFunction: JobHandlerType<{ orderId: string }> = (payload) => payload.orderId
