import { HealthCheck } from '@stone-js/telemetry'

/** A check that holds what it checks, which is the reason a check is a service. */
@HealthCheck('database')
export class DatabaseCheck {
  check (): boolean { return true }
}
