import {
  Arrayable,
  IBlueprint,
  IConfiguration,
  MetaMiddleware,
  MiddlewareType,
  MiddlewareClass,
  EventHandlerType,
  BlueprintContext,
  FactoryMiddleware,
  EventHandlerClass,
  ConfigurationClass,
  FactoryEventHandler,
  FunctionalMiddleware,
  FunctionalEventHandler,
  FunctionalConfiguration
} from '../declarations'
import { IncomingEvent } from '../events/IncomingEvent'
import { MetadataSymbol } from '../decorators/Metadata'
import { CONFIGURATION_KEY } from '../decorators/constants'
import { AppConfig, stoneBlueprint, StoneBlueprint } from '../options/StoneBlueprint'
import { isFunctionModule, isNotEmpty, isObjectLikeModule, mergeBlueprints } from '../utils'

/**
 * Declares a complete Stone application blueprint using a function-based event handler.
 *
 * @param module - A function as an event handler.
 * @param options - Application-level configuration.
 * @param blueprints - Additional partial blueprints to merge.
 * @returns A fully merged Stone blueprint.
 */
export function defineStoneApp<U extends IncomingEvent = IncomingEvent> (
  module: FunctionalEventHandler<U>,
  options?: Partial<AppConfig<U>> & { isClass?: undefined, isFactory?: undefined },
  blueprints?: Array<StoneBlueprint<any, any> & Record<string, any>>
): StoneBlueprint<U>

/**
 * Declares a complete Stone application blueprint using a factory-based event handler.
 *
 * @param module - A factory function that returns an event handler.
 * @param options - Application-level configuration with `{ isFactory: true }`.
 * @param blueprints - Additional partial blueprints to merge.
 * @returns A fully merged Stone blueprint.
 */
export function defineStoneApp<U extends IncomingEvent = IncomingEvent> (
  module: FactoryEventHandler<U>,
  options: Partial<AppConfig<U>> & { isFactory: true, isClass?: undefined },
  blueprints?: Array<StoneBlueprint<any, any> & Record<string, any>>
): StoneBlueprint<U>

/**
 * Declares a complete Stone application blueprint using a class-based event handler.
 *
 * @param module - A class constructor for the event handler.
 * @param options - Application-level configuration with `{ isClass: true }`.
 * @param blueprints - Additional partial blueprints to merge.
 * @returns A fully merged Stone blueprint.
 */
export function defineStoneApp<U extends IncomingEvent = IncomingEvent> (
  module: EventHandlerClass<U>,
  options: Partial<AppConfig<U>> & { isClass: true, isFactory?: undefined },
  blueprints?: Array<StoneBlueprint<any, any> & Record<string, any>>
): StoneBlueprint<U>

/**
 * Defines a Stone app without a main handler (router-only).
 *
 * @param options - Application-level configuration.
 * @param blueprints - Additional partial blueprints to merge.
 * @returns A fully merged Stone blueprint.
 */
export function defineStoneApp<U extends IncomingEvent = IncomingEvent> (
  options?: Partial<AppConfig<U>>,
  blueprints?: Array<StoneBlueprint<any, any> & Record<string, any>>
): StoneBlueprint<U>

/**
 * Defines a Stone app using a function-based, factory-based or class-based main handler.
 *
 * @param moduleOrOptions - A function, factory function or class constructor for the main page.
 * @param optionsOrBlueprints - Optional application-level configuration.
 * @param maybeBlueprints - Additional blueprints to merge.
 * @returns A fully merged Stone blueprint.
 */
