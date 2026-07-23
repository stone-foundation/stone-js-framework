import fsExtra from 'fs-extra'
import simpleGit from 'simple-git'
import { execFileSync } from 'child_process'
import { CliError } from '../../src/errors/CliError'
import { getAvailableStarters, materializeStarter } from '../../src/create/StarterContract'
import { deriveVanilla } from '../../src/create/vanilla'
import { CloneStarterMiddleware, ConfigureTestingMiddleware, ConvertToVanillaMiddleware, FinalizeMiddleware, InstallDependenciesMiddleware } from '../../src/create/CreateAppMiddleware'

vi.mock('../../src/create/StarterContract', () => ({
  getAvailableStarters: vi.fn(),
  materializeStarter: vi.fn()
}))

vi.mock('../../src/create/vanilla', () => ({
  deriveVanilla: vi.fn(() => ['/dest/my-app/app/Application.js'])
}))

vi.mock('fs-extra', () => ({
  default: {
    copySync: vi.fn(),
    existsSync: vi.fn(),
    removeSync: vi.fn(),
    renameSync: vi.fn(),
    readJsonSync: vi.fn(),
    writeJsonSync: vi.fn(),
    pathExistsSync: vi.fn()
  }
}))

vi.mock('node:child_process', () => ({
  execFileSync: vi.fn()
}))

vi.mock('simple-git', () => ({
  default: vi.fn(() => ({
    clone: vi.fn()
  }))
}))

vi.mock('@stone-js/filesystem', async () => ({
  basePath: (...args: string[]) => `/dest/${args.join('/')}`,
  tmpPath: (...args: string[]) => `/tmp/${args.join('/')}`
}))

const mockContext: any = {
  blueprint: {
    get: vi.fn((key: string, fallback?: any) => {
      if (key === 'stone.createApp') {
        return { overwrite: false, projectName: 'my-app', template: 'basic-service-declarative' }
      }
      if (key === 'stone.createApp.startersRepo') return 'https://example.com/repo.git'
      return fallback
    }),
    add: vi.fn()
  },
  commandOutput: {
    info: vi.fn(),
    format: { green: (s: string) => s, blue: (s: string) => s, red: (s: string) => s }
  }
}

const next: any = vi.fn(async () => 'next-called')

describe('CloneStarterMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws if destination exists and overwrite is false', async () => {
    vi.mocked(fsExtra.pathExistsSync).mockReturnValue(true)

    await expect(CloneStarterMiddleware(mockContext, next)).rejects.toThrow(CliError)
    expect(fsExtra.pathExistsSync).toHaveBeenCalled()
  })

  it('resolves an available starter, materialises it, and adds to blueprint', async () => {
    vi.mocked(fsExtra.existsSync).mockReturnValue(true)
    vi.mocked(fsExtra.pathExistsSync).mockReturnValue(false)
    vi.mocked(fsExtra.readJsonSync).mockReturnValue({ name: 'test' })
    vi.mocked(getAvailableStarters).mockImplementation(async (_bp: any, ctx: any) => {
      ctx.output.info('collecting') // exercises the inline info callback
      return [{ value: 'basic-service-declarative', provider: 'p', dir: '/d', path: '.' }]
    })

    const result = await CloneStarterMiddleware(mockContext, next)

    expect(fsExtra.removeSync).toHaveBeenCalled()
    expect(materializeStarter).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'basic-service-declarative' }),
      expect.any(String)
    )
    expect(fsExtra.readJsonSync).toHaveBeenCalled()
    expect(mockContext.blueprint.add).toHaveBeenCalledWith('stone.createApp', expect.objectContaining({
      destDir: expect.any(String),
      packageJson: { name: 'test' }
    }))
    expect(result).toBe('next-called')
  })

  it('falls back to the first available starter when the template is unknown', async () => {
    vi.mocked(fsExtra.pathExistsSync).mockReturnValue(false)
    vi.mocked(fsExtra.readJsonSync).mockReturnValue({ name: 'test' })
    vi.mocked(getAvailableStarters).mockResolvedValue([{ value: 'other', provider: 'p', dir: '/d', path: '.' }])
    mockContext.blueprint.get.mockImplementation((key: string) =>
      key === 'stone.createApp' ? { overwrite: true, projectName: 'my-app', template: 'does-not-exist' } : undefined
    )

    await CloneStarterMiddleware(mockContext, next)
    expect(materializeStarter).toHaveBeenCalledWith(expect.objectContaining({ value: 'other' }), expect.any(String))
  })

  it('throws when no starter is available', async () => {
    vi.mocked(fsExtra.pathExistsSync).mockReturnValue(false)
    vi.mocked(getAvailableStarters).mockResolvedValue([])
    await expect(CloneStarterMiddleware(mockContext, next)).rejects.toThrow(CliError)
  })
})

