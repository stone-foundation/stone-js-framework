import fsExtra from 'fs-extra'
import { readFileSync, existsSync } from 'fs'
import { buildPath } from '@stone-js/filesystem'
import { serverIndexFile } from '../../src/server/stubs'
import { getRollupConfig } from '../../src/server/server-utils'
import { BuildServerAppMiddleware, BuildTerminatingMiddleware, BundleServerAppMiddleware, GenerateServerFileMiddleware } from '../../src/server/ServerBuildMiddleware'

const { outputFileSync, removeSync } = fsExtra

vi.mock('rollup', async () => {
  return {
    rollup: vi.fn().mockResolvedValue({
      write: vi.fn().mockResolvedValue(undefined)
    })
  }
})

vi.mock('../../src/server/server-utils', async () => {
  const mod = await vi.importActual<any>('../../src/server/server-utils')
  return {
    ...mod,
    getRollupConfig: vi.fn()
  }
})

vi.mock('fs-extra', () => ({
  default: {
    removeSync: vi.fn(),
    outputFileSync: vi.fn()
  }
}))

vi.mock('node:fs', async () => {
  const mod = await vi.importActual<any>('node:fs')
  return {
    ...mod,
    existsSync: vi.fn().mockReturnValue(false),
    readFileSync: vi.fn()
  }
})

const createMockContext = (): any => ({
  commandOutput: {
    show: vi.fn(),
    format: { yellow: (msg: string) => msg }
  },
  blueprint: {
    get: vi.fn().mockReturnValue('app/**/*.**')
  }
})

it('BuildServerAppMiddleware should build server app using rollup', async () => {
  const context: any = createMockContext()
  const next = vi.fn().mockResolvedValue(context.blueprint)
  const write: any = vi.fn().mockResolvedValue(undefined)

  vi.mocked(getRollupConfig).mockResolvedValue({
    input: '',
    output: {},
    write
  } as any)

  const blueprint = await BuildServerAppMiddleware(context, next)

  expect(getRollupConfig).toHaveBeenCalledWith(context.blueprint)
  expect(next).toHaveBeenCalledWith(context)
  expect(context.commandOutput.show).toHaveBeenCalledWith('⚡ Building application...')
  expect(blueprint).toBe(context.blueprint)
})

it('GenerateServerFileMiddleware should generate server.mjs from template', async () => {
  const context: any = {
    blueprint: {
      get: vi.fn().mockReturnValue(true)
    }
  }
  const next = vi.fn().mockResolvedValue(context.blueprint)

  const blueprint = await GenerateServerFileMiddleware(context, next)

  expect(outputFileSync).toHaveBeenCalledWith(
    buildPath('tmp/server.mjs'),
    serverIndexFile(true),
    'utf-8'
  )
  expect(blueprint).toBe(context.blueprint)
})

it('GenerateServerFileMiddleware should replace placeholder if file exists', async () => {
  vi.mocked(readFileSync).mockReturnValue("print = '%printUrls%'")
  vi.mocked(existsSync).mockReturnValue(true)

  const context: any = {
    blueprint: {
      get: vi.fn().mockReturnValue(false)
    }
  }
  const next = vi.fn().mockResolvedValue(context.blueprint)

  const blueprint = await GenerateServerFileMiddleware(context, next)

  expect(readFileSync).toHaveBeenCalled()
  expect(outputFileSync).toHaveBeenCalledWith(
    buildPath('tmp/server.mjs'),
    'print = false',
    'utf-8'
  )
  expect(blueprint).toBe(context.blueprint)
})

it('BundleServerAppMiddleware should bundle server app using rollup', async () => {
  const context: any = {
    blueprint: {
      get: vi.fn()
        .mockReturnValueOnce('server.mjs') // output path
        .mockReturnValueOnce({}) // rollup config
    },
    commandOutput: {
      show: vi.fn(),
      format: { green: (msg: string) => msg }
    }
  }

  const next = vi.fn().mockResolvedValue(context.blueprint)
  const write = vi.fn().mockResolvedValue(undefined)

  vi.mocked(getRollupConfig).mockResolvedValue({
    input: '',
    output: {},
    write
  } as any)

  const blueprint = await BundleServerAppMiddleware(context, next)

  expect(getRollupConfig).toHaveBeenCalledWith(context.blueprint, 'bundle')
  expect(context.commandOutput.show).toHaveBeenCalledWith('🚀 Bundling application...')
  expect(next).toHaveBeenCalledWith(context)
  expect(blueprint).toBe(context.blueprint)
})

it('BuildTerminatingMiddleware should remove tmp folder and call next', async () => {
  const context: any = { blueprint: {} }
  const next = vi.fn().mockResolvedValue(context.blueprint)

  const blueprint = await BuildTerminatingMiddleware(context, next)

  expect(removeSync).toHaveBeenCalledWith(buildPath('tmp'))
  expect(next).toHaveBeenCalledWith(context)
  expect(blueprint).toBe(context.blueprint)
})
