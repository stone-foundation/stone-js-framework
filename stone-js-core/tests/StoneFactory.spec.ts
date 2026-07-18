import { Logger } from '../src/logger/Logger'
import { IncomingEvent } from '../src/events/IncomingEvent'
import { MetadataSymbol } from '../src/decorators/Metadata'
import { StoneFactory, stoneApp } from '../src/StoneFactory'
import { defineConfig } from '../src/blueprint/BlueprintUtils'
import { IntegrationError } from '../src/errors/IntegrationError'
import { BlueprintBuilder } from '../src/blueprint/BlueprintBuilder'
import { CONFIGURATION_KEY, CONFIG_MIDDLEWARE_KEY, LIFECYCLE_HOOK_KEY, BLUEPRINT_KEY } from '../src/decorators/constants'

vi.mock('../src/blueprint/BlueprintUtils', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    defineConfig: vi.fn(actual.defineConfig)
  }
})

vi.mock('../src/logger/Logger', () => ({
  Logger: {
    init: vi.fn(),
    getInstance: vi.fn(() => ({ info: vi.fn() }))
  }
}))

vi.mock('../src/blueprint/BlueprintBuilder', () => {
  return {
    BlueprintBuilder: {
      create: vi.fn().mockReturnValue({
        build: vi.fn().mockResolvedValue({}) // returns mock blueprint
      })
    }
  }
})

