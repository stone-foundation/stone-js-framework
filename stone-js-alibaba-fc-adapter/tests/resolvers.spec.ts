import { IBlueprint } from '@stone-js/core'
import { AlibabaFcAdapter } from '../src/AlibabaFcAdapter'
import { alibabaFcAdapterResolver } from '../src/resolvers'

const mockBlueprint = {
  get: vi.fn().mockReturnValue(() => ({}))
} as unknown as IBlueprint

describe('AlibabaFcAdapter Resolvers', () => {
  describe('alibabaFcAdapterResolver', () => {
    it('should create a Kernel instance with the correct configuration', () => {
      const adapter = alibabaFcAdapterResolver(mockBlueprint)
      expect(adapter).toBeInstanceOf(AlibabaFcAdapter)
    })
  })
})
