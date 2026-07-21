import { Worker } from '../src/Worker'
import { JobRegistry } from '../src/JobRegistry'
import { QueueManager } from '../src/QueueManager'
import { QueueError } from '../src/errors/QueueError'
import { QueueServiceProvider } from '../src/QueueServiceProvider'

class SendEmail { async handle (): Promise<string> { return 'sent' } }
const fnHandler = vi.fn(async () => 'done')

const makeContainer = (config: any): any => {
  const container: any = {
    make: vi.fn((key: any) => (key === 'blueprint' ? { get: () => config } : new key())),
    instanceIf: vi.fn(() => container),
    alias: vi.fn(() => container),
    singletonIf: vi.fn(() => container)
  }
  return container
}

const managerArg = (c: any): QueueManager => c.instanceIf.mock.calls.find((call: any[]) => call[0] === QueueManager)[1]

describe('QueueServiceProvider', () => {
  afterEach(() => { QueueManager.setInstance(undefined); JobRegistry.setInstance(undefined) })

  it('binds queueManager, queue, jobRegistry and worker, and registers handlers', () => {
    const container = makeContainer({
      default: 'redis',
      connections: [{ name: 'redis', driver: 'redis', url: 'redis://x' }],
      handlers: [
        { name: 'send-email', module: SendEmail, isClass: true, action: 'handle' },
        { name: 'ping', module: fnHandler }
      ]
    })

    new QueueServiceProvider(container).register()

    expect(container.instanceIf).toHaveBeenCalledWith(QueueManager, expect.any(QueueManager))
    expect(container.alias).toHaveBeenCalledWith(QueueManager, ['queueManager'])
    expect(container.instanceIf).toHaveBeenCalledWith(JobRegistry, expect.any(JobRegistry))
    expect(container.singletonIf).toHaveBeenCalledWith('queue', expect.any(Function))
    expect(container.singletonIf).toHaveBeenCalledWith(Worker, expect.any(Function))

    const manager = managerArg(container)
    expect(manager.has('redis')).toBe(true)
    expect(manager.has('memory')).toBe(true)
    expect(manager.connection('redis').name).toBe('redis') // builds via the registered factory
    expect(JobRegistry.getInstance()?.has('send-email')).toBe(true)
    expect(JobRegistry.getInstance()?.has('ping')).toBe(true)

    // The bound worker factory builds a Worker.
    const workerFactory = container.singletonIf.mock.calls.find((c: any[]) => c[0] === Worker)[1]
    expect(workerFactory()).toBeInstanceOf(Worker)
  })

  it('registers a config-driven memory connection', () => {
    const container = makeContainer({ connections: [{ name: 'ram', driver: 'memory' }] })
    new QueueServiceProvider(container).register()
    expect(managerArg(container).connection('ram').name).toBe('ram')
  })

  it('is zero-config: the default memory connection resolves as `queue`', () => {
    const container = makeContainer({})
    new QueueServiceProvider(container).register()
    const factory = container.singletonIf.mock.calls.find((c: any[]) => c[0] === 'queue')[1]
    expect(factory().name).toBe('memory')
  })

  it('throws for an unknown driver', () => {
    const container = makeContainer({ connections: [{ name: 'x', driver: 'rabbitmq' }] })
    expect(() => new QueueServiceProvider(container).register()).toThrow(QueueError)
  })
})
