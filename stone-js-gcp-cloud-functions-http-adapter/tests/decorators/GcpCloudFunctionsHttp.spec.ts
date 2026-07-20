import { GcpCloudFunctionsHttp, GcpCloudFunctionsHttpOptions } from '../../src/decorators/GcpCloudFunctionsHttp'
import { addBlueprint, classDecoratorLegacyWrapper } from '@stone-js/core'
import { gcpCloudFunctionsHttpAdapterBlueprint } from '../../src/options/GcpCloudFunctionsHttpAdapterBlueprint'

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

describe('GcpCloudFunctionsHttp', () => {
  it('should call addBlueprint with correct parameters', () => {
    vi.mocked(addBlueprint).mockImplementation(() => {})
    const options: GcpCloudFunctionsHttpOptions = gcpCloudFunctionsHttpAdapterBlueprint.stone.adapters[0]
    GcpCloudFunctionsHttp(options)(class {})
    expect(addBlueprint).toHaveBeenCalled()
    expect(classDecoratorLegacyWrapper).toHaveBeenCalledTimes(1)
  })

  it('should call addBlueprint with default options if none are provided', () => {
    vi.mocked(addBlueprint).mockImplementation(() => {})
    GcpCloudFunctionsHttp()(class {})
    expect(addBlueprint).toHaveBeenCalled()
  })
})
