import { FactoryPage, PageClass, PageType, ReactIncomingEvent } from '../declarations'
import { UseReactAppConfig, internalUseReactBlueprint } from '../options/UseReactBlueprint'
import { isFunctionModule, isNotEmpty, isObjectLikeModule, mergeBlueprints, stoneBlueprint, StoneBlueprint } from '@stone-js/core'

/**
 * Defines a Stone React app using a factory-based main handler.
 *
 * @param module - A factory function for the main page.
 * @param options - Optional application-level configuration.
 * @param blueprints - Additional blueprints to merge.
 * @returns A fully merged Stone blueprint.
 */
export function defineStoneReactApp<U extends ReactIncomingEvent = ReactIncomingEvent> (
  module: FactoryPage<U>,
  options?: Partial<UseReactAppConfig>,
  blueprints?: Array<StoneBlueprint<any, any> & Record<string, any>>
): StoneBlueprint<U>

/**
 * Defines a Stone React app using a class-based main handler.
 *
 * @param module - A class constructor for the main page.
 * @param options - Optional application-level configuration.
 * @param blueprints - Additional blueprints to merge.
 * @returns A fully merged Stone blueprint.
 */
export function defineStoneReactApp<U extends ReactIncomingEvent = ReactIncomingEvent> (
  module: PageClass<U>,
  options: Partial<UseReactAppConfig> & { isClass: boolean },
  blueprints?: Array<StoneBlueprint<any, any> & Record<string, any>>
): StoneBlueprint<U>

/**
 * Defines a Stone React app without a main handler (router-only).
 *
 * @param options - Application-level configuration.
 * @param blueprints - Additional blueprints to merge.
 * @returns A fully merged Stone blueprint.
 */
export function defineStoneReactApp<U extends ReactIncomingEvent = ReactIncomingEvent> (
  options?: Partial<UseReactAppConfig>,
  blueprints?: Array<StoneBlueprint<any, any> & Record<string, any>>
): StoneBlueprint<U>

/**
 * Defines a Stone React app using a factory-based or class-based main handler.
 *
 * @param moduleOrOptions - A factory function or class constructor for the main page.
 * @param optionsOrBlueprints - Optional application-level configuration.
 * @param maybeBlueprints - Additional blueprints to merge.
 * @returns A fully merged Stone blueprint.
 */
export function defineStoneReactApp<U extends ReactIncomingEvent = ReactIncomingEvent> (
  moduleOrOptions: PageType<U> | Partial<UseReactAppConfig> = {},
  optionsOrBlueprints?: (Partial<UseReactAppConfig> & { isClass?: boolean }) | Array<StoneBlueprint<any, any> & Record<string, any>>,
  maybeBlueprints?: Array<StoneBlueprint<any, any> & Record<string, any>>
): StoneBlueprint<ReactIncomingEvent> {
  let module: PageClass<U> | FactoryPage<U> | undefined
  let options: Partial<UseReactAppConfig> & { isClass?: boolean } = {}
  let blueprints: Array<StoneBlueprint<any, any> & Record<string, any>> = []

  // Pattern: defineStoneReactApp(handler, options?, blueprints?)
  if (isFunctionModule<PageClass<U> | FactoryPage<U>>(moduleOrOptions)) {
    module = moduleOrOptions

    if (
      isObjectLikeModule<Partial<UseReactAppConfig>>(optionsOrBlueprints)
    ) {
      options = optionsOrBlueprints
      blueprints = Array.isArray(maybeBlueprints) ? maybeBlueprints : []
    }
  } else if (
    isObjectLikeModule<Partial<UseReactAppConfig>>(moduleOrOptions)
  ) { // Pattern: defineStoneReactApp(options, blueprints?)
    options = moduleOrOptions
    blueprints = Array.isArray(optionsOrBlueprints) ? optionsOrBlueprints : []
  }

  const stonePart: Record<string, any> = {
    ...options,
    useReact: {
      ...options.useReact
    }
  }

  if (isNotEmpty(module)) {
    stonePart.useReact.componentEventHandler = {
      module,
      isComponent: true,
      isClass: options.isClass,
      isFactory: options.isClass !== true
    }
  }

  return mergeBlueprints<ReactIncomingEvent>(
    stoneBlueprint,
    internalUseReactBlueprint,
    ...blueprints,
    { stone: stonePart }
  )
}
