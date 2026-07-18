import { Mock } from 'vitest'
import { addBlueprint } from '@stone-js/core'
import { Browser, BrowserOptions } from '../../src/decorators/Browser'
import { browserAdapterBlueprint } from '../../src/options/BrowserAdapterBlueprint'

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

describe('Browser', () => {
  it('should call addBlueprint with correct parameters', () => {
    (addBlueprint as Mock).mockReturnValueOnce(() => {})
    const options: BrowserOptions = browserAdapterBlueprint.stone.adapters?.[0] ?? {}
    Browser(options)(class {})
    expect(addBlueprint).toHaveBeenCalled()
  })

  it('should call addBlueprint with default options if none are provided', () => {
    vi.mocked(addBlueprint).mockImplementation(() => {})
    Browser()(class {})
    expect(addBlueprint).toHaveBeenCalled()
  })
})
