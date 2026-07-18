import fsExtra from 'fs-extra'
import { CliError } from '../../src/errors/CliError'
import { Questionnaire } from '../../src/create/Questionnaire'

const { pathExistsSync } = fsExtra

vi.mock('fs-extra', async () => {
  return {
    default: {
      pathExistsSync: vi.fn()
    }
  }
})

vi.mock('@stone-js/filesystem', async () => ({
  basePath: vi.fn()
}))

vi.mock('../../src/create/StarterContract', () => ({
  getAvailableStarters: vi.fn(async (_bp: any, ctx: any) => {
    ctx.output.info('listing starters')
    return [
      { value: 'template', title: 'Template', provider: 'p', dir: '/d', path: '.' },
      { value: 'no-title', provider: 'p', dir: '/d', path: '.' } // exercises the `title ?? value` fallback
    ]
  })
}))

const mockFormat = {
  blue: vi.fn((v: string) => `[blue]${v}`),
  green: vi.fn((v: string) => `[green]${v}`),
  red: vi.fn((v: string) => `[red]${v}`)
}

const mockInput = {
  ask: vi.fn(),
  choice: vi.fn(),
  confirm: vi.fn()
}

const mockContext: any = {
  commandInput: mockInput,
  commandOutput: {
    format: mockFormat,
    info: vi.fn()
  },
  blueprint: {
    get: vi.fn()
  }
}

describe('Questionnaire', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should collect answers with default values and confirm', async () => {
    mockInput.ask.mockResolvedValue('my-app')
    mockInput.confirm.mockResolvedValue(true)
    mockInput.choice.mockResolvedValueOnce('typescript') // typing
      .mockResolvedValueOnce('template') // template
      .mockResolvedValueOnce('npm') // packageManager
      .mockResolvedValueOnce(['@stone-js/env']) // modules
      .mockResolvedValueOnce('vitest') // testing
      .mockResolvedValueOnce(true) // initGit
    mockInput.confirm.mockResolvedValueOnce(true) // final confirmation

    mockContext.blueprint.get.mockImplementation((key: string) => {
      if (key === 'stone.createApp.projectName') return undefined
      if (key === 'stone.createApp.overwrite') return undefined
    })

    const questionnaire = Questionnaire.create(mockContext)
    const result = await questionnaire.getAnswers()

    expect(result).toEqual(expect.objectContaining({
      projectName: 'my-app',
      typing: 'typescript',
      template: 'template',
      packageManager: 'npm',
      modules: ['@stone-js/env'],
      testing: 'vitest',
      initGit: true,
      confirmation: true
    }))
  })

  it('should cancel if overwrite is false', async () => {
    mockContext.blueprint.get.mockImplementation((key: string) => {
      if (key === 'stone.createApp.projectName') return 'existing-app'
      if (key === 'stone.createApp.overwrite') return undefined
    })

    mockInput.confirm.mockResolvedValueOnce(false)

    vi.mocked(pathExistsSync).mockReturnValue(true)

    const questionnaire = Questionnaire.create(mockContext)

    await expect(questionnaire.getAnswers()).rejects.toThrow(CliError)
  })

  it('should cancel if user declines final confirmation', async () => {
    mockContext.blueprint.get.mockReturnValue(undefined)
    mockInput.confirm.mockResolvedValueOnce(true)
    mockInput.confirm.mockResolvedValueOnce(false) // final confirmation

    vi.mocked(pathExistsSync).mockReturnValueOnce(false)

    const questionnaire = Questionnaire.create(mockContext)

    await expect(questionnaire.getAnswers()).rejects.toThrow(CliError)
  })

  it('should use provided projectName and overwrite if present', async () => {
    mockContext.blueprint.get.mockImplementation((key: string) => {
      if (key === 'stone.createApp.projectName') return 'provided-name'
      if (key === 'stone.createApp.overwrite') return true
    })

    mockInput.choice.mockResolvedValue('typescript')
    mockInput.confirm.mockResolvedValue(true)

    const pathExistsSync = (await import('fs-extra')).default.pathExistsSync as any
    pathExistsSync.mockReturnValue(true)

    const questionnaire = Questionnaire.create(mockContext)
    const result = await questionnaire.getAnswers()

    expect(result.projectName).toBe('provided-name')
    expect(result.overwrite).toBe(true)
  })
})
