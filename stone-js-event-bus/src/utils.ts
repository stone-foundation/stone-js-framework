import { IncomingEvent } from '@stone-js/core'
import { BusEventExtractor } from './declarations'

/**
 * Build the default routing-key extractor.
 *
 * Reads the incoming event's `metadata` (the raw cloud event the adapter captured), takes the key
 * from the configurable `source` property, and the payload from `metadata.detail` (EventBridge) or
 * the whole metadata otherwise. Nothing is hard-coded: pass a different `source`, or a full extractor.
 *
 * @param source - The metadata property holding the routing key.
 * @returns An extractor.
 */
export function defaultExtractor (source: string): BusEventExtractor {
  return (event: IncomingEvent) => {
    const metadata = event.get<Record<string, any>>('metadata', {}) ?? {}
    const key = metadata[source]
    const detail = metadata.detail
    return {
      key: typeof key === 'string' ? key : undefined,
      payload: detail ?? metadata
    }
  }
}