export function defineStoneApp<U extends IncomingEvent = IncomingEvent> (
  moduleOrOptions: EventHandlerType<U> | Partial<AppConfig<U>> = {},
  optionsOrBlueprints?:
  | (Partial<AppConfig<U>> & { isFactory?: boolean, isClass?: boolean })
  | Array<StoneBlueprint<any, any> & Record<string, any>>,
  maybeBlueprints?: Array<StoneBlueprint<any, any> & Record<string, any>>
): StoneBlueprint<U> {
  let module: EventHandlerType<U> | undefined
  let blueprints: Array<StoneBlueprint<any, any> & Record<string, any>> = []
  let options: Partial<AppConfig<U>> & { isFactory?: boolean, isClass?: boolean } = {}

  // Pattern: defineStoneApp(handler, options?, blueprints?)
  if (isFunctionModule<EventHandlerType<U>>(moduleOrOptions)) {
    module = moduleOrOptions

    if (
      isObjectLikeModule<Partial<AppConfig<U>>>(optionsOrBlueprints)
    ) {
      options = optionsOrBlueprints
      blueprints = Array.isArray(maybeBlueprints) ? maybeBlueprints : []
    }
  } else if (
    isObjectLikeModule<Partial<AppConfig<U>>>(moduleOrOptions)
  ) { // Pattern: defineStoneApp(options, blueprints?)
    options = moduleOrOptions
    blueprints = Array.isArray(optionsOrBlueprints) ? optionsOrBlueprints : []
  }

  const stonePart: Record<string, any> = {
    ...options,
    kernel: {
      ...options.kernel
    }
  }

  if (isNotEmpty(module)) {
    stonePart.kernel.eventHandler = {
      module,
      isClass: options.isClass,
      isFactory: options.isFactory
    }
  }

  return mergeBlueprints<U>(
    stoneBlueprint,
    ...blueprints,
    { stone: stonePart }
  )
}

/**
 * Defines an application blueprint by merging user-defined blueprints with default options.
 *
 * This function allows users to define their own blueprints and merges them with
 * the default blueprint options provided by the framework.
 * It ensures that all necessary properties are available while allowing user customizations.
 *
 * @param configuration - The user-defined blueprint configuration.
 * @returns The fully defined application blueprint.
 *
 * @example
 * ```typescript
 * const appBlueprint = defineConfig((blueprint) => {
 *   blueprint.set('stone.name', 'MyApp')
 * });
 * ```
 */
export function defineConfig (
  configuration:
  | FunctionalConfiguration
  | Partial<Record<'configure' | 'afterConfigure', FunctionalConfiguration>>
): ConfigurationClass {
  let configure: FunctionalConfiguration
  let afterConfigure: FunctionalConfiguration

  if (isFunctionModule<FunctionalConfiguration>(configuration)) {
    configure = configuration
    afterConfigure = () => {}
  } else {
    configure = configuration.configure ?? (() => {})
    afterConfigure = configuration.afterConfigure ?? (() => {})
  }

  return class implements IConfiguration {
    configure = configure
    afterConfigure = afterConfigure
    static readonly [MetadataSymbol] = { [CONFIGURATION_KEY]: { isClass: true } }
  }
}

/**
 * Utility function to define a function-based blueprint middleware.
 *
 * @param module - The Middleware module.
 * @param options - The options for the Middleware.
 * @returns The StoneBlueprint.
 */
export function defineBlueprintMiddleware (
  module: Arrayable<FunctionalMiddleware<BlueprintContext, IBlueprint>>,
  options?: { params?: any[], priority?: number, isFactory?: undefined, isClass?: undefined }
): Partial<StoneBlueprint>

/**
 * Utility function to define a factory-based blueprint middleware.
 *
 * @param module - The Middleware module.
 * @param options - The options for the Middleware.
 * @returns The StoneBlueprint.
 */
export function defineBlueprintMiddleware (
  module: Arrayable<FactoryMiddleware<BlueprintContext, IBlueprint>>,
  options: { params?: any[], priority?: number, isFactory: true, isClass?: undefined }
): Partial<StoneBlueprint>

/**
 * Utility function to define a class-based blueprint middleware.
 *
 * @param module - The Middleware module.
 * @param options - The options for the Middleware.
 * @returns The StoneBlueprint.
 */
export function defineBlueprintMiddleware (
  module: Arrayable<MiddlewareClass<BlueprintContext, IBlueprint>>,
  options: { params?: any[], priority?: number, isClass: true, isFactory?: undefined }
): Partial<StoneBlueprint>

/**
 * Utility function to define a blueprint middleware.
 *
 * @param module - The Middleware module.
 * @param options - The options for the Middleware.
 * @returns The StoneBlueprint.
 */
export function defineBlueprintMiddleware (
  module: Arrayable<MiddlewareType<BlueprintContext, IBlueprint>>,
  options: { params?: any[], priority?: number, isFactory?: boolean, isClass?: boolean } = {}
): Partial<StoneBlueprint> {
  const middleware: Array<MetaMiddleware<BlueprintContext, IBlueprint>> = [module].flat().map((item) => ({
    ...options,
    module: item
  }))

  return {
    stone: {
      blueprint: {
        middleware
      }
    }
  }
}
