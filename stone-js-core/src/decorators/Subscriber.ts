import { ClassType } from '../declarations'
import { SUBSCRIBER_KEY } from './constants'
import { setClassMetadata } from './Metadata'

/**
 * Subscriber options.
 *
 * This interface defines the configuration options for marking a class as a subscriber.
 */
export interface SubscriberOptions {
  /**
   * Additional configuration settings for the subscriber, if needed.
   */
  [key: string]: unknown
}

/**
 * Subscriber decorator to mark a class as a subscriber.
 *
 * This decorator is useful for customizing classes as subscribers within the Stone.js framework,
 * allowing them to listen for events or perform specific tasks based on their subscription.
 *
 * @param options - The configuration options for the subscriber.
 * @returns A decorator function to set metadata on the target class.
 *
 * @example
 * ```typescript
 * @Subscriber({ event: 'UserCreated' })
 * class UserCreatedSubscriber {
 *   // Subscriber class logic here.
 * }
 * ```
 */
export const Subscriber = <T extends ClassType = ClassType>(options: SubscriberOptions = {}): ClassDecorator => {
  return setClassMetadata<T>(SUBSCRIBER_KEY, { ...options, isClass: true })
}