describe('InstallDependenciesMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(mockContext.blueprint.get).mockReturnValue({
      testing: 'vitest',
      destDir: '/dest/my-app',
      modules: ['@stone-js/core'],
      packageManager: 'npm'
    })
  })

  it('should throw an exception if package manager is not supported', async () => {
    vi.mocked(mockContext.blueprint.get).mockReturnValue({
      testing: 'vitest',
      destDir: '/dest/my-app',
      modules: ['@stone-js/core'],
      packageManager: 'patate'
    })
    await expect(InstallDependenciesMiddleware(mockContext, next)).rejects.toThrow(CliError)
  })

  it('executes install command with testing dependencies using npm', async () => {
    const result = await InstallDependenciesMiddleware(mockContext, next)

    expect(mockContext.commandOutput.info).toHaveBeenCalledWith('Installing packages. This might take a while...')
    expect(execFileSync).toHaveBeenCalledWith(
      'npm',
      ['install', '@stone-js/core', 'vitest', '@vitest/coverage-v8'],
      { cwd: '/dest/my-app', shell: false, stdio: 'inherit' }
    )
    expect(result).toBe('next-called')
  })

  it('re-reads package.json after install so the chosen modules survive finalize', async () => {
    const installed = { name: 'app', dependencies: { '@stone-js/core': '^0.8.3', '@stone-js/router': '^0.8.3' } }
    vi.mocked(fsExtra.readJsonSync).mockReturnValue(installed)

    await InstallDependenciesMiddleware(mockContext, next)

    // The freshly-installed manifest (with the modules) must be pushed back onto the blueprint,
    // otherwise FinalizeMiddleware would rewrite the stale pre-install copy and drop the modules.
    expect(mockContext.blueprint.add).toHaveBeenCalledWith('stone.createApp', { packageJson: installed })
  })

  it('uses yarn if selected as package manager', async () => {
    mockContext.blueprint.get.mockReturnValue({
      testing: 'jest',
      destDir: '/dest/my-app',
      modules: ['@stone-js/core'],
      packageManager: 'yarn'
    })

    await InstallDependenciesMiddleware(mockContext, next)

    expect(execFileSync).toHaveBeenCalledWith(
      'yarn',
      ['add', '@stone-js/core', 'jest'],
      { cwd: '/dest/my-app', shell: false, stdio: 'inherit' }
    )
  })
})

