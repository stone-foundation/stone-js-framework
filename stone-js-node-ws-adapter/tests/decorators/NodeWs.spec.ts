import { Mock } from 'vitest'
import { addBlueprint } from '@stone-js/core'
import { NodeWs, NodeWsOptions } from '../../src/decorators/NodeWs'
import { nodeWsAdapterBlueprint } from '../../src/options/NodeWsAdapterBlueprint'

/* eslint-disable @typescript-eslint/no-extraneous-class */

vi.mock('@stone-js/core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    addBlueprint: vi.fn(() => {}),
    classDecoratorLegacyWrapper: (fn: Function) => { fn(); return fn }
  }
})

describe('NodeWs', () => {
  it('applies the blueprint with the provided options', () => {
    (addBlueprint as Mock).mockReturnValueOnce(() => {})
    const options: NodeWsOptions = nodeWsAdapterBlueprint.stone.adapters?.[0] ?? {}
    NodeWs(options)(class {})
    expect(addBlueprint).toHaveBeenCalled()
  })

  it('applies the default blueprint when no options are given', () => {
    vi.mocked(addBlueprint).mockImplementation(() => {})
    NodeWs()(class {})
    expect(addBlueprint).toHaveBeenCalled()
  })
})
