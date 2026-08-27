import { DeliveryPayload, Notifier } from '../Notifier'
import { DeliveryOutcome } from '../declarations'

/**
 * The worker side of a notification: it performs the delivery the request decided on.
 *
 * It runs the same code the inline path runs, which is what makes a retry mean exactly what the first
 * attempt meant. The payload carries the template key and its params rather than a rendered body, so
 * a message queued before a translation was fixed goes out fixed.
 *
 * **It throws when, and only when, another attempt could work.** That is the whole contract with the
 * queue: a permanent failure that threw would be retried until the attempts ran out, filling the
 * queue with work that cannot succeed, and an unreachable recipient would look like an outage.
 */
export class DeliverNotification {
  private readonly notifier: Notifier

  /**
   * @param dependencies - Auto-wired services.
   */
  constructor ({ notifier }: { notifier: Notifier }) {
    this.notifier = notifier
  }

  /**
   * Deliver one notification.
   *
   * @param payload - Who, what, where, in which language.
   * @returns What each channel answered.
   * @throws {Error} When at least one channel failed in a way another attempt could fix.
   */
  async handle (payload: DeliveryPayload): Promise<DeliveryOutcome[]> {
    const outcomes = await this.notifier.deliver(payload)
    const retryable = outcomes.filter((outcome) => outcome.status === 'failed' && outcome.retryable === true)

    if (retryable.length > 0) {
      const channels = retryable.map((outcome) => `'${String(outcome.channel)}'`).join(', ')
      const reasons = retryable.map((outcome) => outcome.reason ?? 'no reason given').join('; ')

      throw new Error(`Notification '${payload.template}' failed on ${channels}: ${reasons}`)
    }

    return outcomes
  }
}
