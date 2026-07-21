import { ChatGateway } from '../app/ChatGateway'
import { Broadcaster, IncomingEvent } from '@stone-js/realtime'

// Mock only the decorators to lighten the test environment; keep connectionOf real.
vi.mock(import('@stone-js/realtime'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    RealtimeGateway: vi.fn(() => vi.fn()),
    OnConnect: vi.fn(() => vi.fn()),
    OnDisconnect: vi.fn(() => vi.fn()),
    OnEvent: vi.fn(() => vi.fn())
  }
})

describe('ChatGateway', () => {
  let emit: ReturnType<typeof vi.fn>
  let to: ReturnType<typeof vi.fn>
  let gateway: ChatGateway

  const eventWith = (connectionId: string): IncomingEvent =>
    ({ get: (key: string, fallback: unknown) => (key === 'metadata' ? { connection: { id: connectionId } } : fallback) }) as unknown as IncomingEvent

  beforeEach(() => {
    emit = vi.fn()
    to = vi.fn(() => ({ emit }))
    gateway = new ChatGateway({ realtime: { to } as unknown as Broadcaster })
  })

  it('broadcasts a message to the room', async () => {
    await gateway.onMessage({ from: 'ana', text: 'hi' })
    expect(to).toHaveBeenCalledWith('room:general')
    expect(emit).toHaveBeenCalledWith('message', { from: 'ana', text: 'hi' })
  })

  it('announces presence on connect', async () => {
    await gateway.onConnect(undefined, eventWith('c1'))
    expect(emit).toHaveBeenCalledWith('presence', { joined: 'c1' })
  })

  it('announces presence on disconnect', async () => {
    await gateway.onDisconnect(undefined, eventWith('c1'))
    expect(emit).toHaveBeenCalledWith('presence', { left: 'c1' })
  })
})
