import { NODE_CONSOLE_PLATFORM } from '@stone-js/node-cli-adapter'
import { serverIndexFile, consoleIndexFile } from '../../src/server/stubs'

describe('serverIndexFile', () => {
  it('should return default server index file with printUrls false', () => {
    const result = serverIndexFile()
    expect(result).toContain('import { stoneApp } from \'@stone-js/core\'')
    expect(result).toContain('import * as rawModules from \'./modules.mjs\'')
    expect(result).toContain('stoneApp({')
    expect(result).toContain('context.blueprint.setIf(\'stone.adapter.printUrls\', false)')
  })

  it('should correctly inject printUrls as true', () => {
    const result = serverIndexFile(true)
    expect(result).toContain('context.blueprint.setIf(\'stone.adapter.printUrls\', true)')
  })

  it('should inject printUrls as a string when provided', () => {
    const result = serverIndexFile('log://custom')
    expect(result).toContain('context.blueprint.setIf(\'stone.adapter.printUrls\', log://custom)')
  })
})

describe('consoleIndexFile', () => {
  it('should return default console index file with NODE_CONSOLE_PLATFORM', () => {
    const result = consoleIndexFile()
    expect(result).toContain('import { stoneApp } from \'@stone-js/core\'')
    expect(result).toContain('import * as rawModules from \'./modules.mjs\'')
    expect(result).toContain('stoneApp({')
    expect(result).toContain(`blueprint.set('stone.adapter.platform', '${NODE_CONSOLE_PLATFORM}')`)
  })

  it('should inject custom platform when specified', () => {
    const result = consoleIndexFile('custom-platform')
    expect(result).toContain('blueprint.set(\'stone.adapter.platform\', \'custom-platform\')')
  })
})
