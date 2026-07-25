import fsExtra from 'fs-extra'
import { StoneCliPlugin } from '../../src/plugins/declarations'
import { basePath, importModule, nodeModulesPath } from '@stone-js/filesystem'
import {
  isStoneCliPlugin,
  collectStonePlugins,
  resolveFirstPartyPlugin,
  discoverFirstPartyPlugins
} from '../../src/plugins/loadPlugins'

vi.mock('fs-extra', () => ({
  default: { readJsonSync: vi.fn() }
}))

vi.mock('@stone-js/filesystem', () => ({
  basePath: vi.fn((...paths: string[]) => `/proj/${paths.join('/')}`),
  nodeModulesPath: vi.fn((...paths: string[]) => `/proj/node_modules/${paths.join('/')}`),
  importModule: vi.fn()
}))

const plugin = (name: string): StoneCliPlugin => ({ name })

describe('loadPlugins', () => {
  const readJsonSync = vi.mocked(fsExtra.readJsonSync)
  const importModuleMock = vi.mocked(importModule)

  beforeEach(() => vi.clearAllMocks())

  describe('isStoneCliPlugin', () => {
    it('accepts an object with a string name', () => {
      expect(isStoneCliPlugin({ name: 'x' })).toBe(true)
    })

    it('rejects non-objects, null and nameless objects', () => {
      expect(isStoneCliPlugin(null)).toBe(false)
      expect(isStoneCliPlugin('x')).toBe(false)
      expect(isStoneCliPlugin({})).toBe(false)
    })
  })

  describe('resolveFirstPartyPlugin', () => {
    it('returns undefined when the package advertises no contract', async () => {
      readJsonSync.mockReturnValue({ stone: {} })
      expect(await resolveFirstPartyPlugin('@stone-js/i18n')).toBeUndefined()
    })

    it('imports and returns the plugin from the default export', async () => {
      readJsonSync.mockReturnValue({ stone: { cliPlugin: './dist/cli.js' } })
      importModuleMock.mockResolvedValue({ default: plugin('@stone-js/i18n') } as any)

      const resolved = await resolveFirstPartyPlugin('@stone-js/i18n')

      expect(importModuleMock).toHaveBeenCalledWith('node_modules/@stone-js/i18n/dist/cli.js')
      expect(resolved?.name).toBe('@stone-js/i18n')
    })

    it('falls back to the module itself when there is no default export', async () => {
      readJsonSync.mockReturnValue({ stone: { cliPlugin: './dist/cli.js' } })
      importModuleMock.mockResolvedValue(plugin('@stone-js/i18n') as any)

      expect((await resolveFirstPartyPlugin('@stone-js/i18n'))?.name).toBe('@stone-js/i18n')
    })

    it('returns undefined when the export is not a valid plugin', async () => {
      readJsonSync.mockReturnValue({ stone: { cliPlugin: './dist/cli.js' } })
      importModuleMock.mockResolvedValue(undefined)

      expect(await resolveFirstPartyPlugin('@stone-js/i18n')).toBeUndefined()
    })
  })

  describe('discoverFirstPartyPlugins', () => {
    it('returns an empty list when there is no package.json', async () => {
      readJsonSync.mockReturnValue(undefined)
      expect(await discoverFirstPartyPlugins()).toEqual([])
    })

    it('discovers only @stone-js/* direct deps that advertise a contract', async () => {
      readJsonSync.mockImplementation((path: string) => {
        if (path === '/proj/package.json') {
          return {
            dependencies: { '@stone-js/i18n': '*', 'left-pad': '*' },
            devDependencies: { '@stone-js/auth': '*' }
          }
        }
        if (path.includes('@stone-js/i18n')) { return { stone: { cliPlugin: './cli.js' } } }
        return {} // @stone-js/auth advertises no contract
      })
      importModuleMock.mockResolvedValue({ default: plugin('@stone-js/i18n') } as any)

      const discovered = await discoverFirstPartyPlugins()

      expect(discovered).toHaveLength(1)
      expect(discovered[0]).toEqual({ plugin: { name: '@stone-js/i18n' }, source: '@stone-js/i18n' })
      expect(basePath).toHaveBeenCalledWith('package.json')
      expect(nodeModulesPath).toHaveBeenCalledWith('@stone-js/i18n', 'package.json')
    })
  })

  describe('collectStonePlugins', () => {
    it('tags config plugins and skips auto-discovery when disabled', async () => {
      const loaded = await collectStonePlugins([plugin('a')], false)

      expect(loaded).toEqual([{ plugin: { name: 'a' }, source: 'config' }])
      expect(readJsonSync).not.toHaveBeenCalled()
    })

    it('filters out invalid config plugins', async () => {
      const loaded = await collectStonePlugins([plugin('a'), {} as StoneCliPlugin], false)
      expect(loaded.map((entry) => entry.plugin.name)).toEqual(['a'])
    })

    it('merges auto-discovered plugins, with config winning on name clashes', async () => {
      readJsonSync.mockImplementation((path: string) => {
        if (path === '/proj/package.json') { return { dependencies: { '@stone-js/i18n': '*', '@stone-js/auth': '*' } } }
        return { stone: { cliPlugin: './cli.js' } }
      })
      importModuleMock.mockImplementation(async (relativePath: string) =>
        relativePath.includes('i18n')
          ? { default: plugin('@stone-js/i18n') }
          : { default: plugin('@stone-js/auth') } as any
      )

      const loaded = await collectStonePlugins([plugin('@stone-js/i18n')], true)

      expect(loaded).toEqual([
        { plugin: { name: '@stone-js/i18n' }, source: 'config' },
        { plugin: { name: '@stone-js/auth' }, source: '@stone-js/auth' }
      ])
    })
  })
})
