import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { StonePluginContext } from '@stone-js/cli'

const mockReadFileSync = vi.fn()
const mockReporter = { warn: vi.fn(), info: vi.fn(), error: vi.fn() }
const mockWriteFile = vi.fn()
const mockAddModule = vi.fn()
const mockBuildPath = vi.fn()

vi.mock('node:fs', () => ({ readFileSync: mockReadFileSync }))

const { openapiCliPlugin, GENERATED_MODULE } = await import('../src/cli')

const SIMPLE_OPENAPI_JSON = JSON.stringify({
  openapi: '3.0.3',
  info: { title: 'Test', version: '1.0' },
  paths: {}
})

function makePath (segments: string[]): string {
  return `/proj/.stone/tmp/${segments.join('/')}`
}

describe('openapiCliPlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockBuildPath.mockReset()
    mockBuildPath.mockImplementation((...paths: string[]) => makePath(paths))
    mockWriteFile.mockReturnValue('/proj/.stone/tmp/plugins/openapi-types.ts')
  })

  function ctx (overrides: Record<string, unknown> = {}): StonePluginContext {
    return {
      blueprint: { get: vi.fn(), set: vi.fn() },
      event: {} as any,
      command: 'build' as const,
      reporter: mockReporter,
      buildPath: mockBuildPath,
      writeFile: mockWriteFile,
      addModule: mockAddModule,
      addBlueprint: vi.fn(),
      ...overrides
    } as unknown as StonePluginContext
  }

  describe('plugin metadata', () => {
    it('has the correct name', () => {
      const plugin = openapiCliPlugin()
      expect(plugin.name).toBe('@stone-js/openapi')
    })

    it('describes the source in the description when given', () => {
      const plugin = openapiCliPlugin({ source: 'https://api.example.com/openapi.json' })
      expect(plugin.description).toContain('https://api.example.com/openapi.json')
    })

    it('describes the built-in contract when no source is given', () => {
      const plugin = openapiCliPlugin()
      expect(plugin.description).toContain("app's own OpenAPI contract")
    })
  })

  describe('GENERATED_MODULE', () => {
    it('writes to the plugins directory under .stone/tmp', () => {
      expect(GENERATED_MODULE).toBe('plugins/openapi-types.ts')
    })
  })

  describe('onPrepare with a file source', () => {
    it('reads a JSON file and generates types', async () => {
      mockReadFileSync.mockReturnValue(SIMPLE_OPENAPI_JSON)
      const context = ctx()
      const plugin = openapiCliPlugin({ source: '/tmp/spec.json' })

      await plugin.onPrepare?.(context)

      expect(mockReporter.warn).not.toHaveBeenCalled()
      expect(mockWriteFile).toHaveBeenCalledWith(
        'plugins/openapi-types.ts',
        expect.stringContaining('export interface')
      )
      expect(mockAddModule).toHaveBeenCalledWith('./plugins/openapi-types.ts')
    })
  })

  describe('onPrepare with no source', () => {
    it('warns when the build file is missing', async () => {
      mockReadFileSync.mockImplementation(() => {
        const err: NodeJS.ErrnoException = Object.assign(new Error('ENOENT: no such file'), { code: 'ENOENT' })
        throw err
      })

      mockBuildPath.mockReturnValue('/proj/.stone/tmp/openapi.json')

      const context = ctx()
      const plugin = openapiCliPlugin()

      await plugin.onPrepare?.(context)

      expect(mockReporter.warn).toHaveBeenCalledWith(
        expect.stringContaining('no OpenAPI document found')
      )
      expect(mockWriteFile).not.toHaveBeenCalled()
      expect(mockAddModule).not.toHaveBeenCalled()
    })

    it('reads the convention file when it exists', async () => {
      mockReadFileSync.mockReturnValue(SIMPLE_OPENAPI_JSON)
      mockBuildPath.mockReturnValue('/proj/.stone/tmp/openapi.json')

      const context = ctx()
      const plugin = openapiCliPlugin()

      await plugin.onPrepare?.(context)

      expect(mockReporter.warn).not.toHaveBeenCalled()
      expect(mockWriteFile).toHaveBeenCalledWith(
        'plugins/openapi-types.ts',
        expect.stringContaining('export interface')
      )
      expect(mockAddModule).toHaveBeenCalledWith('./plugins/openapi-types.ts')
    })
  })
})
