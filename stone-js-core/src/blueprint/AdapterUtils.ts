import {
  ClassType,
  IBlueprint,
  MiddlewareClass,
  BlueprintContext,
  FactoryMiddleware,
  FunctionalMiddleware,
  AdapterMixedPipeType,
  AdapterErrorHandlerType,
  AdapterMiddlewareOptions,
  IAdapterErrorHandlerClass,
  AdapterErrorHandlerOptions,
  FactoryAdapterErrorHandler,
  FunctionalAdapterErrorHandler
} from '../declarations'
import { isEmpty, isNotEmpty } from '../utils'
import { NextPipe } from '@stone-js/pipeline'
import { StoneBlueprint } from '../options/StoneBlueprint'

/**
 * Defines a function-based adapter error handler.
 *
 * This overload is used for plain function handlers that handle specific adapter errors.
 *
 * @param module - The function to handle the adapter error.
 * @param options - Metadata describing when to apply the handler (e.g. platform, alias, error types).
 * @returns A blueprint partial containing registration middleware.
 */
export function defineAdapterErrorHandler<
  RawEventType = any,
  RawResponseType = any,
  ExecutionContextType = any
> (
  module: FunctionalAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType>,
  options: AdapterErrorHandlerOptions & { isFactory?: undefined, isClass?: undefined }
): Partial<StoneBlueprint>

/**
 * Defines a factory-based adapter error handler.
 *
 * This overload allows defining an adapter error handler as a factory function.
 *
 * @param module - A factory that returns the adapter error handler function.
 * @param options - Metadata describing when to apply the handler (e.g. platform, alias, error types).
 * @returns A blueprint partial containing registration middleware.
 */
export function defineAdapterErrorHandler<
  RawEventType = any,
  RawResponseType = any,
  ExecutionContextType = any
> (
  module: FactoryAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType>,
  options: AdapterErrorHandlerOptions & { isFactory: true, isClass?: undefined }
): Partial<StoneBlueprint>

/**
 * Defines a class-based adapter error handler.
 *
 * This overload allows defining an adapter error handler as a class.
 *
 * @param module - A class that implements the adapter error handler logic.
 * @param options - Metadata describing when to apply the handler (e.g. platform, alias, error types).
 * @returns A blueprint partial containing registration middleware.
 */
export function defineAdapterErrorHandler<
  RawEventType = any,
  RawResponseType = any,
  ExecutionContextType = any
> (
  module: IAdapterErrorHandlerClass<RawEventType, RawResponseType, ExecutionContextType>,
  options: AdapterErrorHandlerOptions & { isClass: true, isFactory?: undefined }
): Partial<StoneBlueprint>

/**
 * Registers an adapter error handler in the blueprint with appropriate metadata.
 *
 * This function creates and injects a middleware into the blueprint that registers
 * an error handler for a specific adapter based on platform or alias.
 *
 * @param module - The handler function, factory, or class.
 * @param options - Options including `platform`, `adapterAlias`, and `error` type(s) to handle.
 * @returns A Stone.js blueprint fragment that adds the registration middleware.
 */
export function defineAdapterErrorHandler<
  RawEventType = any,
  RawResponseType = any,
  ExecutionContextType = any
> (
  module: AdapterErrorHandlerType<RawEventType, RawResponseType, ExecutionContextType>,
  options: AdapterErrorHandlerOptions & { isFactory?: boolean, isClass?: boolean }
): Partial<StoneBlueprint> {
  const AdapterErrorHandlerMiddleware = async (
    context: BlueprintContext<IBlueprint, ClassType>,
    next: NextPipe<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
  ): Promise<IBlueprint> => {
    const blueprint = await next(context)

    if (isMatchedAdapter(blueprint, options.platform, options.adapterAlias)) {
      for (const error of Array(options.error).flat()) {
        blueprint.set(`stone.adapter.errorHandlers.${error}`, {
          ...options,
          error,
          module
        })
      }
    }

    return blueprint
  }

  return {
    stone: {
      blueprint: {
        middleware: [
          { module: AdapterErrorHandlerMiddleware }
        ]
      }
    }
  }
}

