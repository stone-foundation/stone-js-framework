import { readFileSync } from 'node:fs'
import { removeImportsVitePlugin } from '../../src/react/RemoveImportsVitePlugin'

// Create a spy on readFileSync
vi.mock('node:fs', () => ({
  readFileSync: vi.fn()
}))

const mockFileContent = `
import { Something, Another as Renamed, Module } from 'to-remove'
import NotRemoved from 'keep-it'

// Must not be removed
// @Test()

@Something()
class Test {
  constructor () {
    const a = new Something()
    const b = Renamed.create()
    if (b === Renamed) {}
    import('to-remove').then(() => {})
  }
}
`

describe('removeImportsVitePlugin', () => {
  let plugin: any

  beforeEach(() => {
    plugin = removeImportsVitePlugin(['to-remove'])
    plugin.addWatchFile = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return undefined for irrelevant files', () => {
    const result = plugin.load?.call({} as any, '\0/test.js')
    expect(result).toBeUndefined()

    const result2 = plugin.load?.call({} as any, 'some/path/OtherFile.css')
    expect(result2).toBeUndefined()

    const result3 = plugin.load?.call({} as any, 'node_modules/test.js')
    expect(result3).toBeUndefined()
  })

  it('should process and transform relevant files', () => {
    const fakeId = '/fake.ts'

    vi.mocked(readFileSync).mockReturnValueOnce(mockFileContent)

    const result = plugin.load(fakeId)

    expect(readFileSync).toHaveBeenCalledWith(fakeId, 'utf-8')
    // expect(result.code).not.toContain('import')
    expect(result.code).not.toContain('Something()')
    // expect(result.code).not.toContain('Renamed.create()')
    // expect(result.code).not.toContain('All.method()')
    expect(result.code).not.toContain('import(\'to-remove\')')
    expect(result.code).toContain('{}')
    expect(result.map).toBeNull()
    // expect(ctx.addWatchFile).toHaveBeenCalledWith(fakeId)
  })

  it('should skip if no matching imports found', () => {
    const id = 'noMatch.mjsx'
    const noImportCode = 'const x = 1;'
    vi.mocked(readFileSync).mockReturnValueOnce(noImportCode)

    const ctx = {
      addWatchFile: vi.fn()
    }

    const result = plugin.load?.call(ctx, id)

    expect(result).toBeUndefined()
    expect(readFileSync).toHaveBeenCalledWith(id, 'utf-8')
    expect(ctx.addWatchFile).not.toHaveBeenCalled()
  })

  it('should support RegExp module matchers', () => {
    const fakeId = '/test.ts'
    vi.mocked(readFileSync).mockReturnValueOnce(`
      import Http from '@stone-js/http-core'
      const x = Http.Response()
    `)

    const pluginWithRegex: any = removeImportsVitePlugin([/@stone-js\/http-core/])

    const ctx = { addWatchFile: vi.fn() }
    const result = pluginWithRegex.load?.call(ctx, fakeId)

    expect(result.code).not.toContain('Http')
    expect(result.code).toContain('{}')
  })
})
