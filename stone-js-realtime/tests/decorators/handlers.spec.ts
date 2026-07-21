import { KEY_ROUTING_KEY } from '@stone-js/router'

vi.mock('@stone-js/router', () => ({
  KEY_ROUTING_KEY: Symbol.for('stone.keyRouting.onKey'),
  createKeyDecorator: vi.fn((metaKey: symbol) => (key: string) => ({ metaKey, key }))
}))

describe('realtime handler decorators (light key-router)', () => {
  it('map each lifecycle decorator to its reserved key under KEY_ROUTING_KEY', async () => {
    const d = await import('../../src/decorators/handlers')
    expect(d.OnConnect()).toEqual({ metaKey: KEY_ROUTING_KEY, key: 'connect' })
    expect(d.OnDisconnect()).toEqual({ metaKey: KEY_ROUTING_KEY, key: 'disconnect' })
    expect(d.OnMessage()).toEqual({ metaKey: KEY_ROUTING_KEY, key: 'message' })
    expect(d.OnError()).toEqual({ metaKey: KEY_ROUTING_KEY, key: 'error' })
    expect(d.OnSubscribe()).toEqual({ metaKey: KEY_ROUTING_KEY, key: 'subscribe' })
    expect(d.OnUnsubscribe()).toEqual({ metaKey: KEY_ROUTING_KEY, key: 'unsubscribe' })
  })

  it('maps @OnEvent to the channel:event key', async () => {
    const d = await import('../../src/decorators/handlers')
    expect(d.OnEvent('room:1', 'message')).toEqual({ metaKey: KEY_ROUTING_KEY, key: 'event:room:1:message' })
  })
})
