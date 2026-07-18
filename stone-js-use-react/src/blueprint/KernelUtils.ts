import {
  PageType,
  PageClass,
  FactoryPage,
  PageOptions,
  ErrorPageType,
  ErrorPageClass,
  PageLayoutType,
  PageLayoutClass,
  FactoryErrorPage,
  ErrorPageOptions,
  FactoryPageLayout,
  PageLayoutOptions,
  ReactIncomingEvent
} from '../declarations'
import { GET } from '@stone-js/router'
import { Laziable, StoneBlueprint } from '@stone-js/core'
import { UseReactBlueprint } from '../options/UseReactBlueprint'

/**
 * Utility function to define a factory-based page.
 *
 * @param module - The EventHandler module.
 * @param options - Page definition options.
 * @returns The UseReactBlueprint.
 */
export function definePage<U extends ReactIncomingEvent = ReactIncomingEvent> (
  module: FactoryPage<U>,
  options: PageOptions & { isClass?: undefined }
): Partial<StoneBlueprint<U>>

/**
 * Utility function to define a class-based page.
 *
 * @param module - The EventHandler module.
 * @param options - Page definition options.
 * @returns The UseReactBlueprint.
 */
export function definePage<U extends ReactIncomingEvent = ReactIncomingEvent> (
  module: PageClass<U>,
  options: PageOptions & { isClass: true }
): Partial<StoneBlueprint<U>>

/**
 * Utility function to define a page.
 *
 * @param module - The EventHandler module.
 * @param options - Page definition options.
 * @returns The UseReactBlueprint.
 */
export function definePage<U extends ReactIncomingEvent = ReactIncomingEvent> (
  module: PageType<U> | Laziable<PageType<U>>,
  options: PageOptions & { isClass?: boolean }
): Partial<StoneBlueprint<U>> {
  return {
    stone: {
      router: {
        definitions: [
          {
            ...options,
            method: GET,
            methods: [],
            children: undefined,
            handler: {
              module,
              isComponent: true,
              layout: options?.layout,
              isClass: options?.isClass,
              isFactory: options?.isClass !== true
            }
          }
        ]
      }
    }
  }
}

/**
 * Utility function to define a factory-based page layout.
 *
 * @param module - The layout module.
 * @param options - Optional page layout definition options.
 * @returns The UseReactBlueprint.
 */
export function definePageLayout (
  module: FactoryPageLayout,
  options?: PageLayoutOptions & { isClass?: undefined }
): UseReactBlueprint

/**
 * Utility function to define a class-based page layout.
 *
 * @param module - The layout module.
 * @param options - Optional page layout definition options.
 * @returns The UseReactBlueprint.
 */
export function definePageLayout (
  module: PageLayoutClass,
  options: PageLayoutOptions & { isClass: true }
): UseReactBlueprint

/**
 * Utility function to define a page layout.
 *
 * @param module - The layout module.
 * @param options - Optional page layout definition options.
 * @returns The UseReactBlueprint.
 */
export function definePageLayout (
  module: PageLayoutType,
  options?: PageLayoutOptions & { isClass?: boolean }
): UseReactBlueprint {
  const name = options?.name ?? 'default'
  return {
    stone: {
      useReact: {
        layout: {
          [name]: {
            module,
            isClass: options?.isClass,
            isFactory: options?.isClass !== true
          }
        }
      }
    }
  }
}

/**
 * Utility function to define a factory-based error page.
 *
 * @param module - The layout module.
 * @param options - Optional page layout definition options.
 * @returns The UseReactBlueprint.
 */
export function defineErrorPage (
  module: FactoryErrorPage<ReactIncomingEvent>,
  options?: ErrorPageOptions & { isClass?: undefined }
): UseReactBlueprint

/**
 * Utility function to define a class-based error page.
 *
 * @param module - The layout module.
 * @param options - Optional page layout definition options.
 * @returns The UseReactBlueprint.
 */
export function defineErrorPage (
  module: ErrorPageClass<ReactIncomingEvent>,
  options: ErrorPageOptions & { isClass: true }
): UseReactBlueprint

/**
 * Utility function to define an error page.
 *
 * @param module - The layout module.
 * @param options - Optional page layout definition options.
 * @returns The UseReactBlueprint.
 */
export function defineErrorPage (
  module: ErrorPageType<ReactIncomingEvent>,
  options?: ErrorPageOptions & { isClass?: boolean }
): UseReactBlueprint {
  const error = options?.error ?? 'default'
  const errorPages = Object.fromEntries([error].flat().map((err) => [
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
        errorPages
      }
    }
  }
}
