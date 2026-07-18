import { IBlueprint } from '@stone-js/core'
import { NodeCliAdapter } from '../src/NodeCliAdapter'
import { nodeCliAdapterResolver } from '../src/resolvers'

const mockBlueprint = {
  get: vi.fn().mockReturnValue(() => ({}))
} as unknown as IBlueprint

describe('NodeCliAdapter Resolvers', () => {
  describe('nodeCliAdapterResolver', () => {
    it('should create an adapter instance with the correct configuration', () => {
      const adapter = nodeCliAdapterResolver(mockBlueprint)
      expect(adapter).toBeInstanceOf(NodeCliAdapter)
    })
  })
})
