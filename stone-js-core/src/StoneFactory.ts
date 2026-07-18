import {
  IAdapter,
  ClassType,
  HookOptions,
  AdapterResolver,
  BlueprintContext,
  MixedEventHandler,
  FunctionalConfiguration
} from './declarations'
import { Logger } from './logger/Logger'
import { Config } from '@stone-js/config'
import { IncomingEvent } from './events/IncomingEvent'
import { StoneBlueprint } from './options/StoneBlueprint'
import { defineConfig } from './blueprint/BlueprintUtils'
import { OutgoingResponse } from './events/OutgoingResponse'
import { IntegrationError } from './errors/IntegrationError'
import { BlueprintBuilder } from './blueprint/BlueprintBuilder'
import { isConstructor, isEmpty, isNotEmpty, isStoneBlueprint } from './utils'
import { hasBlueprint, getBlueprint, hasMetadata, getMetadata } from './decorators/Metadata'
import { CONFIG_MIDDLEWARE_KEY, CONFIGURATION_KEY, LIFECYCLE_HOOK_KEY } from './decorators/constants'

/**
 * Stone factory options.
 */
export interface StoneFactoryOptions {
  modules?: unknown[]
}

/**
 * StoneFactory.
 *
 * This class provides a fluent interface for building Stone applications.
 * It is responsible for creating and running the main application by resolving
 * the appropriate adapter from the provided blueprint. It handles the core setup of the application.
 *
 * @template TEvent, UResponse
 */
export class StoneFactory<TEvent extends IncomingEvent, UResponse extends OutgoingResponse> {
  private readonly modules: unknown[]
  private readonly blueprint: Config<StoneBlueprint<TEvent, UResponse>>

  /**
   * Create a new StoneFactory instance.
   *
   * @param options - The options to create the StoneFactory.
   * @returns A new StoneFactory instance.
   *
   * @example
   * ```typescript
   * const stone = StoneFactory.create({ modules: [\/* your modules *\/] });
   * ```
   */
  public static create<TEvent extends IncomingEvent, UResponse extends OutgoingResponse>(
    options: StoneFactoryOptions = {}
  ): StoneFactory<TEvent, UResponse> {
    return new this(options)
  }

  /**
   * Create a new StoneFactory instance.
   *
   * @param options - The options to create the StoneFactory.
   */
  private constructor ({ modules = [] }: StoneFactoryOptions = {}) {
    this.modules = modules
    this.blueprint = Config.create()
  }

  /**
   * Configure the application using the blueprint resolver.
   * Use this method to add custom configurations to the application.
   *
   * @param configuration - The user-defined blueprint configuration.
   * @returns The current StoneFactory instance.
   */
  configure (
    configuration:
    | FunctionalConfiguration
    | Partial<Record<'configure' | 'afterConfigure', FunctionalConfiguration>>
  ): this {
    this.modules.push(defineConfig(configuration))
    return this
  }

  /**
   * Handle application events.
   * This method is a shorthand for running the application with the provided event handler.
   *
   * @param handler - The application event handler function.
   * @returns The platform-specific response.
   */
  async handle<ExecutionResultType = unknown>(handler: MixedEventHandler<TEvent, unknown>): Promise<ExecutionResultType> {
    this.blueprint.set('stone.kernel.eventHandler', handler)
    return await this.run()
  }

  /**
   * Run the application.
   * Populates the blueprint via introspection and runs the application.
   *
   * @returns The platform-specific response.
   */
  async run<ExecutionResultType = unknown>(): Promise<ExecutionResultType> {
    // Initialize the blueprint.
    // The first step is to set up the blueprint with the provided modules.
    await this.initBlueprint()
    // Bootstrap logger: the blueprint builder logs during its run, so it needs a logger
    // before the build. This honours any logger config already present (plain blueprints,
    // `@StoneApp`) and falls back to the ConsoleLogger otherwise.
    Logger.init(this.blueprint)
    // Populate the blueprint with modules.
    await BlueprintBuilder.create(this.blueprint).build(this.modules)
    // Re-initialise the logger against the fully-populated blueprint so a user-defined
    // resolver contributed during the build (e.g. via `@Configuration`) takes effect and
    // is not shadowed by the default logger.
    Logger.init(this.blueprint)
    // Run the application using the resolved adapter.
    return await this.resolveAdapter().run<ExecutionResultType>()
  }

