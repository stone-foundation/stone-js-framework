import { IBlueprint } from '@stone-js/core'
import { BrowserAdapter } from '../src/BrowserAdapter'
import { browserAdapterResolver } from '../src/resolvers'

const mockBlueprint = {
  get: vi.fn().mockReturnValue(() => ({}))
} as unknown as IBlueprint

describe('BrowserAdapter Resolvers', () => {
  describe('browserAdapterResolver', () => {
    it('should create a Kernel instance with the correct configuration', () => {
      const adapter = browserAdapterResolver(mockBlueprint)
      expect(adapter).toBeInstanceOf(BrowserAdapter)
    })
  })
})
