import { AdapterEventBuilder, IBlueprint } from '@stone-js/core'
import { AwsLambdaHttpAdapterError } from '../src/errors/AwsLambdaHttpAdapterError'
import { AwsLambdaHttpAdapter } from '../src/AWSLambdaHttpAdapter'

vi.mock('@stone-js/core', async () => {
  const actual = await vi.importActual<any>('@stone-js/core')
  return {
    ...actual,
    AdapterEventBuilder: {
      create: vi.fn().mockImplementation(({ resolver }) => ({ resolver }))
    }
  }
})

vi.mock('@stone-js/http-core', async () => {
  const actual = await vi.importActual<any>('@stone-js/http-core')
  return {
    ...actual,
    IncomingHttpEvent: {
      create: vi.fn().mockImplementation((options) => ({ ...options, __event: true }))
    }
  }
})

vi.mock('../RawHttpResponseWrapper', () => {
  return {
    RawHttpResponseWrapper: {
      create: vi.fn().mockImplementation((options) => ({ ...options, __response: true }))
    }
  }
})

describe('AwsLambdaHttpAdapter', () => {
  let blueprint: IBlueprint
  let adapter: AwsLambdaHttpAdapter

  beforeEach(() => {
    blueprint = {
      get: vi.fn(),
      set: vi.fn()
    } as unknown as IBlueprint

    adapter = AwsLambdaHttpAdapter.create(blueprint)
  })

  it('should create an instance via static method', () => {
    expect(adapter).toBeInstanceOf(AwsLambdaHttpAdapter)
  })

  it('should throw in browser environment when run is called', async () => {
    // simulate browser env
    vi.stubGlobal('window', {})

    await expect(adapter.run()).rejects.toThrow(AwsLambdaHttpAdapterError)

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
