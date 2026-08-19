import {
  dirPath,
  appPath,
  distPath,
  tmpPath,
  basePath,
  buildPath,
  getFileHash,
  importModule,
  appModuleFiles,
  nodeModulesPath,
  DEFAULT_APP_MODULES_PATTERN
} from '../src/utils'
import { isAbsolute, join } from 'node:path'
import { writeFileSync, rmSync } from 'node:fs'

describe('Path Utilities', () => {
  it('should resolve basePath correctly', () => {
    expect(basePath('test')).toBe(join(process.cwd(), 'test'))
  })

  it('should resolve dirPath correctly', () => {
    expect(dirPath('test')).toBeDefined()
  })

  it('should resolve tmpPath correctly', () => {
    expect(tmpPath('file.tmp')).toBe(join(tmpPath(), 'file.tmp'))
  })

  it('should resolve buildPath correctly', () => {
    expect(buildPath('config')).toBe(join(process.cwd(), '.stone', 'config'))
  })

  it('should resolve distPath correctly', () => {
    expect(distPath('index.js')).toBe(join(process.cwd(), 'dist', 'index.js'))
  })

  it('should resolve appPath correctly', () => {
    expect(appPath('controller')).toBe(join(process.cwd(), 'app', 'controller'))
  })

  it('should resolve nodeModulesPath correctly', () => {
    expect(nodeModulesPath('stone-js')).toBe(join(process.cwd(), 'node_modules', 'stone-js'))
  })

  it('should return correct file hash', () => {
    const testFilePath = tmpPath('stonejs_test.txt')
    writeFileSync(testFilePath, 'stonejs testing content')
    expect(getFileHash(testFilePath)).toBe('64389e3fd63da1edd03d411e69481c3a2a04195d010829b7e0d241edf8de5555')
    rmSync(testFilePath)
  })

  it('should return undefined for missing import', async () => {
    const result = await importModule('non-existent-module.js')
    expect(result).toBeUndefined()
  })
})

describe('appModuleFiles', () => {
  // The shared definition of "the app's source files": the CLI decides how to build from it, and
  // `@stone-js/testing` decides what to boot from it. A test suite booting a different set than the
  // build ships is the failure this exists to prevent, so it is worth pinning.
  it('lists matching files, absolute and sorted', () => {
    const files = appModuleFiles({ pattern: 'tests/**/*.spec.ts' })

    expect(files.length).toBeGreaterThan(0)
    expect(files.every((file) => isAbsolute(file))).toBe(true)
    expect([...files]).toEqual([...files].sort((a, b) => a.localeCompare(b)))
  })

  it('accepts an absolute pattern as given', () => {
    const absolute = join(process.cwd(), 'tests/**/*.spec.ts')

    expect(appModuleFiles({ pattern: absolute })).toEqual(appModuleFiles({ pattern: 'tests/**/*.spec.ts' }))
  })

  it('defaults to the app directory', () => {
    // No `app/` in this package, so the default finds nothing rather than throwing.
    expect(appModuleFiles()).toEqual([])
    expect(DEFAULT_APP_MODULES_PATTERN).toBe('app/**/*.{ts,tsx,js,jsx,mjsx}')
  })
})
