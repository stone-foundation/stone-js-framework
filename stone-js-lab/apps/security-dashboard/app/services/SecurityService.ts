import { ITelemetry } from '@stone-js/telemetry'
import { ILogger, Service } from '@stone-js/core'

/** Result of a login attempt. */
export interface LoginResult {
  ok: boolean
  message: string
}

/**
 * A tiny demo authentication service.
 *
 * It is intentionally trivial (a single hard-coded credential) — the point is not real auth but
 * to emit **security telemetry**: every attempt increments a `security.login.*` counter, which
 * flows through the shared exporter into the dashboard. Real apps would check a user store.
 */
@Service({ alias: 'securityService' })
export class SecurityService {
  private readonly logger: ILogger
  private readonly telemetry: ITelemetry

  constructor ({ logger, telemetry }: { logger: ILogger, telemetry: ITelemetry }) {
    this.logger = logger
    this.telemetry = telemetry
  }

  /**
   * Attempt a login and record the outcome as security telemetry.
   *
   * @param username - The submitted username.
   * @param password - The submitted password.
   * @returns The login result.
   */
  attempt (username: string, password: string): LoginResult {
    const ok = username === 'admin' && password === 'stone'

    if (ok) {
      this.telemetry.counter('security.login.success', 1, { username })
      this.logger.info(`Login success: ${username}`)
      return { ok: true, message: `Welcome, ${username}.` }
    }

    this.telemetry.counter('security.login.failed', 1, { username })
    this.logger.warn(`Login failed: ${username}`)
    return { ok: false, message: 'Invalid credentials.' }
  }
}
