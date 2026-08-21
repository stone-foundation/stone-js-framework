import { runHealthChecks } from '../src/health'
import { HealthCheck } from '../src/decorators/HealthCheck'
import { HealthHandler, DEFAULT_HEALTH_PATH } from '../src/HealthHandler'
import { TelemetryRoutesMiddleware } from '../src/middleware/TelemetryRoutesMiddleware'

const blueprintWith = (health: unknown): any => ({
  get: (key: string, fallback?: unknown) => (key === 'stone.telemetry' ? { health } : fallback)
})

describe('answering the question a load balancer asks', () => {
  it('answers healthy with nothing registered, which is the truthful answer', async () => {
    // "Is this process up and routing?" It is, and nothing has claimed otherwise. A liveness probe is
    // worth having on its own.
    const response: any = await new HealthHandler({ blueprint: blueprintWith({}) }).handle({} as any)

    // `{ content, statusCode }`: the kernel's platform-neutral way to answer with a status, which the
    // platform's own resolver turns into an HTTP response or a CLI exit code.
    expect(response.statusCode).toBe(200)
    expect(response.content).toEqual({ status: 'healthy', checks: {} })
  })

  it('answers 503 when a dependency says no, and names it', async () => {
    // 503 is what a load balancer reads as "stop routing here"; the body is for the person who follows
    // up, and says which dependency.
    const checks = [
      { name: 'database', module: async () => true },
      { name: 'cache', module: async () => ({ healthy: false, detail: 'connection refused' }) }
    ]

    const response: any = await new HealthHandler({ blueprint: blueprintWith({ checks }) }).handle({} as any)

    expect(response.statusCode).toBe(503)
    expect(response.content.status).toBe('unhealthy')
    expect(response.content.checks.database.healthy).toBe(true)
    expect(response.content.checks.cache).toEqual({ healthy: false, detail: 'connection refused' })
  })

  it('reports a check that throws instead of stopping at it', async () => {
    // The point of a report is to name every dependency that is down, not the first one.
    const report = await runHealthChecks([
      { name: 'queue', module: () => { throw new Error('no broker') } },
      { name: 'disk', module: () => true }
    ])

    expect(report.checks.queue).toEqual({ healthy: false, detail: 'no broker' })
    expect(report.checks.disk.healthy).toBe(true)
  })

  it('fails a check that does not answer, rather than waiting with it', async () => {
    // A probe that hangs is worse than one that fails: the platform hangs with it.
    const report = await runHealthChecks(
      [{ name: 'slow', module: async () => await new Promise<boolean>(() => {}) }],
      undefined,
      20
    )

    expect(report.status).toBe('unhealthy')
    expect(report.checks.slow.detail).toMatch(/did not answer within 20ms/)
  })

  it('builds a class check through the container, so it can hold its own client', async () => {
    class DatabaseCheck {
      constructor (private readonly db: { ping: () => boolean }) {}
      check (): boolean { return this.db.ping() }
    }

    const report = await runHealthChecks(
      [{ name: 'database', module: DatabaseCheck, isClass: true }],
      () => new DatabaseCheck({ ping: () => true })
    )

    expect(report.checks.database.healthy).toBe(true)
  })
})

describe('publishing the probe', () => {
  const runMiddleware = async (health: unknown): Promise<any> => {
    const added: any[] = []
    const blueprint: any = {
      get: (key: string, fallback?: unknown) => (key === 'stone.telemetry' ? { health } : fallback),
      add: (key: string, value: unknown[]) => added.push([key, value])
    }
    await TelemetryRoutesMiddleware({ blueprint } as any, (async () => blueprint) as any)
    return added
  }

  const healthOf = (added: any[]): any =>
    added.flatMap(([, definitions]) => definitions).find((definition: any) => definition.name === 'telemetry.health')

  it('publishes /health by default', async () => {
    const added = await runMiddleware({})

    expect(added[0][0]).toBe('stone.router.definitions')
    expect(healthOf(added)).toMatchObject({ path: DEFAULT_HEALTH_PATH, method: 'GET', name: 'telemetry.health' })
  })

  it('answers wherever the application says', async () => {
    expect(healthOf(await runMiddleware({ path: '/_status' })).path).toBe('/_status')
  })

  it('publishes no probe when it is answered elsewhere', async () => {
    await expect(healthOf(await runMiddleware({ path: false }))).toBeUndefined()
  })

  it('keeps itself out of the published contract', async () => {
    // A contract describing `/health` tells a consumer nothing they can use.
    expect(healthOf(await runMiddleware({})).contract).toBe(false)
  })
})

describe('declaring a check', () => {
  it('registers itself and declares itself a service, so it can be injected', async () => {
    const { getBlueprint, getMetadata, SERVICE_KEY } = await import('@stone-js/core')

    @HealthCheck('database')
    class DatabaseCheck { check (): boolean { return true } }

    const declared: any = getBlueprint(DatabaseCheck as any)
    const service: any = getMetadata(DatabaseCheck as any, SERVICE_KEY as any, {})

    expect(declared.stone.telemetry.health.checks).toEqual([
      { name: 'database', module: DatabaseCheck, isClass: true }
    ])
    expect(service).toMatchObject({ singleton: true, isClass: true, alias: 'health:database' })
  })
})
