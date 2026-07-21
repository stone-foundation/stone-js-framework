import { IBlueprint } from '@stone-js/core'
import { tencentScfHttpAdapterResolver } from '../src/resolvers'
import { TencentScfHttpAdapter } from '../src/TencentScfHttpAdapter'

const mockBlueprint = {
  get: vi.fn().mockReturnValue(() => ({}))
} as unknown as IBlueprint

describe('TencentScfHttpAdapter Resolvers', () => {
  describe('tencentScfHttpAdapterResolver', () => {
    it('should create a Kernel instance with the correct configuration', () => {
      const adapter = tencentScfHttpAdapterResolver(mockBlueprint)
      expect(adapter).toBeInstanceOf(TencentScfHttpAdapter)
    })
  })
})
