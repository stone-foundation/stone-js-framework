import { TestAdapter } from '../src/TestAdapter'
import { TEST_PLATFORM } from '../src/declarations'
import { requestPlatform, TakeOverCurrentAdapterMiddleware, testAdapterBlueprint, testAdapterBlueprintFor } from '../src/options/TestAdapterBlueprint'

/** A blueprint that remembers what was written to it. */
const makeBlueprint = (values: Record<string, unknown> = {}): any => ({
  values,
  get: (key: string, fallback?: unknown) => values[key] ?? fallback,
  set: (key: string, value: unknown) => { values[key] = value }
})

const runTakeOver = async (blueprint: any): Promise<any> => {
  await TakeOverCurrentAdapterMiddleware({ blueprint } as any, async () => blueprint as any)
  return blueprint.values['stone.adapter']
}

describe('taking over the current adapter', () => {
  it('keeps the platform the application declared', async () => {
    // The reason this exists: adapters contribute much of what an app is through blueprint middleware
    // gated on `stone.adapter.platform`. Under a platform of our own invention, every one of those
    // conditions is false, and the kernel silently builds a poorer response than production does.
    const adapter = await runTakeOver(makeBlueprint({
      'stone.adapter': { platform: 'node-http', variant: 'server', alias: 'http' }
    }))

    expect(adapter).toEqual(expect.objectContaining({ platform: 'node-http', variant: 'server', alias: 'http' }))
  })

  it('replaces the integration, and only the integration', async () => {
    const adapter = await runTakeOver(makeBlueprint({
      'stone.adapter': { platform: 'browser', errorHandlers: { TypeError: 'handler' } }
    }))

    // Its own error handlers survive: a test asserting the app's error path needs the real ones.
    expect(adapter.errorHandlers).toEqual({ TypeError: 'handler' })
    expect(adapter.resolver(makeBlueprint())).toBeInstanceOf(TestAdapter)
  })

  it('drops the adapter middleware, which has no raw event left to translate', async () => {
    // Platform middleware exists to normalise an `IncomingMessage`, a Lambda payload, a DOM event. A
    // test hands over a ready `IncomingEvent`, so running them would be running them against nothing.
    const adapter = await runTakeOver(makeBlueprint({
      'stone.adapter': { platform: 'node-http', middleware: ['BodyEventMiddleware'] }
    }))

    expect(adapter.middleware).toEqual([])
  })

  it('stands in for an adapter when the application declares none', async () => {
    // A single-handler service with no platform still has to boot.
    const adapter = await runTakeOver(makeBlueprint({}))

    expect(adapter.platform).toBe(TEST_PLATFORM)
    expect(adapter.eventHandlerResolver).toBeTypeOf('function')
    expect(adapter.resolver(makeBlueprint())).toBeInstanceOf(TestAdapter)
  })

  it('runs after the platform has had its say', () => {
    // The whole mechanism is the ordering: the core selects the current adapter at 0.1, adapters
    // contribute their platform-conditional configuration up to 6, and this runs last.
    const middleware: any = (testAdapterBlueprint.stone as any).blueprint.middleware

    expect(middleware).toEqual([{ module: TakeOverCurrentAdapterMiddleware, priority: 100 }])
  })

  it('declares no adapter of its own, so the app selection stands', () => {
    // Registering one with `current: true` is what took the platform away in the first place.
    expect((testAdapterBlueprint.stone as any).adapters).toBeUndefined()
    expect((testAdapterBlueprint.stone as any).adapter).toBeUndefined()
  })
})

describe('naming the context a test wants', () => {
  it('asks for the platform before the core selects, so its configuration follows', async () => {
    // An app with several contexts has to be selectable: this is the same promise the framework makes
    // about deployment, said in a test. Setting it before selection is what makes every
    // platform-conditional contribution line up behind the same answer.
    const blueprint = makeBlueprint({ 'stone.adapter': { alias: 'web' } })

    await requestPlatform('browser')({ blueprint } as any, async () => blueprint as any)

    expect(blueprint.values['stone.adapter']).toEqual({ alias: 'web', platform: 'browser' })
  })

  it('runs its request first and its takeover last', () => {
    const middleware: any = (testAdapterBlueprintFor('browser').stone as any).blueprint.middleware

    expect(middleware.map((m: any) => m.priority)).toEqual([0, 100])
    expect(middleware[1].module).toBe(TakeOverCurrentAdapterMiddleware)
  })
})
