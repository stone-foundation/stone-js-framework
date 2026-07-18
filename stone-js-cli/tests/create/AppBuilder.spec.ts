import { Pipeline } from '@stone-js/pipeline'
import { AppBuilder } from '../../src/create/AppBuilder'
import { Questionnaire } from '../../src/create/Questionnaire'

vi.mock('../../src/create/Questionnaire', () => ({
  Questionnaire: {
    create: vi.fn().mockReturnValue({
      getAnswers: vi.fn().mockResolvedValue({ language: 'typescript' })
    })
  }
}))

vi.mock('@stone-js/pipeline', async (mod) => {
  const actual: any = await mod()
  return {
    ...actual,
    Pipeline: {
      create: vi.fn(() => ({
        send: vi.fn().mockReturnThis(),
        through: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation(caller => caller({ blueprint: mockBlueprint }))
      }))
    }
  }
})

const mockBlueprint = {
  set: vi.fn(),
  get: vi.fn()
}

const mockContext: any = {
  blueprint: mockBlueprint,
  commandOutput: { log: vi.fn(), error: vi.fn() }
}

const mockEvent = {
  get: vi.fn().mockImplementation((key: string, fallback?: any) => {
    const map: any = {
      yes: false,
      force: true,
      'project-name': 'awesome-app'
    }
    return map[key] ?? fallback
  })
}

describe('AppBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sets user options and runs questionnaire if `yes` is not set', async () => {
    const builder = new AppBuilder(mockContext)
    await builder.build(mockEvent as any)

    expect(mockEvent.get).toHaveBeenCalledWith('force')
    expect(mockEvent.get).toHaveBeenCalledWith('project-name')
    expect(mockBlueprint.set).toHaveBeenCalledWith('stone.createApp.overwrite', true)
    expect(mockBlueprint.set).toHaveBeenCalledWith('stone.createApp.projectName', 'awesome-app')
    expect(Questionnaire.create).toHaveBeenCalledWith(mockContext)
    expect(mockBlueprint.set).toHaveBeenCalledWith('stone.createApp', { language: 'typescript' })
    expect(Pipeline.create).toHaveBeenCalled()
  })

  it('parses the --starters option into a list of links', async () => {
    const builder = new AppBuilder(mockContext)
    mockEvent.get = vi.fn().mockImplementation((key: string, fallback?: any) => {
      const map: any = { yes: true, force: false, 'project-name': 'app', starters: 'github:o/r, @acme/s ' }
      return map[key] ?? fallback
    })

    await builder.build(mockEvent as any)

    expect(mockBlueprint.set).toHaveBeenCalledWith('stone.createApp.starters', ['github:o/r', '@acme/s'])
  })

  it('skips questionnaire if `yes` is true', async () => {
    const builder = new AppBuilder(mockContext)
    mockEvent.get = vi.fn().mockImplementation((key: string, fallback?: any) => {
      const map: any = {
        yes: true,
        force: true,
        'project-name': 'quick-app'
      }
      return map[key] ?? fallback
    })

    await builder.build(mockEvent as any)

    expect(Questionnaire.create).not.toHaveBeenCalled()
    expect(mockBlueprint.set).toHaveBeenCalledWith('stone.createApp.overwrite', true)
    expect(mockBlueprint.set).toHaveBeenCalledWith('stone.createApp.projectName', 'quick-app')
  })
})
