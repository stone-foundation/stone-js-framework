import { IBlueprint } from '@stone-js/core'
import { AzureFunctionsAdapter } from '../src/AzureFunctionsAdapter'
import { azureFunctionsAdapterResolver } from '../src/resolvers'

const mockBlueprint = {
  get: vi.fn().mockReturnValue(() => ({}))
} as unknown as IBlueprint

describe('AzureFunctionsAdapter Resolvers', () => {
  describe('azureFunctionsAdapterResolver', () => {
    it('should create a Kernel instance with the correct configuration', () => {
      const adapter = azureFunctionsAdapterResolver(mockBlueprint)
      expect(adapter).toBeInstanceOf(AzureFunctionsAdapter)
    })
  })
})
