import { KeyRouter, collectKeyHandlers } from '@stone-js/key-router'
import { EventBusManager } from '../src/EventBusManager'
import { EventBusError } from '../src/errors/EventBusError'
import { EventBusServiceProvider } from '../src/EventBusServiceProvider'

vi.mock('@stone-js/key-router', async (importOriginal) => {
  const actual: any = await importOriginal()
  return { ...actual, collectKeyHandlers: vi.fn(() => []) }
})

class Orders { async handle (): Promise<string> { return 'ok' }; async onCancelled (): Promise<void> {} }
const fnHandler = vi.fn(async () => 'done')

const makeContainer = (config: any): any => {
  const emitter = { emit: vi.fn() }
  const container: any = {
    make: vi.fn((key: any) => (key === 'blueprint' ? { get: () => config } : key === 'eventEmitter' ? emitter : new key())),
    instanceIf: vi.fn(() => container),
    alias: vi.fn(() => container),
    emitter
  }
  return container
}

const managerArg = (c: any): EventBusManager => c.instanceIf.mock.calls.find((call: any[]) => call[0] === EventBusManager)[1]
const routerArg = (c: any): KeyRouter => c.instanceIf.mock.calls.find((call: any[]) => call[0] === KeyRouter)[1]

describe('EventBusServiceProvider', () => {
  afterEach(() => { EventBusManager.setInstance(undefined); vi.mocked(collectKeyHandlers).mockReset().mockReturnValue([]) })

  it('binds eventBus, eventBusManager and eventBusRouter, and a local connection', async () => {
    const container = makeContainer({ handlers: [{ name: 'order.shipped', module: Orders, isClass: true, action: 'handle' }, { name: 'ping', module: fnHandler }] })

    new EventBusServiceProvider(container).register()

    expect(container.instanceIf).toHaveBeenCalledWith(EventBusManager, expect.any(EventBusManager))
    expect(container.alias).toHaveBeenCalledWith(EventBusManager, ['eventBus', 'eventBusManager'])
    expect(container.instanceIf).toHaveBeenCalledWith(KeyRouter, expect.any(KeyRouter))
    expect(container.alias).toHaveBeenCalledWith(KeyRouter, ['eventBusRouter'])

    const manager = managerArg(container)
    expect(manager.has('local')).toBe(true)
    expect(manager.connection('local').name).toBe('local') // built via the emitter-backed factory
    expect(EventBusManager.getInstance()).toBe(manager)

    const router = routerArg(container)
    expect(router.has('order.shipped')).toBe(true)
    expect(router.has('ping')).toBe(true)
  })

  it('registers config-driven connections (memory) and scans @OnBusEvent methods', async () => {
    vi.mocked(collectKeyHandlers).mockReturnValueOnce([{ key: 'order.cancelled', action: 'onCancelled' }])
    const container = makeContainer({
      connections: [{ name: 'rec', driver: 'memory' }],
      handlers: [{ module: Orders, isClass: true }] // no name: @OnBusEvent scan
    })

    new EventBusServiceProvider(container).register()

    expect(managerArg(container).connection('rec').name).toBe('rec')
    expect(routerArg(container).has('order.cancelled')).toBe(true)
  })

  it('registers an eventbridge connection (no handlers configured)', () => {
    const container = makeContainer({ connections: [{ name: 'cloud', driver: 'eventbridge' }] })
    new EventBusServiceProvider(container).register()
    expect(managerArg(container).connection('cloud').name).toBe('cloud')
  })

  it('throws for an unknown driver', () => {
    const container = makeContainer({ connections: [{ name: 'x', driver: 'kafka' }] })
    expect(() => new EventBusServiceProvider(container).register()).toThrow(EventBusError)
  })
})
