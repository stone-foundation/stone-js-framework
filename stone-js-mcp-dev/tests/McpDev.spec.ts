import { McpDev } from '../src/decorators/McpDev'
import { addBlueprint } from '@stone-js/core'

vi.mock('@stone-js/core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    addBlueprint: vi.fn(() => {}),
    classDecoratorLegacyWrapper: (fn: Function) => { fn(class {}, {}); return fn }
  }
})

describe('McpDev decorator', () => {
  beforeEach(() => vi.clearAllMocks())

  it('adds the blueprint with the given options', () => {
    McpDev({ name: 'x' })(class {})
    expect(addBlueprint).toHaveBeenCalled()
  })

  it('adds the blueprint with default options', () => {
    McpDev()(class {})
    expect(addBlueprint).toHaveBeenCalled()
  })
})
