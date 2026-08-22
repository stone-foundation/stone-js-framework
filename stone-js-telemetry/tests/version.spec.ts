import { VersionHandler, DEFAULT_VERSION_PATH, UNDECLARED_RELEASE } from '../src/VersionHandler'
import { TelemetryRoutesMiddleware } from '../src/middleware/TelemetryRoutesMiddleware'

const blueprintWith = (values: Record<string, unknown>): any => ({
  get: (key: string, fallback?: unknown) => (key in values ? values[key] : fallback)
})

describe('which build is answering', () => {
  it('names the release, the adapter that won, the app and its environment', async () => {
    // The adapter earns its place: one artefact can carry several, each claiming the runtime it
    // detects, so which one won is not knowable from the outside.
    const handler = new VersionHandler({
      blueprint: blueprintWith({
        'stone.name': 'noowow-api',
        'stone.env': 'production',
        'stone.adapter.platform': 'aws_lambda_http',
        'stone.telemetry': { version: { release: '2026.08.21-3' } }
      })
    })

    expect(handler.handle({} as any)).toEqual({
      name: 'noowow-api',
      env: 'production',
      platform: 'aws_lambda_http',
      release: '2026.08.21-3'
    })
  })

  it('says the release is unknown rather than inventing one', async () => {
    // Never read from the environment here: an application already knows this and already has a place
    // to put what it knows. Saying nothing is better than guessing.
    const handler = new VersionHandler({ blueprint: blueprintWith({}) })

    expect(handler.handle({} as any).release).toBe(UNDECLARED_RELEASE)
  })
})

describe('publishing the build identity', () => {
  const run = async (version: unknown): Promise<any[]> => {
    const added: any[] = []
    const blueprint: any = {
      get: (key: string, fallback?: unknown) => (key === 'stone.telemetry' ? { version } : fallback),
      add: (key: string, value: unknown[]) => added.push([key, value])
    }
    await TelemetryRoutesMiddleware({ blueprint } as any, (async () => blueprint) as any)
    return added.flatMap(([, definitions]) => definitions)
  }

  const versionOf = (definitions: any[]): any => definitions.find((d) => d.name === 'telemetry.version')

  it('publishes /version by default', async () => {
    expect(versionOf(await run({}))).toMatchObject({ path: DEFAULT_VERSION_PATH, method: 'GET' })
  })

  it('answers wherever the application says', async () => {
    expect(versionOf(await run({ path: '/_build' })).path).toBe('/_build')
  })

  it('publishes nothing when even that is more than you want to say', async () => {
    expect(versionOf(await run({ path: false }))).toBeUndefined()
  })

  it('stays out of the published contract, like the probe', async () => {
    expect(versionOf(await run({})).contract).toBe(false)
  })
})
