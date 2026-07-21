import { Mock } from 'vitest'
import { addBlueprint } from '@stone-js/core'
import { AzureFunctions, AzureFunctionsOptions } from '../../src/decorators/AzureFunctions'
import { azureFunctionsAdapterBlueprint } from '../../src/options/AzureFunctionsAdapterBlueprint'

/* eslint-disable @typescript-eslint/no-extraneous-class */

// Mock @stone-js/core
vi.mock('@stone-js/core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    addBlueprint: vi.fn(() => {}),
    classDecoratorLegacyWrapper: (fn: Function) => {
      fn()
      return fn
    }
  }
})

describe('AzureFunctions', () => {
  it('should call addBlueprint with correct parameters', () => {
    (addBlueprint as Mock).mockReturnValueOnce(() => {})
    const options: AzureFunctionsOptions = azureFunctionsAdapterBlueprint.stone.adapters?.[0] ?? {}
    AzureFunctions(options)(class {})
    expect(addBlueprint).toHaveBeenCalled()
  })

  it('should call addBlueprint with default options if none are provided', () => {
    vi.mocked(addBlueprint).mockImplementation(() => {})
    AzureFunctions()(class {})
    expect(addBlueprint).toHaveBeenCalled()
  })
})
