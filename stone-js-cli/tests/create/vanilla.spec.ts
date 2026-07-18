import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs'
import { toVanillaSource, collectTsFiles, deriveVanilla } from '../../src/create/vanilla'

/**
 * Real behavioural tests (no mocks): the vanilla derivation is only trustworthy if the actual
 * TypeScript transpiler output is asserted against — that types are stripped while stage-3
 * decorators survive, and that the filesystem walk/derive behaves on a real tree.
 */
describe('vanilla derivation', () => {
  let dir: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'stone-vanilla-'))
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  describe('toVanillaSource', () => {
    it('strips type annotations while preserving stage-3 decorators', () => {
      const ts = [
        "import { Get } from '@stone-js/router'",
        'export class Ctrl {',
        '  private readonly x: number = 1',
        "  @Get('/')",
        '  handle (event: unknown): string { return String(event) }',
        '}'
      ].join('\n')

      const js = toVanillaSource(ts)

      expect(js).toContain('@Get')
      expect(js).toContain('class Ctrl')
      expect(js).not.toContain(': number')
      expect(js).not.toContain(': string')
      expect(js).not.toContain(': unknown')
    })

    it('drops interfaces and type-only constructs entirely', () => {
      const js = toVanillaSource('export interface Foo { a: number }\nexport const x = 1')
      expect(js).not.toContain('interface')
      expect(js).toContain('export const x = 1')
    })
  })

  describe('collectTsFiles', () => {
    it('returns an empty array for a missing directory', () => {
      expect(collectTsFiles(join(dir, 'nope'))).toEqual([])
    })

    it('walks recursively and skips declaration files', () => {
      mkdirSync(join(dir, 'sub'))
      writeFileSync(join(dir, 'a.ts'), 'export const a = 1')
      writeFileSync(join(dir, 'b.d.ts'), 'export declare const b: number')
      writeFileSync(join(dir, 'sub', 'c.ts'), 'export const c = 3')
      writeFileSync(join(dir, 'sub', 'note.txt'), 'ignored')

      const files = collectTsFiles(dir).map((f) => f.replace(dir, '').replace(/\\/g, '/'))

      expect(files.sort()).toEqual(['/a.ts', '/sub/c.ts'])
    })
  })

  describe('deriveVanilla', () => {
    it('replaces every .ts with a sibling .js and removes the original', () => {
      writeFileSync(join(dir, 'Service.ts'), 'export const n: number = 2')

      const generated = deriveVanilla(dir)

      expect(generated).toHaveLength(1)
      expect(existsSync(join(dir, 'Service.ts'))).toBe(false)
      expect(existsSync(join(dir, 'Service.js'))).toBe(true)
      expect(readFileSync(join(dir, 'Service.js'), 'utf-8')).not.toContain(': number')
    })

    it('returns an empty array when there is nothing to derive', () => {
      expect(deriveVanilla(join(dir, 'empty'))).toEqual([])
    })
  })
})
