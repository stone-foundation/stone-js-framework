import { Mock } from 'vitest'
import { addBlueprint } from '@stone-js/core'
import { TencentScf, TencentScfOptions } from '../../src/decorators/TencentScf'
import { tencentScfAdapterBlueprint } from '../../src/options/TencentScfAdapterBlueprint'

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

describe('TencentScf', () => {
  it('should call addBlueprint with correct parameters', () => {
    (addBlueprint as Mock).mockReturnValueOnce(() => {})
    const options: TencentScfOptions = tencentScfAdapterBlueprint.stone.adapters?.[0] ?? {}
    TencentScf(options)(class {})
    expect(addBlueprint).toHaveBeenCalled()
  })

  it('should call addBlueprint with default options if none are provided', () => {
    vi.mocked(addBlueprint).mockImplementation(() => {})
    TencentScf()(class {})
    expect(addBlueprint).toHaveBeenCalled()
  })
})
