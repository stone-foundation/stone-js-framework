import { GcpCloudFunctionsAdapter } from '../src/GcpCloudFunctionsAdapter'
import { AdapterEventBuilder, IBlueprint } from '@stone-js/core'
import { GcpCloudFunctionsAdapterError } from '../src/errors/GcpCloudFunctionsAdapterError'

vi.mock('@stone-js/core', async () => {
  const actual = await vi.importActual<any>('@stone-js/core')
  return {
    ...actual,
    AdapterEventBuilder: {
      create: vi.fn().mockImplementation(({ resolver }) => ({ resolver }))
    }
  }
})

vi.mock('../RawResponseWrapper', () => {
  return {
    RawResponseWrapper: {
      create: vi.fn().mockImplementation((options) => ({ ...options, __response: true }))
    }
  }
})

describe('GcpCloudFunctionsAdapter', () => {
  let blueprint: IBlueprint
  let adapter: GcpCloudFunctionsAdapter

  beforeEach(() => {
    blueprint = {
      get: vi.fn(),
      set: vi.fn()
    } as unknown as IBlueprint

    adapter = GcpCloudFunctionsAdapter.create(blueprint)
  })

  it('should create an instance via static method', () => {
    expect(adapter).toBeInstanceOf(GcpCloudFunctionsAdapter)
  })

  it('should throw in browser environment when run is called', async () => {
    // simulate browser env
    vi.stubGlobal('window', {})

    await expect(adapter.run()).rejects.toThrow(GcpCloudFunctionsAdapterError)

    // cleanup
    vi.unstubAllGlobals()
  })

  it('should process lambda event and return a raw response', async () => {
    AdapterEventBuilder.create = vi.fn(({ resolver }) => resolver({}))
    const executeHooks = vi.spyOn(adapter as any, 'executeHooks').mockResolvedValue(undefined)

    vi.spyOn(adapter as any, 'resolveEventHandler').mockReturnValue(vi.fn())
    vi.spyOn(adapter as any, 'sendEventThroughDestination').mockResolvedValue({ statusCode: 200 })
    vi.spyOn(adapter as any, 'executeEventHandlerHooks').mockResolvedValue(undefined)

    const handler = await adapter.run()

    expect(executeHooks).toHaveBeenCalledWith('onStart')
    expect(await handler({} as any, {})).toEqual({ statusCode: 200 })
  })

  it('handles a CloudEvent invoked with no execution context (functions.cloudEvent)', async () => {
    AdapterEventBuilder.create = vi.fn(({ resolver }) => resolver({}))
    vi.spyOn(adapter as any, 'executeHooks').mockResolvedValue(undefined)
    vi.spyOn(adapter as any, 'resolveEventHandler').mockReturnValue(vi.fn())
    vi.spyOn(adapter as any, 'sendEventThroughDestination').mockResolvedValue({ ok: true })
    vi.spyOn(adapter as any, 'executeEventHandlerHooks').mockResolvedValue(undefined)

    const handler = await adapter.run<(e: any, c?: any) => Promise<any>>()

    // The Functions Framework calls a CloudEvent handler with a single argument (no context).
    expect(await handler({ type: 'google.cloud.pubsub.topic.v1.messagePublished' })).toEqual({ ok: true })
  })

  it('should rethrow errors by default so event-driven triggers (Pub/Sub, Eventarc, …) retry', async () => {
    const error = new Error('boom')

    vi.spyOn(adapter as any, 'resolveEventHandler').mockImplementation(() => { throw error })
    vi.spyOn(adapter as any, 'handleError').mockResolvedValue(vi.fn())
    vi.spyOn(adapter as any, 'buildRawResponse').mockResolvedValue({ statusCode: 500 })
    // blueprint.get('stone.adapter.rethrowOnError', true) → default true
    ;(adapter as any).blueprint = { get: vi.fn((_k: string, d: any) => d) }

    await expect((adapter as any).eventListener({ test: true }, {})).rejects.toThrow('boom')
  })

  it('should return the built response instead of rethrowing when rethrowOnError is false', async () => {
    const error = new Error('boom')

    vi.spyOn(adapter as any, 'resolveEventHandler').mockImplementation(() => { throw error })
    vi.spyOn(adapter as any, 'handleError').mockResolvedValue(vi.fn())
    vi.spyOn(adapter as any, 'buildRawResponse').mockResolvedValue({ statusCode: 500 })
    ;(adapter as any).blueprint = { get: vi.fn(() => false) }

    const response = await (adapter as any).eventListener({ test: true }, {})

    expect(response).toEqual({ statusCode: 500 })
  })
})
