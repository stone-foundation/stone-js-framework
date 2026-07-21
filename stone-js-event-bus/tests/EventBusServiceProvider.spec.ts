import { EventBusManager } from '../src/EventBusManager'
import { EventBusError } from '../src/errors/EventBusError'
import { EventBusServiceProvider } from '../src/EventBusServiceProvider'

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

describe('EventBusServiceProvider (emit side)', () => {
  afterEach(() => { EventBusManager.setInstance(undefined) })

  it('binds eventBus / eventBusManager and a local connection', () => {
    const container = makeContainer({})

    new EventBusServiceProvider(container).register()

    expect(container.instanceIf).toHaveBeenCalledWith(EventBusManager, expect.any(EventBusManager))
    expect(container.alias).toHaveBeenCalledWith(EventBusManager, ['eventBus', 'eventBusManager'])

    const manager = managerArg(container)
    expect(manager.has('local')).toBe(true)
    expect(manager.connection('local').name).toBe('local') // built via the emitter-backed factory
    expect(EventBusManager.getInstance()).toBe(manager)
  })

  it('registers a config-driven memory connection', () => {
    const container = makeContainer({ connections: [{ name: 'rec', driver: 'memory' }] })
    new EventBusServiceProvider(container).register()
    expect(managerArg(container).connection('rec').name).toBe('rec')
  })

  it('registers an eventbridge connection', () => {
    const container = makeContainer({ connections: [{ name: 'cloud', driver: 'eventbridge' }] })
    new EventBusServiceProvider(container).register()
    expect(managerArg(container).connection('cloud').name).toBe('cloud')
  })

  it('throws for an unknown driver', () => {
    const container = makeContainer({ connections: [{ name: 'x', driver: 'kafka' }] })
    expect(() => new EventBusServiceProvider(container).register()).toThrow(EventBusError)
  })
})
