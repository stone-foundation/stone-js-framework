import * as fs from 'fs'
import { IBlueprint } from '@stone-js/core'
import * as fsUtils from '@stone-js/filesystem'
import { getRollupConfig } from '../../src/server/server-utils'

vi.mock('fs', () => ({
  existsSync: vi.fn()
}))

vi.mock('@stone-js/filesystem', async () => {
  const actual = await vi.importActual<any>('@stone-js/filesystem')
  return {
    ...actual,
    importModule: vi.fn(),
    basePath: (file: string) => `/fake/${file}`
  }
})

describe('getRollupConfig', () => {
  const mockBlueprint: IBlueprint = {
    get: vi.fn()
  } as any

  const buildConfig = { input: 'build-entry' } as any
  const bundleConfig = { input: 'bundle-entry' } as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return config from blueprint when no file exists', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    vi.mocked(mockBlueprint.get).mockReturnValue({ build: buildConfig, bundle: bundleConfig })

    const result = await getRollupConfig(mockBlueprint, 'build')
    expect(result).toBe(buildConfig)
    expect(mockBlueprint.get).toHaveBeenCalledWith('stone.builder.rollup', expect.anything())
  })

  it('should load from rollup.config.mjs if it exists', async () => {
    vi.mocked(fs.existsSync).mockImplementation((path: any) => path.endsWith('rollup.config.mjs'))
    vi.mocked(fsUtils.importModule).mockResolvedValue({
      rollupBuildConfig: buildConfig,
      rollupBundleConfig: bundleConfig
    })
    vi.mocked(mockBlueprint.get).mockReturnValue({})

    const result = await getRollupConfig(mockBlueprint, 'bundle')
    expect(result).toBe(bundleConfig)
    expect(fsUtils.importModule).toHaveBeenCalledWith('rollup.config.mjs')
  })

  it('should load from rollup.config.js if .mjs does not exist', async () => {
    vi.mocked(fs.existsSync).mockImplementation((path: any) => path.endsWith('rollup.config.js'))
    vi.mocked(fsUtils.importModule).mockResolvedValue({
      rollupBuildConfig: buildConfig,
      rollupBundleConfig: bundleConfig
    })
    vi.mocked(mockBlueprint.get).mockReturnValue({})

    const result = await getRollupConfig(mockBlueprint, 'build')
    expect(result).toBe(buildConfig)
    expect(fsUtils.importModule).toHaveBeenCalledWith('rollup.config.js')
  })

  it('should fallback to blueprint config if no file and no module returned', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    vi.mocked(mockBlueprint.get).mockReturnValue({ build: buildConfig, bundle: bundleConfig })

    const result = await getRollupConfig(mockBlueprint, 'bundle')
    expect(result).toBe(bundleConfig)
  })

  it('should not fail if imported module is empty', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fsUtils.importModule).mockResolvedValue({})
    vi.mocked(mockBlueprint.get).mockReturnValue({ build: buildConfig, bundle: bundleConfig })

    const result = await getRollupConfig(mockBlueprint, 'build')
    expect(result).toBe(buildConfig)
  })
})
