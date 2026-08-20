import { internalUseReactNativeBlueprint } from '../options/UseReactNativeBlueprint'
import { isFunctionModule, isNotEmpty, isObjectLikeModule, mergeBlueprints, stoneBlueprint, StoneBlueprint } from '@stone-js/core'
import { FactoryPage, PageClass, PageType, ReactIncomingEvent, UseReactAppConfig } from '@stone-js/use-react-core'

/**
 * Define a native Stone.js application whose entry screen is a factory page.
 *
 * @param module - A factory function for the entry screen.
 * @param options - Optional application-level configuration.
 * @param blueprints - Additional blueprints to merge, typically the adapter's.
 * @returns A fully merged Stone blueprint.
 */
export function defineStoneReactNativeApp<U extends ReactIncomingEvent = ReactIncomingEvent> (
  module: FactoryPage<U>,
  options?: Partial<UseReactAppConfig>,
  blueprints?: Array<StoneBlueprint<any, any> & Record<string, any>>
): StoneBlueprint<U>

/**
 * Define a native Stone.js application whose entry screen is a class page.
 *
 * @param module - A class constructor for the entry screen.
 * @param options - Application-level configuration, with `isClass`.
 * @param blueprints - Additional blueprints to merge.
 * @returns A fully merged Stone blueprint.
 */
export function defineStoneReactNativeApp<U extends ReactIncomingEvent = ReactIncomingEvent> (
  module: PageClass<U>,
  options: Partial<UseReactAppConfig> & { isClass: boolean },
  blueprints?: Array<StoneBlueprint<any, any> & Record<string, any>>
): StoneBlueprint<U>

/**
 * Define a native Stone.js application with no entry screen, routing only.
 *
 * @param options - Application-level configuration.
 * @param blueprints - Additional blueprints to merge.
 * @returns A fully merged Stone blueprint.
 */
export function defineStoneReactNativeApp<U extends ReactIncomingEvent = ReactIncomingEvent> (
  options?: Partial<UseReactAppConfig>,
  blueprints?: Array<StoneBlueprint<any, any> & Record<string, any>>
): StoneBlueprint<U>

/**
 * Define a native Stone.js application.
 *
 * The imperative counterpart of `@UseReactNative()`, and deliberately the same signature as
 * the web renderer's `defineStoneReactApp`: an application moving to a phone changes which
 * function it calls and nothing else.
 *
 * @param moduleOrOptions - The entry screen, or the configuration.
 * @param optionsOrBlueprints - The configuration, or the blueprints.
 * @param maybeBlueprints - The blueprints.
 * @returns A fully merged Stone blueprint.
 */
export function defineStoneReactNativeApp<U extends ReactIncomingEvent = ReactIncomingEvent> (
  moduleOrOptions: PageType<U> | Partial<UseReactAppConfig> = {},
  optionsOrBlueprints?: (Partial<UseReactAppConfig> & { isClass?: boolean }) | Array<StoneBlueprint<any, any> & Record<string, any>>,
  maybeBlueprints?: Array<StoneBlueprint<any, any> & Record<string, any>>
): StoneBlueprint<ReactIncomingEvent> {
  let module: PageClass<U> | FactoryPage<U> | undefined
  let options: Partial<UseReactAppConfig> & { isClass?: boolean } = {}
  let blueprints: Array<StoneBlueprint<any, any> & Record<string, any>> = []

  // Pattern: defineStoneReactNativeApp(handler, options?, blueprints?)
  if (isFunctionModule<PageClass<U> | FactoryPage<U>>(moduleOrOptions)) {
    module = moduleOrOptions

    if (isObjectLikeModule<Partial<UseReactAppConfig>>(optionsOrBlueprints)) {
      options = optionsOrBlueprints
      blueprints = Array.isArray(maybeBlueprints) ? maybeBlueprints : []
    }
  } else if (isObjectLikeModule<Partial<UseReactAppConfig>>(moduleOrOptions)) {
    // Pattern: defineStoneReactNativeApp(options, blueprints?)
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
    internalUseReactNativeBlueprint,
    ...blueprints,
    { stone: stonePart }
  )
}
