import { GcpCloudFunctionsHttpAdapter } from '../src/GcpCloudFunctionsHttpAdapter'
import { gcpCloudFunctionsHttpAdapterResolver } from '../src/resolvers'

const blueprint: any = {
  values: {},
  set: vi.fn((key, value) => {
    blueprint.values[key] = value
  }),
  get: vi.fn((key, fallback) => blueprint.values[key] ?? fallback),
  has: vi.fn((key) => key in blueprint.values),
  getAll: vi.fn(() => blueprint.values)
}

describe('GcpCloudFunctionsHttpAdapter Resolvers', () => {
  describe('gcpCloudFunctionsHttpAdapterResolver', () => {
    it('should create a Kernel instance with the correct configuration', () => {
      const adapter = gcpCloudFunctionsHttpAdapterResolver(blueprint)
      expect(adapter).toBeInstanceOf(GcpCloudFunctionsHttpAdapter)
    })
  })
})
