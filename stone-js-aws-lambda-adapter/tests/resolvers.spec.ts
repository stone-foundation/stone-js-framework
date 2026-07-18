import { IBlueprint } from '@stone-js/core'
import { AwsLambdaAdapter } from '../src/AWSLambdaAdapter'
import { awsLambdaAdapterResolver } from '../src/resolvers'

const mockBlueprint = {
  get: vi.fn().mockReturnValue(() => ({}))
} as unknown as IBlueprint

describe('AwsLambdaAdapter Resolvers', () => {
  describe('awsLambdaAdapterResolver', () => {
    it('should create a Kernel instance with the correct configuration', () => {
      const adapter = awsLambdaAdapterResolver(mockBlueprint)
      expect(adapter).toBeInstanceOf(AwsLambdaAdapter)
    })
  })
})
