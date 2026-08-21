import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { discoverModules, generateManifest, isApplicationModule, toImportSpecifier, toSafeJsStringLiteral } from '../src/build/discoverModules'
import { writeManifest } from '../src/build/writeManifest'

/**
 * The codegen works on real files, so these tests do too: a temporary project on disk, with the
 * shapes a real application has. Mocking the filesystem here would only test the mock.
 */
const makeProject = (files: string[]): string => {
  const root = mkdtempSync(join(tmpdir(), 'stone-native-'))

  for (const file of files) {
    const path = join(root, file)
    mkdirSync(join(path, '..'), { recursive: true })
    writeFileSync(path, 'export const x = 1\n', 'utf-8')
  }

  return root
}

describe('discoverModules', () => {
  const roots: string[] = []

  afterEach(() => {
    roots.forEach((root) => rmSync(root, { recursive: true, force: true }))
    roots.length = 0
  })

  const project = (files: string[]): string => {
    const root = makeProject(files)
    roots.push(root)
    return root
  }

  it('finds the application modules, in a stable order', () => {
    const root = project(['app/Application.ts', 'app/pages/HomePage.tsx', 'app/services/TaskService.ts'])

    const found = discoverModules(root).map((file) => file.replace(root, ''))

    expect(found).toEqual([
      '/app/Application.ts',
      '/app/pages/HomePage.tsx',
      '/app/services/TaskService.ts'
    ])
  })

  it('walks nested directories, however deep', () => {
    const root = project(['app/a/b/c/DeepPage.tsx'])

    expect(discoverModules(root)).toHaveLength(1)
  })

  it('leaves out what is not application code', () => {
    const root = project([
      'app/Application.ts',
      'app/declarations.d.ts',
      'app/HomePage.spec.tsx',
      'app/TaskService.test.ts',
      'app/logo.png',
      'app/styles.css'
    ])

    const found = discoverModules(root).map((file) => file.replace(root, ''))

    expect(found).toEqual(['/app/Application.ts'])
  })

  it('accepts an application that has no modules yet', () => {
    const root = project([])

    expect(discoverModules(root)).toEqual([])
  })

  it('scans the directory the project named', () => {
    const root = project(['src/Application.ts', 'app/Ignored.ts'])

    const found = discoverModules(root, { appDir: 'src' }).map((file) => file.replace(root, ''))

    expect(found).toEqual(['/src/Application.ts'])
  })

  it('collects only the extensions asked for', () => {
    const root = project(['app/Application.ts', 'app/legacy.js'])

    const found = discoverModules(root, { extensions: ['ts'] }).map((file) => file.replace(root, ''))

    expect(found).toEqual(['/app/Application.ts'])
  })
})

describe('isApplicationModule', () => {
  it.each([
    ['Application.ts', true],
    ['HomePage.tsx', true],
    ['legacy.js', true],
    ['declarations.d.ts', false],
    ['HomePage.spec.tsx', false],
    ['TaskService.test.ts', false],
    ['logo.png', false],
    ['README.md', false]
  ])('answers %s with %s', (file, expected) => {
    expect(isApplicationModule(file, ['ts', 'tsx', 'js', 'jsx', 'mjs'])).toBe(expected)
  })
})

describe('toImportSpecifier', () => {
  it('is relative, POSIX, and drops the extension so the bundler picks the platform file', () => {
    // `HomePage.ios.tsx` must be allowed to win over `HomePage.tsx`, which only happens if the
    // specifier carries no extension of its own.
    expect(toImportSpecifier(join('/project', '.stone'), join('/project', 'app', 'HomePage.tsx')))
      .toBe('../app/HomePage')
  })

  it('stays explicitly relative even for a sibling', () => {
    expect(toImportSpecifier('/project', join('/project', 'HomePage.tsx'))).toBe('./HomePage')
  })
})

describe('toSafeJsStringLiteral', () => {
  it('keeps a normal path readable', () => {
    expect(toSafeJsStringLiteral('../app/HomePage')).toBe('"../app/HomePage"')
  })

  it('escapes the line separators, which are invisible and would break the literal', () => {
    const literal = toSafeJsStringLiteral(`../app/${String.fromCodePoint(0x2028)}Page`)

    expect(literal).toContain('\\u2028')
    expect(literal).not.toContain(String.fromCodePoint(0x2028))
  })

  it('escapes a quote in a file name', () => {
    expect(toSafeJsStringLiteral('../app/it"s')).toBe('"../app/it\\"s"')
  })
})

describe('generateManifest', () => {
  it('imports every module and flattens their exports', () => {
    const source = generateManifest('/project/.stone', ['/project/app/Application.ts', '/project/app/HomePage.tsx'])

    expect(source).toContain("import * as module0 from \"../app/Application\"")
    expect(source).toContain("import * as module1 from \"../app/HomePage\"")
    expect(source).toContain('namespaces.flatMap((namespace) => Object.values(namespace))')
  })

  it('never emits a glob, because no native bundler understands one', () => {
    const source = generateManifest('/project/.stone', ['/project/app/Application.ts'])

    expect(source).not.toContain('import.meta.glob')
  })

  it('is valid with no modules at all', () => {
    const source = generateManifest('/project/.stone', [])

    expect(source).toContain('const namespaces: Array<Record<string, unknown>> = []')
  })
})

describe('writeManifest', () => {
  const roots: string[] = []

  afterEach(() => {
    roots.forEach((root) => rmSync(root, { recursive: true, force: true }))
    roots.length = 0
  })

  const project = (files: string[]): string => {
    const root = makeProject(files)
    roots.push(root)
    return root
  }

  it('writes the manifest where the application imports it from', () => {
    const root = project(['app/Application.ts'])

    const result = writeManifest(root)

    expect(result.count).toBe(1)
    expect(result.changed).toBe(true)
    expect(readFileSync(join(root, '.stone', 'modules.ts'), 'utf-8')).toContain('../app/Application')
  })

  it('leaves an unchanged manifest alone, so Metro is not asked to rebuild for nothing', () => {
    const root = project(['app/Application.ts'])

    writeManifest(root)
    const second = writeManifest(root)

    expect(second.changed).toBe(false)
  })

  it('rewrites it once a module appears', () => {
    const root = project(['app/Application.ts'])
    writeManifest(root)

    writeFileSync(join(root, 'app', 'HomePage.tsx'), 'export const x = 1\n', 'utf-8')
    const second = writeManifest(root)

    expect(second.changed).toBe(true)
    expect(second.count).toBe(2)
  })

  it('writes where it was told to', () => {
    const root = project(['app/Application.ts'])

    const result = writeManifest(root, { manifest: join('generated', 'modules.ts') })

    expect(result.path).toBe(join(root, 'generated', 'modules.ts'))
    expect(readFileSync(result.path, 'utf-8')).toContain('../app/Application')
  })
})