describe('StoneFactory', () => {
  describe('create & configure', () => {
    it('should create an instance with default empty modules', () => {
      const factory = StoneFactory.create()
      // @ts-expect-error access private
      expect(factory.modules).toEqual([])
    })

    it('should create an instance with provided modules', () => {
      const modules = [{ test: true }]
      const factory = StoneFactory.create({ modules })
      // @ts-expect-error access private
      expect(factory.modules).toEqual(modules)
    })

    it('should push config middleware via .configure()', () => {
      const configFn = vi.fn()
      const factory = StoneFactory.create()
      factory.configure(configFn)

      // @ts-expect-error access private
      expect(factory.modules.length).toBe(1)
      expect(defineConfig).toHaveBeenCalledWith(configFn)
    })

    it('should support chainable configure()', () => {
      const factory = StoneFactory.create().configure(() => {}).configure(() => {})
      // @ts-expect-error access private
      expect(factory.modules.length).toBe(2)
    })
  })

  describe('handle()', () => {
    it('should store the handler and delegate to run()', async () => {
      const handler = vi.fn()
      const runSpy = vi.fn().mockResolvedValue('mock-result')

      const factory = StoneFactory.create<IncomingEvent, any>()

      // Inject mocked .run method
      factory.run = runSpy

      const result = await factory.handle(handler)

      // Handler should be stored in blueprint
      // @ts-expect-error accessing private
      const stored = factory.blueprint.get('stone.kernel.eventHandler')
      expect(stored).toBe(handler)

      expect(runSpy).toHaveBeenCalled()
      expect(result).toBe('mock-result')
    })
  })

  describe('run()', () => {
    it('should run blueprint + logger + builder + adapter lifecycle', async () => {
      const runMock = vi.fn().mockResolvedValue('mock-response')

      const adapterMock = {
        run: runMock
      }

      const factory = StoneFactory.create()

      // Inject a fake adapter resolver
      // @ts-expect-error access private
      factory.blueprint.set('stone.adapter.resolver', () => adapterMock)

      const result = await factory.run()

      // @ts-expect-error access private
      expect(Logger.init).toHaveBeenCalledWith(factory.blueprint)
      // @ts-expect-error access private
      expect(BlueprintBuilder.create).toHaveBeenCalledWith(factory.blueprint)
      expect(result).toBe('mock-response')
    })

    it('should re-initialise the logger AFTER the blueprint build so a user resolver wins', async () => {
      const adapterMock = { run: vi.fn().mockResolvedValue('mock-response') }
      const initSpy: any = Logger.init
      const buildSpy: any = (BlueprintBuilder.create as any)().build
      initSpy.mockClear()
      buildSpy.mockClear()

      const factory = StoneFactory.create()
      // @ts-expect-error access private
      factory.blueprint.set('stone.adapter.resolver', () => adapterMock)

      await factory.run()

      // Bootstrap init (before build) + final init (after build): the default logger can no
      // longer shadow a resolver contributed during the build.
      expect(initSpy).toHaveBeenCalledTimes(2)
      const finalInitOrder = initSpy.mock.invocationCallOrder[1]
      const buildOrder = buildSpy.mock.invocationCallOrder[0]
      expect(finalInitOrder).toBeGreaterThan(buildOrder)
    })
  })

  describe('resolveAdapter()', () => {
    it('should throw if resolver is missing from blueprint', () => {
      const factory = StoneFactory.create()

      expect(() => {
        // @ts-expect-error
        factory.resolveAdapter()
      }).toThrow(IntegrationError)
    })

    it('should throw if resolver returns undefined', () => {
      const factory = StoneFactory.create()
      // @ts-expect-error
      factory.blueprint.set('stone.adapter.resolver', () => undefined)

      expect(() => {
        // @ts-expect-error
        factory.resolveAdapter()
      }).toThrow(IntegrationError)
    })

    it('should return adapter if resolver resolves correctly', () => {
      const adapterMock = { run: vi.fn() }
      const factory = StoneFactory.create()

      // @ts-expect-error
      factory.blueprint.set('stone.adapter.resolver', () => adapterMock)

      // @ts-expect-error
      const resolved = factory.resolveAdapter()

      expect(resolved).toBe(adapterMock)
    })
  })

  describe('initBlueprint()', () => {
    it('should inject plain blueprint objects', async () => {
      const plainBlueprint = { stone: { foo: 'bar' } }
      const factory = StoneFactory.create({ modules: [plainBlueprint] })

      // @ts-expect-error access private
      await factory.initBlueprint()

      // @ts-expect-error access private
      expect(factory.blueprint.get('stone.foo')).toBe('bar')
    })

    it('should register blueprint via @StoneApp metadata', async () => {
      const AppClass = class {
        handle (): void {}
        public static [MetadataSymbol] = { [BLUEPRINT_KEY]: { stone: { name: 'world' } } }
      }

      const factory = stoneApp({ modules: [AppClass] })

      // @ts-expect-error access private
      await factory.initBlueprint()

      // @ts-expect-error access private
      expect(factory.blueprint.get('stone.name')).toBe('world')
    })

    it('should register lifecycle hooks via @Hook metadata', async () => {
      const methodSpy = vi.fn()
      class MyHook {
        methodRef (): void {
          methodSpy()
        }

        public static [MetadataSymbol] = {
          [LIFECYCLE_HOOK_KEY]: [
            { name: 'onInit', method: 'methodRef' }
          ]
        }
      }

      const factory = stoneApp({ modules: [MyHook] })
      // @ts-expect-error access private
      await factory.initBlueprint()

      // @ts-expect-error access private
      const hooks = factory.blueprint.get<Array<(...a: any[]) => unknown>>('stone.lifecycleHooks.onInit', [])
      expect(hooks.length).toBe(1)
      expect(typeof hooks[0]).toBe('function')

      // Invoke it: the hook binds to a lazily-created instance (not the prototype).
      hooks[0]()
      expect(methodSpy).toHaveBeenCalled()
    })

    it('should register blueprint middleware via @ConfigMiddleware', async () => {
      const MiddlewareClass = class {
        handle (): void {}
        public static [MetadataSymbol] = {
          [CONFIG_MIDDLEWARE_KEY]: { priority: 1 }
        }
      }

      const factory = StoneFactory.create({ modules: [MiddlewareClass] })
      // @ts-expect-error access private
      await factory.initBlueprint()

      // @ts-expect-error access private
      const middleware = factory.blueprint.get('stone.blueprint.middleware', [])
      expect(middleware[0]).toEqual(expect.objectContaining({
        module: MiddlewareClass,
        priority: 1
      }))
    })

    it('should run configure and afterConfigure from @Configuration', async () => {
      const configure = vi.fn()
      const afterConfigure = vi.fn()

      class ConfigClass {
        configure = configure
        afterConfigure = afterConfigure
        public static [MetadataSymbol] = {
          [CONFIGURATION_KEY]: { live: false }
        }
      }

      const factory = StoneFactory.create({ modules: [ConfigClass] })
      // @ts-expect-error access private
      await factory.initBlueprint()
      expect(configure).toHaveBeenCalled()
      // @ts-expect-error access private
      const hook = factory.blueprint.get('stone.lifecycleHooks.onBlueprintPrepared', [])
      expect(hook[0]).toBeDefined()
    })

    it('should register live configs if live: true', async () => {
      const LiveConfig = class {
        configure (): void {}
        public static [MetadataSymbol] = {
          [CONFIGURATION_KEY]: { live: true }
        }
      }

      const factory = StoneFactory.create({ modules: [LiveConfig] })
      // @ts-expect-error access private
      await factory.initBlueprint()
      // @ts-expect-error access private
      const live = factory.blueprint.get('stone.liveConfigurations', [])
      expect(live[0]).toEqual(expect.objectContaining({ module: LiveConfig }))
    })

    it('should execute afterConfigure hook when blueprint is prepared', async () => {
      const afterConfigure = vi.fn()

      class ConfigClass {
        configure (): void {}

        afterConfigure = afterConfigure

        public static [MetadataSymbol] = {
          [CONFIGURATION_KEY]: { live: false }
        }
      }

      const factory = StoneFactory.create({ modules: [ConfigClass] })

      // @ts-expect-error private
      await factory.initBlueprint()

      // @ts-expect-error private
      const hooks = factory.blueprint.get<((k: BlueprintContext) => Promise<void>)[]>(
        'stone.lifecycleHooks.onBlueprintPrepared',
        []
      )

      expect(hooks).toHaveLength(1)

      // @ts-expect-error private
      const blueprint = factory.blueprint

      await hooks[0]({ blueprint })

      expect(afterConfigure).toHaveBeenCalledTimes(1)
      expect(afterConfigure).toHaveBeenCalledWith(blueprint)
    })
  })

  it('should ignore modules that are neither blueprint nor constructor', async () => {
    const factory = StoneFactory.create({
      modules: ['random-string', 123, true]
    })

    // @ts-expect-error private
    await factory.initBlueprint()

    // simplement vérifier qu'aucune erreur n'est lancée
    // et qu'aucune configuration n'a été ajoutée
    // @ts-expect-error private
    expect(factory.blueprint.get('stone.lifecycleHooks')).toBeUndefined()
  })

  it('should ignore empty lifecycle hook options', async () => {
    class EmptyHook {
      methodRef (): void {}

      public static [MetadataSymbol] = {
        [LIFECYCLE_HOOK_KEY]: [
          undefined,
          null,
          {}
        ]
      }
    }

    const factory = stoneApp({ modules: [EmptyHook] })

    // @ts-expect-error private
    await factory.initBlueprint()

    // @ts-expect-error private
    const hooks = factory.blueprint.get('stone.lifecycleHooks.onInit', [])

    expect(hooks).toEqual([])
  })

  it('should not register onBlueprintPrepared hook when afterConfigure is missing', async () => {
    class ConfigClass {
      configure (): void {}

      public static [MetadataSymbol] = {
        [CONFIGURATION_KEY]: { live: false }
      }
    }

    const factory = StoneFactory.create({
      modules: [ConfigClass]
    })

    // @ts-expect-error private
    await factory.initBlueprint()

    // @ts-expect-error private
    const hooks = factory.blueprint.get(
      'stone.lifecycleHooks.onBlueprintPrepared',
      []
    )

    expect(hooks).toEqual([])
  })
})
