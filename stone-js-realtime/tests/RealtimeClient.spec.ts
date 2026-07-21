import { RealtimeClient } from '../src/RealtimeClient'

/** A fake WebSocket using the Node `ws` style (`on(event, cb)`). */
class WsSocket {
  static last: WsSocket
  readonly sent: string[] = []
  closed = false
  private readonly handlers: Record<string, Function> = {}
  constructor (public readonly url: string, public readonly protocols?: any) {
    WsSocket.last = this
    setTimeout(() => this.handlers.open?.(), 0)
  }

  on (event: string, cb: Function): void { this.handlers[event] = cb }
  send (data: string): void { this.sent.push(data) }
  close (): void { this.closed = true }
  emit (event: string, ...args: any[]): void { this.handlers[event]?.(...args) }
}

/** A fake WebSocket using the browser style (`onopen`/`onmessage` properties). */
class BrowserSocket {
  static last: BrowserSocket
  readonly sent: string[] = []
  onopen?: () => void
  onmessage?: (event: { data: unknown }) => void
  onerror?: () => void
  constructor (public readonly url: string) {
    BrowserSocket.last = this
    setTimeout(() => this.onopen?.(), 0)
  }

  send (data: string): void { this.sent.push(data) }
}

describe('RealtimeClient', () => {
  afterEach(() => { vi.unstubAllGlobals() })

  it('connects with an explicit WebSocket and sends event/subscribe frames', async () => {
    const client = RealtimeClient.create({ url: 'wss://x', protocols: 'p', WebSocket: WsSocket })
    expect(client.name).toBe('client')
    expect(client.connected).toBe(false)

    await client.broadcast('room', 'ping', { n: 1 })
    expect(client.connected).toBe(true)
    expect(WsSocket.last.url).toBe('wss://x')
    expect(WsSocket.last.protocols).toBe('p')
    expect(JSON.parse(WsSocket.last.sent[0])).toEqual({ type: 'event', channel: 'room', event: 'ping', payload: { n: 1 } })

    await client.to('room').emit('hi')
    expect(JSON.parse(WsSocket.last.sent[1])).toMatchObject({ type: 'event', event: 'hi' })

    await client.subscribe('room')
    await client.unsubscribe('room')
    expect(JSON.parse(WsSocket.last.sent[2])).toEqual({ type: 'subscribe', channel: 'room' })
    expect(JSON.parse(WsSocket.last.sent[3])).toEqual({ type: 'unsubscribe', channel: 'room' })
  })

  it('connect() is idempotent (one socket)', async () => {
    const client = RealtimeClient.create({ url: 'wss://x', WebSocket: WsSocket })
    await client.connect()
    const socket = WsSocket.last
    await client.connect()
    expect(WsSocket.last).toBe(socket)
  })

  it('on() subscribes and delivers incoming ws messages to channel and wildcard listeners', async () => {
    const client = RealtimeClient.create({ url: 'wss://x', WebSocket: WsSocket })
    const onRoom = vi.fn()
    const onAll = vi.fn()
    const off = client.on('room', onRoom)
    client.on('*', onAll)
    await client.connect()

    expect(JSON.parse(WsSocket.last.sent[0])).toEqual({ type: 'subscribe', channel: 'room' })

    WsSocket.last.emit('message', JSON.stringify({ channel: 'room', event: 'ping', payload: 1 }))
    expect(onRoom).toHaveBeenCalledWith({ channel: 'room', event: 'ping', payload: 1 })
    expect(onAll).toHaveBeenCalledWith({ channel: 'room', event: 'ping', payload: 1 })

    off()
    WsSocket.last.emit('message', JSON.stringify({ channel: 'room', event: 'x', payload: 0 }))
    expect(onRoom).toHaveBeenCalledTimes(1)
  })

  it('tolerates transport errors and malformed messages', async () => {
    const client = RealtimeClient.create({ url: 'wss://x', WebSocket: WsSocket })
    const listener = vi.fn()
    client.on('room', listener)
    await client.connect()
    expect(() => WsSocket.last.emit('error', new Error('boom'))).not.toThrow()
    WsSocket.last.emit('message', 'not json')
    expect(listener).not.toHaveBeenCalled()
  })

  it('supports the browser property style and unwraps event.data', async () => {
    const client = RealtimeClient.create({ url: 'wss://x', WebSocket: BrowserSocket })
    const listener = vi.fn()
    client.on('room', listener)
    await client.connect()
    expect(() => BrowserSocket.last.onerror?.()).not.toThrow()
    BrowserSocket.last.onmessage?.({ data: JSON.stringify({ channel: 'room', event: 'e', payload: 2 }) })
    expect(listener).toHaveBeenCalledWith({ channel: 'room', event: 'e', payload: 2 })
  })

  it('delivers to wildcard-only listeners and ignores non-string junk frames', async () => {
    const client = RealtimeClient.create({ url: 'wss://x', WebSocket: WsSocket })
    const onAll = vi.fn()
    client.on('*', onAll) // no direct 'room' listener
    await client.connect()

    WsSocket.last.emit('message', JSON.stringify({ channel: 'room', event: 'e', payload: 1 }))
    expect(onAll).toHaveBeenCalledWith({ channel: 'room', event: 'e', payload: 1 })

    expect(() => WsSocket.last.emit('message', { not: 'a string' })).not.toThrow()
    expect(onAll).toHaveBeenCalledTimes(1)
  })

  it('members returns an empty list (presence is a server concern)', async () => {
    const client = RealtimeClient.create({ url: 'wss://x', WebSocket: WsSocket })
    expect(await client.members('room')).toEqual([])
  })

  it('close() tears down the socket and allows reconnecting', async () => {
    const client = RealtimeClient.create({ url: 'wss://x', WebSocket: WsSocket })
    await client.connect()
    const first = WsSocket.last
    client.close()
    expect(first.closed).toBe(true)
    expect(client.connected).toBe(false)
    client.close() // no socket: no throw
    await client.connect()
    expect(WsSocket.last).not.toBe(first)
  })

  it('falls back to the global WebSocket when none is provided', async () => {
    vi.stubGlobal('WebSocket', WsSocket)
    const client = RealtimeClient.create({ url: 'wss://x' })
    await client.connect()
    expect(client.connected).toBe(true)
  })
})

describe('RealtimeClient WebSocket resolution on Node', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.doUnmock('ws'); vi.resetModules() })

  it('lazily imports `ws` when there is no global WebSocket', async () => {
    vi.stubGlobal('WebSocket', undefined)
    vi.resetModules()
    vi.doMock('ws', () => ({ default: WsSocket }))
    const { RealtimeClient: Fresh } = await import('../src/RealtimeClient')
    const client = Fresh.create({ url: 'wss://x' })
    await client.connect()
    expect(client.connected).toBe(true)
  })

  it('throws a helpful error when no WebSocket implementation is available', async () => {
    vi.stubGlobal('WebSocket', undefined)
    vi.resetModules()
    vi.doMock('ws', () => { throw new Error('Cannot find module ws') })
    const { RealtimeClient: Fresh } = await import('../src/RealtimeClient')
    const { RealtimeError } = await import('../src/errors/RealtimeError')
    await expect(Fresh.create({ url: 'wss://x' }).connect()).rejects.toThrow(RealtimeError)
    await expect(Fresh.create({ url: 'wss://x' }).connect()).rejects.toThrow(/ws/)
  })
})
