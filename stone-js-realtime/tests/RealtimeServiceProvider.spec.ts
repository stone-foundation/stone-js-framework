import { collectKeyHandlers } from '@stone-js/router'
import { RealtimeManager } from '../src/RealtimeManager'
import { RealtimeRouter } from '../src/RealtimeRouter'
import { RealtimeError } from '../src/errors/RealtimeError'
import { RealtimeServiceProvider } from '../src/RealtimeServiceProvider'

// Keep KeyRouter real; only stub the class-metadata scan so we can drive @On* discovery.
vi.mock('@stone-js/router', async (importOriginal) => {
  const actual: any = await importOriginal()
  return { ...actual, collectKeyHandlers: vi.fn(() => []) }
})

class Chat { onConnect (connection: any): string { return `hi ${String(connection)}` } }

const makeContainer = (config: any): any => {
  const container: any = {
    make: vi.fn((key: any) => (key === 'blueprint' ? { get: () => config } : new key())),
    instanceIf: vi.fn(() => container),
    alias: vi.fn(() => container),
    singletonIf: vi.fn(() => container)
  }
  return container
}

const managerArg = (c: any): RealtimeManager => c.instanceIf.mock.calls.find((call: any[]) => call[0] === RealtimeManager)[1]
const routerArg = (c: any): RealtimeRouter => c.instanceIf.mock.calls.find((call: any[]) => call[0] === RealtimeRouter)[1]

describe('RealtimeServiceProvider', () => {
  afterEach(() => { RealtimeManager.setInstance(undefined); RealtimeRouter.setInstance(undefined); vi.mocked(collectKeyHandlers).mockReset().mockReturnValue([]) })

  it('binds realtimeManager, realtime and realtimeRouter, and registers connections', () => {
    const container = makeContainer({
      default: 'redis',
      connections: [{ name: 'redis', driver: 'redis', url: 'redis://x' }]
    })

    new RealtimeServiceProvider(container).register()

    expect(container.instanceIf).toHaveBeenCalledWith(RealtimeManager, expect.any(RealtimeManager))
    expect(container.alias).toHaveBeenCalledWith(RealtimeManager, ['realtimeManager'])
    expect(container.instanceIf).toHaveBeenCalledWith(RealtimeRouter, expect.any(RealtimeRouter))
    expect(container.alias).toHaveBeenCalledWith(RealtimeRouter, ['realtimeRouter'])
    expect(container.singletonIf).toHaveBeenCalledWith('realtime', expect.any(Function))

    const manager = managerArg(container)
    expect(manager.has('redis')).toBe(true)
    expect(manager.has('memory')).toBe(true)
    expect(manager.connection('redis').name).toBe('redis')

    expect(RealtimeManager.getInstance()).toBe(manager)
    expect(RealtimeRouter.getInstance()).toBe(routerArg(container))
  })

  it('is zero-config: the default memory connection resolves as `realtime`', () => {
    const container = makeContainer({})
    new RealtimeServiceProvider(container).register()
    const factory = container.singletonIf.mock.calls.find((c: any[]) => c[0] === 'realtime')[1]
    expect(factory().name).toBe('memory')
  })

  it('registers a config-driven memory connection', () => {
    const container = makeContainer({ connections: [{ name: 'ram', driver: 'memory' }] })
    new RealtimeServiceProvider(container).register()
    expect(managerArg(container).connection('ram').name).toBe('ram')
  })

  it('wires @On* methods of a gateway class into the router', async () => {
    vi.mocked(collectKeyHandlers).mockReturnValueOnce([{ key: 'connect', action: 'onConnect' }])
    const container = makeContainer({ gateways: [{ module: Chat, isClass: true }] })

    new RealtimeServiceProvider(container).register()

    const router = routerArg(container)
    expect(router.has('connect')).toBe(true)
    expect(await router.connect('c1')).toBe('hi c1')
  })

  it('wires a non-resolvable (instance) gateway too', async () => {
    vi.mocked(collectKeyHandlers).mockReturnValueOnce([{ key: 'message', action: 'onMessage' }])
    const instance = { onMessage: (m: any) => `got ${String(m)}` }
    const container = makeContainer({ gateways: [{ module: instance }] })

    new RealtimeServiceProvider(container).register()

    expect(await routerArg(container).message('x')).toBe('got x')
  })

  it('throws for an unknown driver', () => {
    const container = makeContainer({ connections: [{ name: 'x', driver: 'kafka' }] })
    expect(() => new RealtimeServiceProvider(container).register()).toThrow(RealtimeError)
  })
})
