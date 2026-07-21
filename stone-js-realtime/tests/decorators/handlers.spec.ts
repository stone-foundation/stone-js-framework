import { REALTIME_HANDLER_KEY } from '../../src/constants'

vi.mock('@stone-js/key-router', () => ({
  createKeyDecorator: vi.fn((metaKey: symbol) => (key: string) => ({ metaKey, key }))
}))

describe('realtime handler decorators', () => {
  it('map each lifecycle decorator to its reserved key under REALTIME_HANDLER_KEY', async () => {
    const d = await import('../../src/decorators/handlers')
    expect(d.OnConnect()).toEqual({ metaKey: REALTIME_HANDLER_KEY, key: 'connect' })
    expect(d.OnDisconnect()).toEqual({ metaKey: REALTIME_HANDLER_KEY, key: 'disconnect' })
    expect(d.OnMessage()).toEqual({ metaKey: REALTIME_HANDLER_KEY, key: 'message' })
    expect(d.OnError()).toEqual({ metaKey: REALTIME_HANDLER_KEY, key: 'error' })
    expect(d.OnSubscribe()).toEqual({ metaKey: REALTIME_HANDLER_KEY, key: 'subscribe' })
    expect(d.OnUnsubscribe()).toEqual({ metaKey: REALTIME_HANDLER_KEY, key: 'unsubscribe' })
  })

  it('maps @OnEvent to the channel:event key', async () => {
    const d = await import('../../src/decorators/handlers')
    expect(d.OnEvent('room:1', 'message')).toEqual({ metaKey: REALTIME_HANDLER_KEY, key: 'event:room:1:message' })
  })
})
