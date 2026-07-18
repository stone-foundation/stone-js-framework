import { Argv } from 'yargs'
import { IncomingEvent } from '@stone-js/core'

vi.mock('../../src/utils', async () => {
  const actual = await vi.importActual<any>('../../src/utils')
  return {
    ...actual,
    isReactApp: vi.fn(),
    setupProcessSignalHandlers: vi.fn()
  }
})

const ReactBuilderPreview = vi.fn()
const ServerBuilderPreview = vi.fn()

vi.mock('../../src/react/ReactBuilder', () => ({
  ReactBuilder: class {
    preview = ReactBuilderPreview
  }
}))

vi.mock('../../src/server/ServerBuilder', () => ({
  ServerBuilder: class {
    preview = ServerBuilderPreview
  }
}))

vi.mock('@stone-js/filesystem', () => ({
  basePath: vi.fn(),
  buildPath: vi.fn(),
  distPath: vi.fn()
}))

vi.mock('fs-extra', () => ({
  default: {
    pathExistsSync: vi.fn()
  }
}))

describe('PreviewCommand', async () => {
  let PreviewCommand: any
  let previewCommandOptions: any
  let buildPath: any
  let distPath: any
  let basePath: any
  let pathExistsSync: any
  let spawnMock: any
  let context: any
  let event: IncomingEvent

  beforeEach(async () => {
    vi.resetModules()

    spawnMock = vi.fn(() => ({
      on: vi.fn()
    }))
    vi.doMock('cross-spawn', () => ({
      default: spawnMock
    }))

    const mod = await import('../../src/commands/PreviewCommand')
    PreviewCommand = mod.PreviewCommand
    previewCommandOptions = mod.previewCommandOptions

    const fs = await import('@stone-js/filesystem')
    buildPath = fs.buildPath
    distPath = fs.distPath
    basePath = fs.basePath

    const fsExtra = await import('fs-extra')
    pathExistsSync = fsExtra.default.pathExistsSync

    const utils = await import('../../src/utils')
    vi.mocked(utils.isReactApp).mockReturnValue(true)
    buildPath.mockReturnValue('/build/preview.mjs')
    distPath.mockReturnValue('/dist/index.mjs')

    context = {
      blueprint: {
        meta: {},
        get: vi.fn((_key: string, fallback?: unknown) => fallback)
      }
    }

    event = {
      type: 'cli',
      payload: {},
      get: vi.fn()
    } as unknown as IncomingEvent
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should spawn file if valid filename is provided', async () => {
    event.get = vi.fn().mockReturnValue('foo.ts')
    basePath.mockReturnValue('/my/path/foo.ts')
    pathExistsSync.mockReturnValue(true)

    const cmd = new PreviewCommand(context)
    await cmd.handle(event)

    expect(basePath).toHaveBeenCalledWith('foo.ts')
    expect(pathExistsSync).toHaveBeenCalledWith('/my/path/foo.ts')
    expect(spawnMock).toHaveBeenCalledWith('node', ['foo.ts'], {
      stdio: 'inherit',
      cwd: '/my/path'
    })
  })

  it('should preview react app if no valid file and isReactApp is true', async () => {
    event.get = vi.fn().mockReturnValue(undefined)
    pathExistsSync.mockReturnValue(false)

    const cmd = new PreviewCommand(context)
    await cmd.handle(event)

    expect(ReactBuilderPreview).toHaveBeenCalledWith(event)
    expect(spawnMock).toHaveBeenCalledWith('node', ['/build/preview.mjs'], {
      stdio: 'inherit',
      cwd: undefined
    })
  })

  it('should preview server app if isReactApp is false', async () => {
    const utils = await import('../../src/utils')
    vi.mocked(utils.isReactApp).mockReturnValue(false)

    event.get = vi.fn().mockReturnValue(undefined)
    pathExistsSync.mockReturnValue(false)

    const cmd = new PreviewCommand(context)
    await cmd.handle(event)

    expect(ServerBuilderPreview).toHaveBeenCalledWith(event)
    expect(spawnMock).toHaveBeenCalledWith('node', ['/dist/index.mjs'], {
      stdio: 'inherit',
      cwd: undefined
    })
  })

  it('should define correct CLI metadata', () => {
    expect(previewCommandOptions.name).toBe('preview')
    expect(previewCommandOptions.alias).toBe('p')
    expect(previewCommandOptions.args).toEqual(['[filename]'])
    expect(previewCommandOptions.desc).toBe('Run project in preview mode')
  })

  it('should apply yargs options with casting', () => {
    const mockYargs = {
      positional: vi.fn().mockReturnThis(),
      option: vi.fn().mockReturnThis()
    }

    const fn = previewCommandOptions.options as ((args: Argv<any>) => Argv<any>)
    const result = fn(mockYargs as any)

    expect(mockYargs.positional).toHaveBeenCalledWith('filename', {
      type: 'string',
      desc: 'file path to preview'
    })

    expect(mockYargs.option).toHaveBeenCalledWith('target', {
      alias: 't',
      type: 'string',
      desc: 'app target to preview',
      choices: ['server', 'react']
    })

    expect(result).toBe(mockYargs)
  })
})
