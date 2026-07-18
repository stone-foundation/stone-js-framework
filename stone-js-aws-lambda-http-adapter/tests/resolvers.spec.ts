import { IBlueprint } from '@stone-js/core'
import { awsLambdaHttpAdapterResolver } from '../src/resolvers'
import { AwsLambdaHttpAdapter } from '../src/AWSLambdaHttpAdapter'

const mockBlueprint = {
  get: vi.fn().mockReturnValue(() => ({}))
} as unknown as IBlueprint

describe('AwsLambdaAdapter Resolvers', () => {
  describe('awsLambdaHttpAdapterResolver', () => {
    it('should create a Kernel instance with the correct configuration', () => {
      const adapter = awsLambdaHttpAdapterResolver(mockBlueprint)
      expect(adapter).toBeInstanceOf(AwsLambdaHttpAdapter)
    })
  })
})
