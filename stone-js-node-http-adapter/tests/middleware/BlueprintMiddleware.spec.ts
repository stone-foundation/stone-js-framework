import {
  metaAdapterBlueprintMiddleware,
  SetNodeHttpDefaultAdapterMiddleware,
  SetNodeHttpResponseResolverMiddleware
} from '../../src/middleware/BlueprintMiddleware'
import { File } from '@stone-js/filesystem'
import { NODE_HTTP_PLATFORM } from '../../src/constants'
import { OutgoingHttpResponse, BinaryFileResponse } from '@stone-js/http-core'

describe('SetNodeHttpDefaultAdapterMiddleware', () => {
  let mockBlueprint: any
  let next: any

  beforeEach(() => {
    next = vi.fn().mockResolvedValue('blueprint-done')
    mockBlueprint = {
      get: vi.fn().mockReturnValue([
        { platform: 'node-http' },
        { platform: 'other' }
      ])
    }
  })

  it('should set default adapter if none exists', async () => {
    const adapters = [
      { platform: NODE_HTTP_PLATFORM },
      { platform: 'lambda' }
    ]
    mockBlueprint.get = vi.fn().mockImplementation((key: string) => {
      if (key === 'stone.adapters') {
        return adapters
      }
    })

    const context = { blueprint: mockBlueprint }
    const result = await SetNodeHttpDefaultAdapterMiddleware(context as any, next)

    expect(result).toBe('blueprint-done')
    expect(mockBlueprint.get).toHaveBeenCalledWith('stone.adapters', [])
    expect(context.blueprint.get('stone.adapters')[0].default).toBe(true)
  })

  it('should not overwrite existing default adapter', async () => {
    const adapters = [
      { platform: NODE_HTTP_PLATFORM, default: true },
      { platform: 'lambda' }
    ]

    mockBlueprint.get = vi.fn().mockReturnValue(adapters)

    const context = { blueprint: mockBlueprint }
    const result = await SetNodeHttpDefaultAdapterMiddleware(context as any, next)

    expect(result).toBe('blueprint-done')
    expect(context.blueprint.get('stone.adapters')[0].default).toBe(true)
    expect(context.blueprint.get('stone.adapters')[1].default).toBeUndefined()
  })
})

describe('SetNodeHttpResponseResolverMiddleware', () => {
  let mockBlueprint: any
  let next: any

  beforeEach(() => {
    next = vi.fn().mockResolvedValue('blueprint-updated')
    mockBlueprint = {
      get: vi.fn().mockReturnValue(NODE_HTTP_PLATFORM),
      set: vi.fn()
    }
  })

  it('should set responseResolver when platform is node-http', async () => {
    const context = { blueprint: mockBlueprint }

    const result = await SetNodeHttpResponseResolverMiddleware(context as any, next)

    expect(result).toBe('blueprint-updated')
    expect(mockBlueprint.set).toHaveBeenCalledWith(
      'stone.kernel.responseResolver',
      expect.any(Function)
    )

    // Test resolver behavior
    const resolver = mockBlueprint.set.mock.calls[0][1]

    const file = File.create('/path/to/file.txt', false)
    file.isReadable = vi.fn().mockReturnValue(true)
    const response1 = resolver({ content: file })
    expect(response1).toBeInstanceOf(BinaryFileResponse)

    const response2 = resolver({ content: 'hello', statusCode: 200 })
    expect(response2).toBeInstanceOf(OutgoingHttpResponse)
  })

  it('should not set resolver if platform is not node-http', async () => {
    mockBlueprint.get = vi.fn().mockReturnValue('other-platform')

    const context = { blueprint: mockBlueprint }

    const result = await SetNodeHttpResponseResolverMiddleware(context as any, next)

    expect(result).toBe('blueprint-updated')
    expect(mockBlueprint.set).not.toHaveBeenCalled()
  })
})

describe('metaAdapterBlueprintMiddleware', () => {
  it('should export correct middleware list', () => {
    expect(metaAdapterBlueprintMiddleware).toEqual([
      { module: SetNodeHttpDefaultAdapterMiddleware, priority: 0 },
      { module: SetNodeHttpResponseResolverMiddleware, priority: 6 }
    ])
  })
})
