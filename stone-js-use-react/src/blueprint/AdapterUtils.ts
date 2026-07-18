import {
  AdapterErrorPageType,
  AdapterErrorPageClass,
  AdapterErrorPageOptions,
  FactoryAdapterErrorPage
} from '../declarations'
import { UseReactBlueprint } from '../options/UseReactBlueprint'

/**
 * Utility function to define a factory-based adapter error page.
 *
 * @param module - The adapter error page module.
 * @param options - Optional adapter error page options.
 * @returns The UseReactBlueprint.
 */
export function defineAdapterErrorPage (
  module: FactoryAdapterErrorPage<unknown, unknown, unknown>,
  options?: AdapterErrorPageOptions,
): UseReactBlueprint

/**
 * Utility function to define a class-based adapter error page.
 *
 * @param module - The adapter error page module.
 * @param options - Adapter error page options.
 * @returns The UseReactBlueprint.
 */
export function defineAdapterErrorPage (
  module: AdapterErrorPageClass<unknown, unknown, unknown>,
  options: AdapterErrorPageOptions & { isClass: boolean },
): UseReactBlueprint

/**
 * Utility function to define an adapter error page.
 *
 * @param module - The adapter error page module.
 * @param options - Optional adapter error page options.
 * @returns The UseReactBlueprint.
 */
export function defineAdapterErrorPage (
  module: AdapterErrorPageType<unknown, unknown, unknown>,
  options?: AdapterErrorPageOptions & { isClass?: boolean }
): UseReactBlueprint {
  const error = options?.error ?? 'default'
  const adapterErrorPages = Object.fromEntries([error].flat().map((err) => [
    err,
    {
      ...options,
      module,
      error: err,
      isFactory: options?.isClass !== true
    }
  ]))

  return {
    stone: {
      useReact: {
        adapterErrorPages
      }
    }
  }
}
