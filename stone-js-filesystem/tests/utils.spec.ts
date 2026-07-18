import {
  dirPath,
  appPath,
  distPath,
  tmpPath,
  basePath,
  buildPath,
  getFileHash,
  importModule,
  nodeModulesPath
} from '../src/utils'
import { join } from 'node:path'
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
    expect(getFileHash(testFilePath)).toBe('6906f31d806d5a052b0c95608b070fdc')
    rmSync(testFilePath)
  })

  it('should return undefined for missing import', async () => {
    const result = await importModule('non-existent-module.js')
    expect(result).toBeUndefined()
  })
})
