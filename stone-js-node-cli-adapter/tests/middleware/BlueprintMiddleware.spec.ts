import {
  SetConsoleCommandMiddleware,
  SetNodeCliResponseResolverMiddleware,
  SetConsoleRouterEventHandlerMiddleware
} from '../../src/middleware/BlueprintMiddleware'
import { NODE_CONSOLE_PLATFORM } from '../../src/constants'
import { COMMAND_KEY } from '../../src/decorators/constants'
import { MetaCommandRouterEventHandler } from '../../src/command/CommandRouterEventHandler'
import { MetadataSymbol, STONE_APP_KEY, BlueprintContext, IBlueprint, OutgoingResponse } from '@stone-js/core'

/* eslint-disable @typescript-eslint/no-extraneous-class */

// Mocks
const mockBlueprint = (platform?: string): IBlueprint => {
  const store = new Map<string, any>()
  store.set('stone.adapter.platform', platform)
  return {
    get: vi.fn(key => store.get(key)),
    set: vi.fn((key, value) => {
      store.set(key, value)
      return value
    }),
    add: vi.fn((key, value) => {
      const current = store.get(key) ?? []
      store.set(key, [...current, ...value])
    })
  } as unknown as IBlueprint
}

const createContext = (platform?: string, modules: any[] = []): BlueprintContext<IBlueprint, any> => ({
  blueprint: mockBlueprint(platform),
  modules
})

describe('Adapter Middleware', () => {
  let next: any

  beforeEach(() => {
    next = vi.fn(async ctx => ctx.blueprint)
  })

  describe('SetConsoleCommandMiddleware', () => {
    it('should register command modules with metadata when platform is NODE_CONSOLE_PLATFORM', async () => {
      class MyCommand {
        static [MetadataSymbol] = { [COMMAND_KEY]: { name: 'test', isClass: true } }
      }

      const context = createContext(NODE_CONSOLE_PLATFORM, [MyCommand])
      const blueprint = await SetConsoleCommandMiddleware(context, next)

      expect(context.blueprint.add).toHaveBeenCalledWith('stone.adapter.commands', [
        { name: 'test', module: MyCommand, isClass: true }
      ])
      expect(next).toHaveBeenCalled()
      expect(blueprint).toBe(context.blueprint)
    })

    it('should do nothing if platform is not console', async () => {
      const context = createContext('other-platform')
      const blueprint = await SetConsoleCommandMiddleware(context, next)

      expect(next).toHaveBeenCalled()
      expect(blueprint).toBe(context.blueprint)
      expect(context.blueprint.add).not.toHaveBeenCalled()
    })
  })

  describe('SetConsoleRouterEventHandlerMiddleware', () => {
    it('should set MetaCommandRouterEventHandler if platform is NODE_CONSOLE_PLATFORM and module has app key', async () => {
      class MyConsoleEventHandler {
        handle (): void {}
        static [MetadataSymbol] = { [STONE_APP_KEY]: true }
      }

      const context = createContext(NODE_CONSOLE_PLATFORM, [MyConsoleEventHandler])
      const blueprint = await SetConsoleRouterEventHandlerMiddleware(context, next)

      expect(context.blueprint.set).toHaveBeenCalledWith('stone.kernel.eventHandler', MetaCommandRouterEventHandler)
      expect(context.blueprint.add).toHaveBeenCalledWith('stone.adapter.commands', [
        { module: MyConsoleEventHandler, options: { name: '*' }, isClass: true }
      ])
      expect(next).toHaveBeenCalled()
      expect(blueprint).toBe(context.blueprint)
    })

    it('should only set event handler if no app module with handle', async () => {
      const context = createContext(NODE_CONSOLE_PLATFORM, [])
      const blueprint = await SetConsoleRouterEventHandlerMiddleware(context, next)

      expect(next).toHaveBeenCalled()
      expect(blueprint).toBe(context.blueprint)
      expect(context.blueprint.add).not.toHaveBeenCalled()
      expect(context.blueprint.set).toHaveBeenCalledWith('stone.kernel.eventHandler', MetaCommandRouterEventHandler)
    })

    it('should do nothing if platform is not console', async () => {
      const context = createContext('other', [])
      const blueprint = await SetConsoleRouterEventHandlerMiddleware(context, next)

      expect(next).toHaveBeenCalled()
      expect(blueprint).toBe(context.blueprint)
      expect(context.blueprint.set).not.toHaveBeenCalled()
      expect(context.blueprint.add).not.toHaveBeenCalled()
    })
  })

  describe('SetNodeCliResponseResolverMiddleware', () => {
    it('should set skipMiddleware and responseResolver in CLI mode', async () => {
      const context = createContext(NODE_CONSOLE_PLATFORM)
      const blueprint = await SetNodeCliResponseResolverMiddleware(context, next)
      const result = context.blueprint.get('stone.kernel.responseResolver', () => {})()

      expect(next).toHaveBeenCalled()
      expect(blueprint).toBe(context.blueprint)
      expect(result).toBeInstanceOf(OutgoingResponse)
      expect(context.blueprint.set).toHaveBeenCalledWith('stone.kernel.skipMiddleware', true)
      expect(context.blueprint.set).toHaveBeenCalledWith('stone.kernel.responseResolver', expect.any(Function))
    })

    it('should do nothing if not in console platform', async () => {
      const context = createContext('other')
      const blueprint = await SetNodeCliResponseResolverMiddleware(context, next)

      expect(next).toHaveBeenCalled()
      expect(blueprint).toBe(context.blueprint)
      expect(context.blueprint.set).not.toHaveBeenCalledWith('stone.kernel.skipMiddleware', true)
    })
  })
})
