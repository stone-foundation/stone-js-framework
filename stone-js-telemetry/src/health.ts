import { MetaHealthCheck, HealthCheckResult, HealthReport, IHealthCheck } from './declarations'

/** How long a single check may take before it counts as failed. */
export const DEFAULT_HEALTH_TIMEOUT = 2000

/**
 * Run every registered check and say, once, whether the application is serving.
 *
 * A health endpoint is a binary question asked by something that cannot read: a load balancer deciding
 * whether to send traffic, a platform deciding whether to replace the instance. So the answer is a
 * status code first, and a body for the human who follows up.
 *
 * Two properties make it usable as a probe. It never hangs: a check that does not answer within its
 * timeout is a failed check, because a probe that waits is worse than one that fails. And it never
 * throws: a check that raises reports its own failure and the others still report theirs, since the
 * point of a report is to name which dependency is down, not to stop at the first.
 *
 * With nothing registered it answers healthy, which is the honest answer to "is the process up and
 * routing": it is, and nothing has claimed otherwise.
 *
 * @param checks - The registered checks.
 * @param resolve - How to build a class or factory check, normally the container.
 * @param timeout - How long each check may take.
 * @returns The report.
 */
export async function runHealthChecks (
  checks: MetaHealthCheck[],
  resolve?: (target: any) => unknown,
  timeout: number = DEFAULT_HEALTH_TIMEOUT
): Promise<HealthReport> {
  const results = await Promise.all(checks.map(async (check) => await runOne(check, resolve, timeout)))
  const healthy = results.every((result) => result.healthy)

  return {
    status: healthy ? 'healthy' : 'unhealthy',
    checks: Object.fromEntries(results.map(({ name, ...rest }) => [name, rest]))
  }
}

/**
 * Run one check, whatever form it was declared in, and never let it escape.
 *
 * @param check - The declared check.
 * @param resolve - How to build a class or factory check.
 * @param timeout - How long it may take.
 * @returns Its result.
 */
async function runOne (
  check: MetaHealthCheck,
  resolve: ((target: any) => unknown) | undefined,
  timeout: number
): Promise<HealthCheckResult & { name: string }> {
  const name = check.name ?? nameOf(check.module)

  try {
    const answered = await Promise.race([
      Promise.resolve(invoke(check, resolve)),
      timedOut(timeout)
    ])

    return { name, ...normalize(answered) }
  } catch (error: any) {
    return { name, healthy: false, detail: String(error?.message ?? error) }
  }
}

/**
 * Call a check in whichever of the three forms it was written.
 *
 * @param check - The declared check.
 * @param resolve - How to build a class or factory check.
 * @returns What the check answered.
 */
function invoke (check: MetaHealthCheck, resolve?: (target: any) => unknown): unknown {
  if (check.isClass === true) {
    const instance = (resolve?.(check.module) ?? new (check.module as any)({})) as IHealthCheck
    return instance.check()
  }

  if (check.isFactory === true) {
    return (check.module as any)(resolve)()
  }

  return (check.module as any)()
}

/**
 * A check that does not answer in time is a failed check: a probe that waits is worse than one that
 * fails, because the platform waits with it.
 *
 * @param timeout - The deadline.
 * @returns A promise that rejects at the deadline.
 */
async function timedOut (timeout: number): Promise<never> {
  return await new Promise<never>((_resolve, reject) => {
    setTimeout(() => reject(new Error(`did not answer within ${String(timeout)}ms`)), timeout).unref?.()
  })
}

/**
 * Read what a check answered: a boolean, or a result carrying a detail.
 *
 * @param answered - What the check returned.
 * @returns The normalised result.
 */
function normalize (answered: unknown): HealthCheckResult {
  if (typeof answered === 'boolean') { return { healthy: answered } }
  if (answered === undefined || answered === null) { return { healthy: true } }

  const result = answered as HealthCheckResult

  return typeof result.healthy === 'boolean' ? result : { healthy: true }
}

/**
 * Name a check that did not name itself.
 *
 * @param module - The declared module.
 * @returns Its name.
 */
function nameOf (module: unknown): string {
  return typeof module === 'function' && module.name !== '' ? module.name : 'check'
}
