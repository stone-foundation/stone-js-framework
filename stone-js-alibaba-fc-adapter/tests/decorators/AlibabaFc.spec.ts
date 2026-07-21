import { Mock } from 'vitest'
import { addBlueprint } from '@stone-js/core'
import { AlibabaFc, AlibabaFcOptions } from '../../src/decorators/AlibabaFc'
import { alibabaFcAdapterBlueprint } from '../../src/options/AlibabaFcAdapterBlueprint'

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

describe('AlibabaFc', () => {
  it('should call addBlueprint with correct parameters', () => {
    (addBlueprint as Mock).mockReturnValueOnce(() => {})
    const options: AlibabaFcOptions = alibabaFcAdapterBlueprint.stone.adapters?.[0] ?? {}
    AlibabaFc(options)(class {})
    expect(addBlueprint).toHaveBeenCalled()
  })

  it('should call addBlueprint with default options if none are provided', () => {
    vi.mocked(addBlueprint).mockImplementation(() => {})
    AlibabaFc()(class {})
    expect(addBlueprint).toHaveBeenCalled()
  })
})
