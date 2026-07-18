import {
  metaAdapterBlueprintMiddleware,
  SetAwsLambdaHttpResponseResolverMiddleware
} from '../../src/middleware/BlueprintMiddleware'
import { File } from '@stone-js/filesystem'
import { AWS_LAMBDA_HTTP_PLATFORM } from '../../src/constants'
import { OutgoingHttpResponse, BinaryFileResponse } from '@stone-js/http-core'

describe('SetAwsLambdaHttpResponseResolverMiddleware', () => {
  let mockBlueprint: any
  let next: any

  beforeEach(() => {
    next = vi.fn().mockResolvedValue('blueprint-updated')
    mockBlueprint = {
      get: vi.fn().mockReturnValue(AWS_LAMBDA_HTTP_PLATFORM),
      set: vi.fn()
    }
  })

  it('should set responseResolver when platform is aws-lambda-http', async () => {
    const context = { blueprint: mockBlueprint }

    const result = await SetAwsLambdaHttpResponseResolverMiddleware(context as any, next)

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

  it('should not set resolver if platform is not aws-lambda-http', async () => {
    mockBlueprint.get = vi.fn().mockReturnValue('other-platform')

    const context = { blueprint: mockBlueprint }

    const result = await SetAwsLambdaHttpResponseResolverMiddleware(context as any, next)

    expect(result).toBe('blueprint-updated')
    expect(mockBlueprint.set).not.toHaveBeenCalled()
  })
})

describe('metaAdapterBlueprintMiddleware', () => {
  it('should export correct middleware list', () => {
    expect(metaAdapterBlueprintMiddleware).toEqual([
      { module: SetAwsLambdaHttpResponseResolverMiddleware, priority: 6 }
    ])
  })
})
