import { globSync } from 'glob'
import { multiEntry } from '../../src/server/multiEntry'

// Keep resolved paths identical to the globbed paths for predictable assertions.
vi.mock('node:path', () => ({ resolve: (path: string) => path }))
vi.mock('glob', () => ({ globSync: vi.fn() }))

const VIRTUAL = '\0stone:multi-entry'

/**
 * Drives the plugin end to end: feeds `input` through `options`, points `globSync` at `files`,
 * stubs the Rollup `this.load` context with per-file `exports`, and returns the generated code.
 */
async function generate (
  input: string | string[],
  files: string[],
  exportsByFile: Record<string, string[]>
): Promise<string> {
  const plugin: any = multiEntry()
  plugin.options({ input })
  vi.mocked(globSync).mockReturnValue(files as any)
  const context = {
    load: vi.fn(async ({ id }: { id: string }) => ({ exports: exportsByFile[id] ?? [] }))
  }
  return await plugin.load.call(context, VIRTUAL)
}

describe('multiEntry', () => {
  beforeEach(() => {
    vi.mocked(globSync).mockReset()
  })

  it('is named stone-multi-entry', () => {
    expect(multiEntry().name).toBe('stone-multi-entry')
  })

  describe('options', () => {
    it('replaces a string input with the single virtual entry and keeps other options', () => {
      const plugin: any = multiEntry()
      const out = plugin.options({ input: 'app/**/*.ts', context: 'globalThis' })
      expect(out.input).toBe(VIRTUAL)
      expect(out.context).toBe('globalThis')
    })

    it('accepts an array input', () => {
      const plugin: any = multiEntry()
      const out = plugin.options({ input: ['app/**/*.ts', '!app/i18n/**'] })
      expect(out.input).toBe(VIRTUAL)
    })
  })

  describe('resolveId', () => {
    it('resolves the virtual id to itself', () => {
      expect(multiEntry().resolveId?.(VIRTUAL, undefined, {} as any)).toBe(VIRTUAL)
    })

    it('returns null for any other id', () => {
      expect(multiEntry().resolveId?.('app/a.ts', undefined, {} as any)).toBeNull()
    })
  })

  describe('load', () => {
    it('returns null for a non-virtual id', async () => {
      const plugin: any = multiEntry()
      expect(await plugin.load.call({ load: vi.fn() }, 'app/a.ts')).toBeNull()
    })

    it('re-exports named exports under a unique per-file alias', async () => {
      const code = await generate('app/**/*.ts', ['app/a.ts'], { 'app/a.ts': ['foo'] })
      expect(code).toBe('export { foo as $stone$0$foo } from "app/a.ts"')
    })

    it('aliases every named export of a file', async () => {
      const code = await generate('app/**/*.ts', ['app/a.ts'], { 'app/a.ts': ['foo', 'bar'] })
      expect(code).toContain('export { foo as $stone$0$foo } from "app/a.ts"')
      expect(code).toContain('export { bar as $stone$0$bar } from "app/a.ts"')
    })

    it('does not collide when two files export the same name (i18n case)', async () => {
      const code = await generate(
        'app/**/*.ts',
        ['app/i18n/en/common.ts', 'app/i18n/fr/common.ts'],
        { 'app/i18n/en/common.ts': ['common'], 'app/i18n/fr/common.ts': ['common'] }
      )
      expect(code).toContain('export { common as $stone$0$common } from "app/i18n/en/common.ts"')
      expect(code).toContain('export { common as $stone$1$common } from "app/i18n/fr/common.ts"')
      // both survive: two distinct aliases, no name is dropped
      expect(code.match(/\$common/g)).toHaveLength(2)
    })

    it('never re-exports the default export (mirrors `export *`)', async () => {
      const code = await generate('app/**/*.ts', ['app/a.ts'], { 'app/a.ts': ['default', 'named'] })
      expect(code).toContain('export { named as $stone$0$named } from "app/a.ts"')
      expect(code).not.toContain('default')
    })

    it('never re-exports a `*` (star) export name', async () => {
      const code = await generate('app/**/*.ts', ['app/a.ts'], { 'app/a.ts': ['*', 'named'] })
      expect(code).toContain('export { named as $stone$0$named } from "app/a.ts"')
      expect(code).not.toContain('$stone$0$*')
    })

    it('falls back to a side-effect import when a file has no named exports', async () => {
      const code = await generate('app/**/*.ts', ['app/boot.ts'], { 'app/boot.ts': [] })
      expect(code).toBe('import "app/boot.ts"')
    })

    it('treats a default-only file as a side-effect import', async () => {
      const code = await generate('app/**/*.ts', ['app/a.ts'], { 'app/a.ts': ['default'] })
      expect(code).toBe('import "app/a.ts"')
    })

    it('loads every entry so it is evaluated (decorators register)', async () => {
      const plugin: any = multiEntry()
      plugin.options({ input: 'app/**/*.ts' })
      vi.mocked(globSync).mockReturnValue(['app/a.ts', 'app/b.ts'] as any)
      const context = { load: vi.fn(async () => ({ exports: [] })) }
      await plugin.load.call(context, VIRTUAL)
      expect(context.load).toHaveBeenCalledWith({ id: 'app/a.ts' })
      expect(context.load).toHaveBeenCalledWith({ id: 'app/b.ts' })
    })

    it('passes `!`-prefixed patterns to glob as ignores', async () => {
      const plugin: any = multiEntry()
      plugin.options({ input: ['app/**/*.ts', '!app/i18n/**', '!app/generated/**'] })
      vi.mocked(globSync).mockReturnValue([] as any)
      await plugin.load.call({ load: vi.fn() }, VIRTUAL)
      expect(globSync).toHaveBeenCalledWith('app/**/*.ts', { ignore: ['app/i18n/**', 'app/generated/**'] })
      // ignore patterns are not globbed as includes
      expect(globSync).toHaveBeenCalledTimes(1)
    })

    it('de-duplicates a file matched by several include patterns', async () => {
      const plugin: any = multiEntry()
      plugin.options({ input: ['app/**/*.ts', 'app/services/*.ts'] })
      vi.mocked(globSync).mockReturnValue(['app/services/a.ts'] as any)
      const context = { load: vi.fn(async () => ({ exports: ['a'] })) }
      const code = await plugin.load.call(context, VIRTUAL)
      expect(code.match(/from "app\/services\/a.ts"/g)).toHaveLength(1)
    })

    it('tolerates a module whose exports info is undefined', async () => {
      const plugin: any = multiEntry()
      plugin.options({ input: 'app/**/*.ts' })
      vi.mocked(globSync).mockReturnValue(['app/a.ts'] as any)
      const context = { load: vi.fn(async () => ({})) }
      const code = await plugin.load.call(context, VIRTUAL)
      expect(code).toBe('import "app/a.ts"')
    })
  })
})
