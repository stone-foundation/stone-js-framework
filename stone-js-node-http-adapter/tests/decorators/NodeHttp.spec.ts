import { NodeHttp, NodeHttpOptions } from '../../src/decorators/NodeHttp'
import { addBlueprint, classDecoratorLegacyWrapper } from '@stone-js/core'
import { NodeHttp as BrowserNodeHttp } from '../../src/browser/decorators/NodeHttp'
import { nodeHttpAdapterBlueprint } from '../../src/options/NodeHttpAdapterBlueprint'
import { nodeHttpAdapterBlueprint as browserNodeHttpAdapterBlueprint } from '../../src/browser/options/NodeHttpAdapterBlueprint'

/* eslint-disable @typescript-eslint/no-extraneous-class */

// Mock setClassMetadata
vi.mock('@stone-js/core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    addBlueprint: vi.fn(() => {}),
    classDecoratorLegacyWrapper: vi.fn((fn: Function) => {
      fn()
      return fn
    })
  }
})

describe('NodeHttp', () => {
  it('should call addBlueprint with correct parameters', () => {
    vi.mocked(addBlueprint).mockImplementation(() => {})
    const options: NodeHttpOptions = nodeHttpAdapterBlueprint.stone.adapters[0]
    NodeHttp(options)(class {})
    BrowserNodeHttp()(class {})
    expect(addBlueprint).toHaveBeenCalled()
    expect(classDecoratorLegacyWrapper).toHaveBeenCalledTimes(2)
    expect(addBlueprint).not.toHaveBeenCalledWith(expect.any(Function), expect.any(Object), browserNodeHttpAdapterBlueprint)
  })

  it('should call addBlueprint with default options if none are provided', () => {
    vi.mocked(addBlueprint).mockImplementation(() => {})
    NodeHttp()(class {})
    expect(addBlueprint).toHaveBeenCalled()
  })
})
