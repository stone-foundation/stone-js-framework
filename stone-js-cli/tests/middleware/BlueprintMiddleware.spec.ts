import { NODE_CONSOLE_PLATFORM } from '@stone-js/node-cli-adapter'
import { getStoneBuilderConfig, getEnvVariables } from '../../src/utils'
import { LoadStoneConfigMiddleware, LoadDotenvVariablesMiddleware, SetCliCommandsMiddleware, metaCLIBlueprintMiddleware } from '../../src/middleware/BlueprintMiddleware'

vi.mock('../../src/utils', async () => {
  const actual = await vi.importActual<any>('../../src/utils')
  return {
    ...actual,
    getStoneBuilderConfig: vi.fn(),
    getEnvVariables: vi.fn()
  }
})

describe('BlueprintMiddleware', () => {
  let context: any
  let next: any

  beforeEach(() => {
    vi.clearAllMocks()

    context = {
      blueprint: {
        get: vi.fn(),
        set: vi.fn(),
        add: vi.fn()
      }
    }

    next = vi.fn(async (ctx) => ctx.blueprint)
  })

  it('should load and set stone.builder config', async () => {
    vi.mocked(getStoneBuilderConfig).mockResolvedValue({ foo: 'bar' } as any)

    const result = await LoadStoneConfigMiddleware(context, next)

    expect(getStoneBuilderConfig).toHaveBeenCalled()
    expect(context.blueprint.set).toHaveBeenCalledWith('stone.builder', { foo: 'bar' })
    expect(result).toBe(context.blueprint)
    expect(next).toHaveBeenCalledWith(context)
  })

  it('should load dotenv variables from config', async () => {
    context.blueprint.get.mockReturnValue({
      options: { PUBLIC: true },
      private: { SECRET: 'yes' }
    })

    await LoadDotenvVariablesMiddleware(context, next)

    expect(getEnvVariables).toHaveBeenCalledWith({ PUBLIC: true, SECRET: 'yes' })
    expect(next).toHaveBeenCalledWith(context)
  })

  it('should not throw if dotenv config is undefined', async () => {
    context.blueprint.get.mockReturnValue(undefined)

    await expect(LoadDotenvVariablesMiddleware(context, next)).resolves.toBe(context.blueprint)
    expect(getEnvVariables).toHaveBeenCalledWith({})
  })

  it('should add CLI commands when platform is NODE_CONSOLE_PLATFORM', async () => {
    context.blueprint.get.mockReturnValue(NODE_CONSOLE_PLATFORM)

    await SetCliCommandsMiddleware(context, next)

    expect(context.blueprint.add).toHaveBeenCalledWith(
      'stone.adapter.commands',
      expect.arrayContaining([
        expect.objectContaining({ module: expect.any(Function), options: expect.any(Object), isClass: true })
      ])
    )

    expect(next).toHaveBeenCalledWith(context)
  })

  it('should not add CLI commands if platform is not NODE_CONSOLE_PLATFORM', async () => {
    context.blueprint.get.mockReturnValue('other-platform')

    await SetCliCommandsMiddleware(context, next)

    expect(context.blueprint.add).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith(context)
  })

  it('should expose CLI middleware in correct priority order', () => {
    expect(metaCLIBlueprintMiddleware).toEqual([
      { priority: 1, module: SetCliCommandsMiddleware },
      { priority: 2, module: LoadStoneConfigMiddleware },
      { priority: 3, module: LoadDotenvVariablesMiddleware }
    ])
  })
})
