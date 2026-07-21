import {
  metaAdapterBlueprintMiddleware,
  SetAzureFunctionsResponseResolverMiddleware
} from '../../src/middleware/BlueprintMiddleware'
import { OutgoingResponse } from '@stone-js/core'
import { AZURE_FUNCTIONS_PLATFORM } from '../../src/constants'

describe('SetAzureFunctionsResponseResolverMiddleware', () => {
  let mockBlueprint: any
  let next: any

  beforeEach(() => {
    next = vi.fn().mockResolvedValue('blueprint-updated')
    mockBlueprint = {
      get: vi.fn().mockReturnValue(AZURE_FUNCTIONS_PLATFORM),
      set: vi.fn()
    }
  })

  it('should set responseResolver when platform is aws-lambda', async () => {
    const context = { blueprint: mockBlueprint }

    const result = await SetAzureFunctionsResponseResolverMiddleware(context as any, next)

    expect(result).toBe('blueprint-updated')
    expect(mockBlueprint.set).toHaveBeenCalledWith(
      'stone.kernel.responseResolver',
      expect.any(Function)
    )

    // Test resolver behavior
    const resolver = mockBlueprint.set.mock.calls[0][1]

    const response2 = resolver({ content: 'hello', statusCode: 200 })
    expect(response2).toBeInstanceOf(OutgoingResponse)
  })

  it('should not set resolver if platform is not aws-lambda', async () => {
    mockBlueprint.get = vi.fn().mockReturnValue('other-platform')

    const context = { blueprint: mockBlueprint }

    const result = await SetAzureFunctionsResponseResolverMiddleware(context as any, next)

    expect(result).toBe('blueprint-updated')
    expect(mockBlueprint.set).not.toHaveBeenCalled()
  })
})

describe('metaAdapterBlueprintMiddleware', () => {
  it('should export correct middleware list', () => {
    expect(metaAdapterBlueprintMiddleware).toEqual([
      { module: SetAzureFunctionsResponseResolverMiddleware, priority: 6 }
    ])
  })
})
