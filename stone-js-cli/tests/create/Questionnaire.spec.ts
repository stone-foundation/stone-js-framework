import fsExtra from 'fs-extra'
import { CancellationError } from '../../src/errors/CancellationError'
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

  it('does not ask for the starter when --starter already named one', async () => {
    mockInput.ask.mockResolvedValue('my-app')
    mockInput.confirm.mockResolvedValue(true)
    mockInput.choice.mockResolvedValueOnce('typescript') // typing
      .mockResolvedValueOnce('npm') // packageManager (the template question is skipped)
      .mockResolvedValueOnce([]) // modules
      .mockResolvedValueOnce('vitest') // testing

    mockContext.blueprint.get.mockImplementation((key: string, fallback?: any) => {
      if (key === 'stone.createApp.template') return 'basic-react-declarative'
      if (key === 'stone.createApp.templateExplicit') return true
      return fallback
    })

    const questionnaire = Questionnaire.create(mockContext)
    const result = await questionnaire.getAnswers()

    // The flag wins and the user is never asked to contradict it.
    expect(result.template).toBe('basic-react-declarative')
    expect(mockInput.choice).not.toHaveBeenCalledWith('Starter template: ', expect.anything(), expect.anything())
  })

  it('should cancel if overwrite is false', async () => {
    mockContext.blueprint.get.mockImplementation((key: string) => {
      if (key === 'stone.createApp.projectName') return 'existing-app'
      if (key === 'stone.createApp.overwrite') return undefined
    })

    mockInput.confirm.mockResolvedValueOnce(false)

    vi.mocked(pathExistsSync).mockReturnValue(true)

    const questionnaire = Questionnaire.create(mockContext)

    await expect(questionnaire.getAnswers()).rejects.toThrow(CancellationError)
    // Nothing else is asked, so nothing is written: refusing to overwrite leaves the directory as
    // it was, which is precisely what the user asked for by saying no.
    expect(mockInput.choice).not.toHaveBeenCalled()
  })

  it('should cancel if user declines final confirmation', async () => {
    mockContext.blueprint.get.mockReturnValue(undefined)
    mockInput.ask.mockResolvedValue('my-app')
    mockInput.choice.mockResolvedValueOnce('typescript')
      .mockResolvedValueOnce('template')
      .mockResolvedValueOnce('npm')
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce('vitest')
    mockInput.confirm.mockResolvedValueOnce(true) // initGit
    mockInput.confirm.mockResolvedValueOnce(false) // final confirmation

    vi.mocked(pathExistsSync).mockReturnValueOnce(false)

    const questionnaire = Questionnaire.create(mockContext)

    // Answering the whole questionnaire and then declining is a decision, not a breakage: the type
    // is what lets the error handler exit `0` instead of printing a crash wall.
    await expect(questionnaire.getAnswers()).rejects.toThrow(CancellationError)
  })

  it('treats an abandoned prompt as a cancellation, and stops asking', async () => {
    // Ctrl-C does not end the process: `prompts` resolves with nothing. Left unchecked, the
    // questionnaire would keep asking and then scaffold from answers nobody gave.
    mockContext.blueprint.get.mockReturnValue(undefined)
    mockInput.ask.mockResolvedValue(undefined)

    vi.mocked(pathExistsSync).mockReturnValue(false)

    const questionnaire = Questionnaire.create(mockContext)

    await expect(questionnaire.getAnswers()).rejects.toThrow(CancellationError)
    expect(mockInput.choice).not.toHaveBeenCalled()
    expect(mockInput.confirm).not.toHaveBeenCalled()
  })

  it('treats an abandoned choice the same way', async () => {
    mockContext.blueprint.get.mockReturnValue(undefined)
    mockInput.ask.mockResolvedValue('my-app')
    mockInput.choice.mockResolvedValue(undefined)

    vi.mocked(pathExistsSync).mockReturnValue(false)

    const questionnaire = Questionnaire.create(mockContext)

    await expect(questionnaire.getAnswers()).rejects.toThrow(CancellationError)
  })

  it('keeps an empty selection as a real answer', async () => {
    // Choosing no module and no test framework must not look like an abandoned prompt: those come
    // back as `[]` and `''`, and only a truly abandoned one comes back as nothing.
    mockContext.blueprint.get.mockReturnValue(undefined)
    mockInput.ask.mockResolvedValue('my-app')
    mockInput.choice.mockResolvedValueOnce('typescript')
      .mockResolvedValueOnce('template')
      .mockResolvedValueOnce('npm')
      .mockResolvedValueOnce([]) // no module
      .mockResolvedValueOnce('') // no test framework
    mockInput.confirm.mockResolvedValue(true)

    vi.mocked(pathExistsSync).mockReturnValue(false)

    const result = await Questionnaire.create(mockContext).getAnswers()

    expect(result).toEqual(expect.objectContaining({ modules: [], testing: '', confirmation: true }))
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
