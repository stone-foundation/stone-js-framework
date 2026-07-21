import { IBlueprint } from '@stone-js/core'
import { TencentScfAdapter } from '../src/TencentScfAdapter'
import { tencentScfAdapterResolver } from '../src/resolvers'

const mockBlueprint = {
  get: vi.fn().mockReturnValue(() => ({}))
} as unknown as IBlueprint

describe('TencentScfAdapter Resolvers', () => {
  describe('tencentScfAdapterResolver', () => {
    it('should create a Kernel instance with the correct configuration', () => {
      const adapter = tencentScfAdapterResolver(mockBlueprint)
      expect(adapter).toBeInstanceOf(TencentScfAdapter)
    })
  })
})
