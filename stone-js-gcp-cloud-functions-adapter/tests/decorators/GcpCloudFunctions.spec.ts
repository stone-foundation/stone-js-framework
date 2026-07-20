import { Mock } from 'vitest'
import { addBlueprint } from '@stone-js/core'
import { GcpCloudFunctions, GcpCloudFunctionsOptions } from '../../src/decorators/GcpCloudFunctions'
import { gcpCloudFunctionsAdapterBlueprint } from '../../src/options/GcpCloudFunctionsAdapterBlueprint'

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

describe('GcpCloudFunctions', () => {
  it('should call addBlueprint with correct parameters', () => {
    (addBlueprint as Mock).mockReturnValueOnce(() => {})
    const options: GcpCloudFunctionsOptions = gcpCloudFunctionsAdapterBlueprint.stone.adapters?.[0] ?? {}
    GcpCloudFunctions(options)(class {})
    expect(addBlueprint).toHaveBeenCalled()
  })

  it('should call addBlueprint with default options if none are provided', () => {
    vi.mocked(addBlueprint).mockImplementation(() => {})
    GcpCloudFunctions()(class {})
    expect(addBlueprint).toHaveBeenCalled()
  })
})
