import { IBlueprint } from '@stone-js/core'
import { GcpCloudFunctionsAdapter } from '../src/GcpCloudFunctionsAdapter'
import { gcpCloudFunctionsAdapterResolver } from '../src/resolvers'

const mockBlueprint = {
  get: vi.fn().mockReturnValue(() => ({}))
} as unknown as IBlueprint

describe('GcpCloudFunctionsAdapter Resolvers', () => {
  describe('gcpCloudFunctionsAdapterResolver', () => {
    it('should create a Kernel instance with the correct configuration', () => {
      const adapter = gcpCloudFunctionsAdapterResolver(mockBlueprint)
      expect(adapter).toBeInstanceOf(GcpCloudFunctionsAdapter)
    })
  })
})
