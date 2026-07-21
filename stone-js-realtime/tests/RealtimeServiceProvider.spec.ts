import { RealtimeManager } from '../src/RealtimeManager'
import { RealtimeError } from '../src/errors/RealtimeError'
import { RealtimeServiceProvider } from '../src/RealtimeServiceProvider'

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

describe('RealtimeServiceProvider (broadcaster side)', () => {
  afterEach(() => { RealtimeManager.setInstance(undefined) })

  it('binds realtimeManager and realtime, and registers connections', () => {
    const container = makeContainer({
      default: 'redis',
      connections: [{ name: 'redis', driver: 'redis', url: 'redis://x' }]
    })

    new RealtimeServiceProvider(container).register()

    expect(container.instanceIf).toHaveBeenCalledWith(RealtimeManager, expect.any(RealtimeManager))
    expect(container.alias).toHaveBeenCalledWith(RealtimeManager, ['realtimeManager'])
    expect(container.singletonIf).toHaveBeenCalledWith('realtime', expect.any(Function))

    const manager = managerArg(container)
    expect(manager.has('redis')).toBe(true)
    expect(manager.has('memory')).toBe(true)
    expect(manager.connection('redis').name).toBe('redis')
    expect(RealtimeManager.getInstance()).toBe(manager)
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

  it('throws for an unknown driver', () => {
    const container = makeContainer({ connections: [{ name: 'x', driver: 'kafka' }] })
    expect(() => new RealtimeServiceProvider(container).register()).toThrow(RealtimeError)
  })
})
