import { IncomingEvent } from '@stone-js/core'

/**
 * Builds a generic (platform-agnostic) `IncomingEvent` for tests.
 *
 * @param metadata - The event metadata (accessible via `event.get`).
 * @returns The incoming event.
 */
export function makeIncomingEvent (metadata: Record<string, unknown> = {}): IncomingEvent {
  return IncomingEvent.create({ source: { rawEvent: {}, platform: 'test', rawContext: {} }, metadata })
}
