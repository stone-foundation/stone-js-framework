import { LocalEventBus } from '../../src/drivers/LocalEventBus'
import { MemoryEventBus } from '../../src/drivers/MemoryEventBus'
import { EventBridgeEventBus } from '../../src/drivers/EventBridgeEventBus'

const h = vi.hoisted(() => {
  const send = vi.fn()
  const EventBridgeClient = vi.fn(function (this: any, opts: any) { this.opts = opts; this.send = send })
  const PutEventsCommand = vi.fn(function (this: any, input: any) { this.input = input })
  return { send, EventBridgeClient, PutEventsCommand }
})

vi.mock('@aws-sdk/client-eventbridge', () => ({ EventBridgeClient: h.EventBridgeClient, PutEventsCommand: h.PutEventsCommand }))

describe('LocalEventBus', () => {
  it('delivers to the application emitter', async () => {
    const emitter = { emit: vi.fn() }
    const bus = LocalEventBus.create(emitter)
    expect(bus.name).toBe('local')
    await bus.emit('order.shipped', { id: 1 })
    expect(emitter.emit).toHaveBeenCalledWith('order.shipped', { id: 1 })
  })

  it('honours a custom name', () => {
    expect(LocalEventBus.create({ emit: vi.fn() }, 'inproc').name).toBe('inproc')
  })
})

describe('MemoryEventBus', () => {
  it('records emitted messages', async () => {
    const bus = MemoryEventBus.create()
    expect(bus.name).toBe('memory')
    await bus.emit('a', 1)
    await bus.emit('b', 2)
    expect(bus.events).toEqual([{ name: 'a', payload: 1 }, { name: 'b', payload: 2 }])
  })

  it('honours a custom name', () => {
    expect(MemoryEventBus.create('rec').name).toBe('rec')
  })
})

describe('EventBridgeEventBus', () => {
  beforeEach(() => { h.send.mockReset().mockResolvedValue({}); h.EventBridgeClient.mockClear(); h.PutEventsCommand.mockClear() })

  it('defaults name/source/bus and emits a PutEvents entry', async () => {
    const bus = EventBridgeEventBus.create({ name: 'cloud', driver: 'eventbridge', client: { send: h.send } })
    expect(bus.name).toBe('cloud')
    await bus.emit('order.shipped', { id: 1 })
    expect(h.PutEventsCommand).toHaveBeenCalledWith({
      Entries: [{ Source: 'stone.app', DetailType: 'order.shipped', Detail: JSON.stringify({ id: 1 }), EventBusName: 'default' }]
    })
  })

  it('defaults its name to eventbridge', () => {
    expect(EventBridgeEventBus.create({ driver: 'eventbridge', client: { send: h.send } } as any).name).toBe('eventbridge')
  })

  it('honours source/busName and per-emit overrides + empty payload', async () => {
    const client = { send: h.send }
    const bus = EventBridgeEventBus.create({ name: 'cloud', driver: 'eventbridge', source: 'my.app', busName: 'orders', client })
    await bus.emit('order.shipped', undefined, { source: 'override', detailType: 'custom' })
    expect(h.PutEventsCommand).toHaveBeenCalledWith({
      Entries: [{ Source: 'override', DetailType: 'custom', Detail: JSON.stringify({}), EventBusName: 'orders' }]
    })
    expect(client.send).toHaveBeenCalled()
  })

  it('builds a client from region when none is provided', async () => {
    await EventBridgeEventBus.create({ name: 'cloud', driver: 'eventbridge', region: 'us-east-1' }).emit('e')
    expect(h.EventBridgeClient).toHaveBeenCalledWith({ region: 'us-east-1' })
    h.EventBridgeClient.mockClear()
    await EventBridgeEventBus.create({ name: 'cloud', driver: 'eventbridge' }).emit('e')
    expect(h.EventBridgeClient).toHaveBeenCalledWith({})
  })
})

describe('EventBridgeEventBus without the SDK', () => {
  it('throws a helpful error', async () => {
    vi.resetModules()
    vi.doMock('@aws-sdk/client-eventbridge', () => { throw new Error('Cannot find module') })
    const { EventBridgeEventBus: Fresh } = await import('../../src/drivers/EventBridgeEventBus')
    await expect(Fresh.create({ name: 'cloud', driver: 'eventbridge' }).emit('e')).rejects.toThrow(/@aws-sdk\/client-eventbridge/)
    vi.doUnmock('@aws-sdk/client-eventbridge')
    vi.resetModules()
  })
})