describe('ConfigureTestingMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockContext.blueprint.get.mockReturnValue({
      typing: 'vanilla',
      testing: 'vitest',
      destDir: '/dest/my-app',
      packageJson: {
        scripts: {
          test: 'vitest run',
          'test:cvg': 'vitest run --coverage'
        }
      }
    })
  })

  it('renames vitest config to JS if typing is vanilla and testing is vitest', async () => {
    await ConfigureTestingMiddleware(mockContext, next)

    expect(fsExtra.renameSync).toHaveBeenCalledWith(
      '/dest/my-app/vitest.config.ts',
      '/dest/my-app/vitest.config.js'
    )
    expect(fsExtra.removeSync).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith(mockContext)
  })

  it('removes test scripts and vitest config if testing is not vitest', async () => {
    mockContext.blueprint.get.mockReturnValue({
      testing: 'none',
      destDir: '/dest/my-app',
      packageJson: {
        scripts: {
          test: 'vitest run',
          'test:cvg': 'vitest run --coverage'
        }
      }
    })

    await ConfigureTestingMiddleware(mockContext, next)

    expect(fsExtra.removeSync).toHaveBeenCalledWith('/dest/my-app/vitest.config.ts')
    expect(mockContext.blueprint.get().packageJson.scripts).not.toHaveProperty('test')
    expect(mockContext.blueprint.get().packageJson.scripts).not.toHaveProperty('test:cvg')
  })
})

describe('FinalizeMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockContext.commandOutput.breakLine = vi.fn()
    mockContext.commandOutput.succeed = vi.fn()
    mockContext.commandOutput.show = vi.fn()

    mockContext.blueprint.get.mockReturnValue({
      packageJson: { name: 'my-app' },
      destDir: '/path/to/my-app',
      projectName: 'my-app',
      packageManager: 'npm',
      initGit: true
    })
  })

  it('writes package.json and initializes git repo if requested', async () => {
    const mockGit = {
      init: vi.fn().mockResolvedValue(undefined),
      add: vi.fn().mockResolvedValue(undefined),
      commit: vi.fn().mockResolvedValue(undefined)
    }

    vi.mocked(simpleGit).mockReturnValue(mockGit as any)

    await FinalizeMiddleware(mockContext, next)

    expect(fsExtra.writeJsonSync).toHaveBeenCalledWith(
      '/path/to/my-app/package.json',
      { name: 'my-app' },
      { spaces: 2 }
    )

    expect(mockGit.init).toHaveBeenCalled()
    expect(mockGit.add).toHaveBeenCalledWith('.')
    expect(mockGit.commit).toHaveBeenCalledWith('Initial commit')
    expect(mockContext.commandOutput.succeed).toHaveBeenCalledWith(
      'Successfully created Stone\'s project "my-app"'
    )
    expect(next).toHaveBeenCalledWith(mockContext)
  })

  it('skips git initialization if initGit is false', async () => {
    mockContext.blueprint.get.mockReturnValue({
      packageJson: { name: 'my-app' },
      destDir: '/path/to/my-app',
      projectName: 'my-app',
      packageManager: 'yarn',
      initGit: false
    })

    await FinalizeMiddleware(mockContext, next)

    expect(fsExtra.writeJsonSync).toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith(mockContext)
  })
})

describe('ConvertToVanillaMiddleware', () => {
  beforeEach(() => {
    vi.mocked(deriveVanilla).mockClear()
    next.mockClear()
  })

  it('derives the app to vanilla JavaScript when typing is vanilla', async () => {
    mockContext.blueprint.get.mockReturnValue({ typing: 'vanilla', destDir: '/dest/my-app' })

    await ConvertToVanillaMiddleware(mockContext, next)

    expect(deriveVanilla).toHaveBeenCalledWith('/dest/my-app/app')
    expect(next).toHaveBeenCalledWith(mockContext)
  })

  it('does nothing when typing is not vanilla', async () => {
    mockContext.blueprint.get.mockReturnValue({ typing: 'typescript', destDir: '/dest/my-app' })

    await ConvertToVanillaMiddleware(mockContext, next)

    expect(deriveVanilla).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith(mockContext)
  })

  it('does nothing when the destination directory is missing', async () => {
    mockContext.blueprint.get.mockReturnValue({ typing: 'vanilla', destDir: '' })

    await ConvertToVanillaMiddleware(mockContext, next)

    expect(deriveVanilla).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith(mockContext)
  })
})
