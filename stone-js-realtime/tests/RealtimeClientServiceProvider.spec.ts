import { RealtimeClient } from '../src/RealtimeClient'
import { RealtimeError } from '../src/errors/RealtimeError'
import { RealtimeClientServiceProvider } from '../src/RealtimeClientServiceProvider'

const makeContainer = (config: any): any => {
  const container: any = {
    make: vi.fn(() => ({ get: () => config })),
    instanceIf: vi.fn(() => container),
    alias: vi.fn(() => container),
    singletonIf: vi.fn(() => container)
  }
  return container
}

describe('RealtimeClientServiceProvider', () => {
  it('binds a RealtimeClient as `realtime` from stone.realtime.url', () => {
    const container = makeContainer({ url: 'wss://x' })
    new RealtimeClientServiceProvider(container).register()

    expect(container.instanceIf).toHaveBeenCalledWith(RealtimeClient, expect.any(RealtimeClient))
    expect(container.alias).toHaveBeenCalledWith(RealtimeClient, ['realtimeClient'])
    const factory = container.singletonIf.mock.calls.find((c: any[]) => c[0] === 'realtime')[1]
    expect(factory()).toBeInstanceOf(RealtimeClient)
  })

  it('throws when no url is configured', () => {
    expect(() => new RealtimeClientServiceProvider(makeContainer({})).register()).toThrow(RealtimeError)
  })
})
