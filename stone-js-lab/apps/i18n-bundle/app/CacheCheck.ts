import { HealthCheck } from '@stone-js/telemetry'

/** A check that reports a detail alongside its verdict. */
@HealthCheck('cache')
export class CacheCheck {
  check (): { healthy: boolean, detail: string } { return { healthy: true, detail: 'reachable' } }
}