  /**
   * Initialize the blueprint by processing the provided modules.
   * This method extracts metadata and configurations from the modules and populates the blueprint.
   *
   * @returns A promise that resolves when the blueprint is initialized.
   */
  private async initBlueprint (): Promise<void> {
    for (const module of this.modules) {
      if (isStoneBlueprint(module)) { // Blueprint configuration (Plain object)
        this.blueprint.set(module)
      } else if (isConstructor<ClassType>(module)) {
        if (hasBlueprint(module)) { // From @StoneApp()
          this.blueprint.set(getBlueprint(module, { stone: {} }))
        }

        if (hasMetadata(module, LIFECYCLE_HOOK_KEY)) { // From @Hook()
          this.registerLifecycleHooks(module)
        }

        if (hasMetadata(module, CONFIG_MIDDLEWARE_KEY)) { // From @ConfigMiddleware()
          const options = getMetadata(module, CONFIG_MIDDLEWARE_KEY, {})
          this.blueprint.add('stone.blueprint.middleware', [{ ...options, module }])
        }

        if (hasMetadata(module, CONFIGURATION_KEY)) { // From @Configuration()
          await this.initBlueprintConfigurations(module)
        }
      }
    }
  }

  /**
   * Register lifecycle hooks for the given module.
   * This method extracts lifecycle hook metadata from the module and adds it to the blueprint.
   *
   * @param module - The module to register lifecycle hooks for.
   */
  private registerLifecycleHooks (module: ClassType): void {
    // Bind hooks to a real (lazily-created) instance, not the prototype, so class-field
    // initializers run and `this` resolves to an instance rather than `undefined`.
    let instance: Record<string, (...args: any[]) => unknown> | undefined
    const getInstance = (): Record<string, (...args: any[]) => unknown> => {
      return (instance ??= new (module as unknown as new () => Record<string, (...args: any[]) => unknown>)())
    }

    getMetadata<ClassType, HookOptions[]>(module, LIFECYCLE_HOOK_KEY, []).forEach(options => {
      if (isNotEmpty<HookOptions>(options)) {
        this.blueprint.add(
          `stone.lifecycleHooks.${options.name}`,
          [(...args: any[]) => getInstance()[options.method](...args)]
        )
      }
    })
  }

  /**
   * Initialize blueprint configurations for the given module.
   * This method extracts configuration metadata from the module and applies it to the blueprint.
   *
   * @param module - The module to initialize configurations for.
   */
  private async initBlueprintConfigurations (module: ClassType): Promise<void> {
    const options = getMetadata(module, CONFIGURATION_KEY, { live: false })

    if (!options.live) {
      const configuration = new module.prototype.constructor()
      await configuration.configure?.(this.blueprint)

      if (isNotEmpty<Function>(configuration.afterConfigure)) {
        this.blueprint.add(
          'stone.lifecycleHooks.onBlueprintPrepared',
          [({ blueprint }: BlueprintContext) => configuration.afterConfigure(blueprint)]
        )
      }
    } else {
      this.blueprint.add('stone.liveConfigurations', [{ ...options, module }])
    }
  }

  /**
   * Resolve the adapter instance from the blueprint.
   *
   * @returns The resolved adapter instance.
   * @throws {IntegrationError} If no adapter resolver or adapter is provided in the blueprint.
   */
  private resolveAdapter (): IAdapter {
    const resolver = this.blueprint.get<AdapterResolver>('stone.adapter.resolver')

    if (isEmpty(resolver)) {
      throw new IntegrationError(
        'No adapter resolver provided. Ensure that a valid adapter resolver is configured under "stone.adapter.resolver" in the blueprint configuration.'
      )
    }

    const adapter = resolver(this.blueprint)

    if (isEmpty(adapter)) {
      throw new IntegrationError('No adapters provided. Stone.js needs at least one adapter to run.')
    }

    return adapter
  }
}

/**
 * Create a new Stone instance with the given options.
 *
 * This function creates a new Stone instance with the provided options.
 * It allows you to configure the application using the StoneFactory.
 *
 * @template U, V
 * @param options - The options to create the Stone instance.
 * @returns A new StoneFactory instance.
 */
export function stoneApp<
  U extends IncomingEvent,
  V extends OutgoingResponse
> (options: StoneFactoryOptions = {}): StoneFactory<U, V> {
  return StoneFactory.create(options)
}
