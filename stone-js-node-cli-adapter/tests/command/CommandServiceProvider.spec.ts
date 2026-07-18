import { NODE_CONSOLE_PLATFORM } from '../../src/constants'
import { CommandInput } from '../../src/command/CommandInput'
import { CommandOutput } from '../../src/command/CommandOutput'
import { CommandServiceProvider } from '../../src/command/CommandServiceProvider'

describe('CommandServiceProvider', () => {
  let container: any
  let blueprint: any
  let provider: CommandServiceProvider

  beforeEach(() => {
    container = {
      singleton: vi.fn().mockReturnThis(),
      alias: vi.fn().mockReturnThis()
    }

    blueprint = {
      get: vi.fn()
    }

    provider = new CommandServiceProvider({ container, blueprint })
  })

  describe('mustSkip()', () => {
    it('should return false if platform is NODE_CONSOLE_PLATFORM', () => {
      blueprint.get.mockReturnValue(NODE_CONSOLE_PLATFORM)
      expect(provider.mustSkip()).toBe(false)
    })

    it('should return true if platform is not NODE_CONSOLE_PLATFORM', () => {
      blueprint.get.mockReturnValue('web')
      expect(provider.mustSkip()).toBe(true)
    })
  })

  describe('register()', () => {
    it('should register CommandInput and CommandOutput as singletons with aliases', () => {
      provider.register()

      // CommandInput
      expect(container.singleton).toHaveBeenCalledWith(
        CommandInput,
        expect.any(Function)
      )
      expect(container.alias).toHaveBeenCalledWith(CommandInput, 'commandInput')

      // CommandOutput
      expect(container.singleton).toHaveBeenCalledWith(
        CommandOutput,
        expect.any(Function)
      )
      expect(container.alias).toHaveBeenCalledWith(CommandOutput, 'commandOutput')
    })
  })

  describe('registerCommandUtils()', () => {
    it('should return `this` to allow chaining', () => {
      const result = (provider as any).registerCommandUtils()
      expect(result).toBe(provider)
    })
  })
})
