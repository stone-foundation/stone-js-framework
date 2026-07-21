import { addBlueprint, classDecoratorLegacyWrapper } from '@stone-js/core'
import { TencentScfHttp, TencentScfHttpOptions } from '../../src/decorators/TencentScfHttp'
import { tencentScfHttpAdapterBlueprint } from '../../src/options/TencentScfHttpAdapterBlueprint'

/* eslint-disable @typescript-eslint/no-extraneous-class */

// Mock @stone-js/core
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

describe('TencentScfHttp', () => {
  it('should call addBlueprint with correct parameters', () => {
    vi.mocked(addBlueprint).mockImplementation(() => {})
    const options: TencentScfHttpOptions = tencentScfHttpAdapterBlueprint.stone.adapters?.[0] ?? {}
    TencentScfHttp(options)(class {})
    expect(addBlueprint).toHaveBeenCalled()
    expect(classDecoratorLegacyWrapper).toHaveBeenCalledTimes(1)
  })

  it('should call addBlueprint with default options if none are provided', () => {
    vi.mocked(addBlueprint).mockImplementation(() => {})
    TencentScfHttp()(class {})
    expect(addBlueprint).toHaveBeenCalled()
  })
})
