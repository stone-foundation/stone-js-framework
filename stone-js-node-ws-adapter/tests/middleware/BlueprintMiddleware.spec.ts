import { OutgoingResponse } from '@stone-js/core'
import { NODE_WS_PLATFORM } from '../../src/constants'
import {
  metaAdapterBlueprintMiddleware,
  SetNodeWsResponseResolverMiddleware
} from '../../src/middleware/BlueprintMiddleware'

describe('SetNodeWsResponseResolverMiddleware', () => {
  let mockBlueprint: any
  let next: any

  beforeEach(() => {
    next = vi.fn().mockResolvedValue('blueprint-updated')
    mockBlueprint = { get: vi.fn().mockReturnValue(NODE_WS_PLATFORM), set: vi.fn() }
  })

  it('sets the response resolver when the platform is node_ws', async () => {
    const result = await SetNodeWsResponseResolverMiddleware({ blueprint: mockBlueprint } as any, next)
    expect(result).toBe('blueprint-updated')
    expect(mockBlueprint.set).toHaveBeenCalledWith('stone.kernel.responseResolver', expect.any(Function))
    const resolver = mockBlueprint.set.mock.calls[0][1]
    expect(resolver({ content: 'hi', statusCode: 200 })).toBeInstanceOf(OutgoingResponse)
  })

  it('does nothing for a different platform', async () => {
    mockBlueprint.get = vi.fn().mockReturnValue('other')
    const result = await SetNodeWsResponseResolverMiddleware({ blueprint: mockBlueprint } as any, next)
    expect(result).toBe('blueprint-updated')
    expect(mockBlueprint.set).not.toHaveBeenCalled()
  })
})

describe('metaAdapterBlueprintMiddleware', () => {
  it('exports the ordered middleware list', () => {
    expect(metaAdapterBlueprintMiddleware).toEqual([
      { module: SetNodeWsResponseResolverMiddleware, priority: 6 }
    ])
  })
})