/**
 * Defines a function-based adapter middleware.
 *
 * This overload is used to register middleware as a simple function for a specific adapter platform or alias.
 *
 * @param module - The middleware function to be registered.
 * @param options - Adapter-specific metadata such as platform or alias.
 * @returns A partial blueprint with the registration middleware.
 */
export function defineAdapterMiddleware<
  ExecutionContextType = any,
  RawResponseType = any
> (
  module: FunctionalMiddleware<ExecutionContextType, RawResponseType>,
  options?: AdapterMiddlewareOptions & { isFactory?: undefined, isClass?: undefined }
): Partial<StoneBlueprint>

/**
 * Defines a factory-based adapter middleware.
 *
 * This overload registers a middleware factory function for a specific adapter platform or alias.
 *
 * @param module - The factory function that returns middleware.
 * @param options - Adapter-specific metadata such as platform or alias.
 * @returns A partial blueprint with the registration middleware.
 */
export function defineAdapterMiddleware<
  ExecutionContextType = any,
  RawResponseType = any
> (
  module: FactoryMiddleware<ExecutionContextType, RawResponseType>,
  options: AdapterMiddlewareOptions & { isFactory: true, isClass?: undefined }
): Partial<StoneBlueprint>

/**
 * Defines a class-based adapter middleware.
 *
 * This overload registers a middleware class for a specific adapter platform or alias.
 *
 * @param module - The class to be used as middleware.
 * @param options - Adapter-specific metadata such as platform or alias.
 * @returns A partial blueprint with the registration middleware.
 */
export function defineAdapterMiddleware<
  ExecutionContextType = any,
  RawResponseType = any
> (
  module: MiddlewareClass<ExecutionContextType, RawResponseType>,
  options: AdapterMiddlewareOptions & { isClass: true, isFactory?: undefined }
): Partial<StoneBlueprint>

/**
 * Registers an adapter-specific middleware in the blueprint.
 *
 * This function dynamically inserts a middleware definition into the blueprint
 * if the adapter context matches either the platform or alias (or both are undefined).
 *
 * @param module - The middleware module to register (function, factory, or class).
 * @param options - Metadata describing which adapter(s) the middleware applies to.
 * @returns A blueprint fragment that registers the middleware conditionally.
 */
export function defineAdapterMiddleware<
  ExecutionContextType = any,
  RawResponseType = any
> (
  module: AdapterMixedPipeType<ExecutionContextType, RawResponseType>,
  options?: AdapterMiddlewareOptions & { isFactory?: boolean, isClass?: boolean }
): Partial<StoneBlueprint> {
  const AdapterMiddleware = async (
    context: BlueprintContext<IBlueprint, ClassType>,
    next: NextPipe<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
  ): Promise<IBlueprint> => {
    const blueprint = await next(context)

    const matchesAdapter =
      (isEmpty(options?.adapterAlias) && isEmpty(options?.platform)) ||
      (isNotEmpty<string>(options?.platform) && blueprint.is('stone.adapter.platform', options.platform)) ||
      (isNotEmpty<string>(options?.adapterAlias) && blueprint.is('stone.adapter.alias', options.adapterAlias))

    if (matchesAdapter) {
      blueprint.add('stone.adapter.middleware', [{
        ...options,
        module
      }])
    }

    return blueprint
  }

  return {
    stone: {
      blueprint: {
        middleware: [
          { module: AdapterMiddleware }
        ]
      }
    }
  }
}

/**
 * Checks if the adapter matches the given alias or platform.
 *
 * This function evaluates whether the provided adapter alias or platform
 * matches the current blueprint context. It returns true if either is empty,
 * or if they match the blueprint's registered values.
 *
 * @param blueprint - The blueprint to check against.
 * @param platform - The platform to match.
 * @param adapterAlias - The adapter alias to match.
 * @returns True if the adapter matches, false otherwise.
 */
export function isMatchedAdapter (blueprint: IBlueprint, platform?: string, adapterAlias?: string): boolean {
  return (isEmpty(adapterAlias) && isEmpty(platform)) ||
    (isNotEmpty<string>(platform) && blueprint.is('stone.adapter.platform', platform)) ||
    (isNotEmpty<string>(adapterAlias) && blueprint.is('stone.adapter.alias', adapterAlias))
}
