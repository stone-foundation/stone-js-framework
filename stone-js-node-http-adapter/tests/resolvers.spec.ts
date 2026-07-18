import { NodeHttpAdapter } from '../src/NodeHttpAdapter'
import { nodeHttpAdapterResolver } from '../src/resolvers'

const blueprint: any = {
  values: {},
  set: vi.fn((key, value) => {
    blueprint.values[key] = value
  }),
  get: vi.fn((key, fallback) => blueprint.values[key] ?? fallback),
  has: vi.fn((key) => key in blueprint.values),
  getAll: vi.fn(() => blueprint.values)
}

describe('NodeHttpAdapter Resolvers', () => {
  describe('nodeHttpAdapterResolver', () => {
    it('should create a Kernel instance with the correct configuration', () => {
      const adapter = nodeHttpAdapterResolver(blueprint)
      expect(adapter).toBeInstanceOf(NodeHttpAdapter)
    })
  })
})
