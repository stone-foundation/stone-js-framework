import { BrowserAdapter } from '../src/BrowserAdapter'
import { IncomingBrowserEvent } from '@stone-js/browser-core'
import { RawResponseWrapper } from '../src/RawResponseWrapper'
import { AdapterEventBuilder, IBlueprint } from '@stone-js/core'
import { BrowserAdapterError } from '../src/errors/BrowserAdapterError'

vi.mock('@stone-js/core', async () => {
  const actual = await vi.importActual<any>('@stone-js/core')
  return {
    ...actual,
    AdapterEventBuilder: {
      create: vi.fn().mockImplementation(({ resolver }) => ({ resolver }))
    }
  }
})

vi.mock('../src/RawResponseWrapper', () => ({
  RawResponseWrapper: {
    create: vi.fn().mockImplementation((options) => ({ ...options, __response: true }))
  }
}))

describe('BrowserAdapter', () => {
  let blueprint: IBlueprint
  let adapter: BrowserAdapter

  beforeEach(() => {
    blueprint = {
      get: vi.fn(),
      set: vi.fn()
    } as unknown as IBlueprint

    adapter = BrowserAdapter.create(blueprint)
  })

  it('should create an instance with correct https configuration', () => {
    expect(adapter).toBeInstanceOf(BrowserAdapter)
  })

  it('should throw error when used outside the Browser context', async () => {
    // @ts-expect-error - Simulate browser context
    global.window = undefined

    await expect(adapter.run()).rejects.toThrow(BrowserAdapterError)
  })

  it('should call the appropriate event listener on request', async () => {
    global.window = {} as any // Simulate browser context

    const executeHooks = vi.spyOn(adapter as any, 'executeHooks').mockResolvedValue(undefined)

    vi.spyOn(adapter as any, 'resolveEventHandler').mockReturnValue(vi.fn())
    vi.spyOn(adapter as any, 'executeEventHandlerHooks').mockResolvedValue(undefined)

    RawResponseWrapper.create = vi.fn()
    IncomingBrowserEvent.create = vi.fn()
    AdapterEventBuilder.create = vi.fn((options) => options.resolver({}))

    blueprint.get = vi.fn(() => ['@stonejs/router.navigate'])

    /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
    window.addEventListener = vi.fn(async (_eventName, listener) => {
      await listener(new Event('@stonejs/router.navigate'))
    })

    // @ts-expect-error
    adapter.sendEventThroughDestination = vi.fn()

    const rawResponse = await adapter.run()

    expect(rawResponse).toBeUndefined()
    expect(window.addEventListener).toHaveBeenCalled()
    expect(AdapterEventBuilder.create).toHaveBeenCalled()
    expect(RawResponseWrapper.create).toHaveBeenCalledWith(expect.anything())
    expect(blueprint.get).toHaveBeenCalledWith('stone.adapter.events', expect.any(Array))
    // @ts-expect-error
    expect(adapter.sendEventThroughDestination).toHaveBeenCalled()
    expect(executeHooks).toHaveBeenCalledWith('onStart')
  })

  it('stop() aborts listeners and runs onStop hooks', async () => {
    global.window = {} as any
    const executeHooks = vi.spyOn(adapter as any, 'executeHooks').mockResolvedValue(undefined)
    vi.spyOn(adapter as any, 'resolveEventHandler').mockReturnValue(vi.fn())
    vi.spyOn(adapter as any, 'executeEventHandlerHooks').mockResolvedValue(undefined)
    vi.spyOn(adapter as any, 'eventListener').mockResolvedValue(undefined)
    blueprint.get = vi.fn(() => [])
    window.addEventListener = vi.fn()

    await adapter.run()
    await adapter.stop()

    expect(executeHooks).toHaveBeenCalledWith('onStop')
  })

  it('stop() is safe to call when never started', async () => {
    await expect(adapter.stop()).resolves.toBeUndefined()
  })

  it('run() is idempotent — a second run tears down the first', async () => {
    global.window = {} as any
    const executeHooks = vi.spyOn(adapter as any, 'executeHooks').mockResolvedValue(undefined)
    vi.spyOn(adapter as any, 'resolveEventHandler').mockReturnValue(vi.fn())
    vi.spyOn(adapter as any, 'executeEventHandlerHooks').mockResolvedValue(undefined)
    vi.spyOn(adapter as any, 'eventListener').mockResolvedValue(undefined)
    blueprint.get = vi.fn(() => ['popstate'])
    const addEventListener = vi.fn()
    window.addEventListener = addEventListener

    await adapter.run()
    await adapter.run()

    // onStop ran between the two runs (previous listeners torn down)...
    expect(executeHooks).toHaveBeenCalledWith('onStop')
    // ...and each run registers the listener with an abort signal (no accumulation within a run).
    expect(addEventListener).toHaveBeenCalledWith('popstate', expect.any(Function), expect.objectContaining({ signal: expect.anything() }))
  })

  it('should handle errors and build raw response', async () => {
    const error = new Error('boom')
    const mockBuilder = vi.fn().mockResolvedValue({ statusCode: 500 })

    vi.spyOn(adapter as any, 'resolveEventHandler').mockImplementation(() => {
      throw error
    })
    vi.spyOn(adapter as any, 'handleError').mockResolvedValue(mockBuilder)
    vi.spyOn(adapter as any, 'buildRawResponse').mockResolvedValue({ statusCode: 500 })

    const response = await (adapter as any).eventListener({ test: true }, {})

    expect(response).toEqual({ statusCode: 500 })
  })
})
