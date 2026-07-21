import { IBlueprint } from '@stone-js/core'
import { NodeWsAdapter } from '../src/NodeWsAdapter'
import { nodeWsAdapterResolver } from '../src/resolvers'

const mockBlueprint = {
  get: vi.fn((_k: string, d: any) => d)
} as unknown as IBlueprint

describe('nodeWsAdapterResolver', () => {
  it('creates a NodeWsAdapter instance', () => {
    expect(nodeWsAdapterResolver(mockBlueprint)).toBeInstanceOf(NodeWsAdapter)
  })
})
