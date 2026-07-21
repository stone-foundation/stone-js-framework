import { ON_BUS_EVENT_KEY } from '../src/decorators/OnBusEvent'

vi.mock('@stone-js/router', () => ({
  createKeyDecorator: vi.fn((metaKey: symbol) => (key: string) => ({ metaKey, key }))
}))

describe('OnBusEvent', () => {
  it('maps an event name to a key under ON_BUS_EVENT_KEY', async () => {
    const { OnBusEvent } = await import('../src/decorators/OnBusEvent')
    expect(OnBusEvent('order.shipped')).toEqual({ metaKey: ON_BUS_EVENT_KEY, key: 'order.shipped' })
  })
})
