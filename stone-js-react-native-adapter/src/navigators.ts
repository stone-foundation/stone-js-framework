import { NavigationSource } from './NavigationSource'

/**
 * The navigation intent a router navigator receives.
 *
 * Declared structurally rather than imported from `@stone-js/router`, so this package
 * stays usable without the router (a native application can dispatch intents to a single
 * handler, with no routing at all).
 */
export interface RouterNavigationContext {
  path: string
  replace: boolean
  options: Record<string, unknown>
}

/**
 * Build the router's navigation effect for a native application.
 *
 * This is the other half of the loop. The router resolves a destination into a path and
 * hands it here; this pushes it back into the same source the adapter listens to, so the
 * kernel resolves the new route exactly as it resolved the first one. The browser closes
 * this loop through the History API and a window event; a native application closes it
 * through the source it already owns, and needs no History API at all.
 *
 * `replace` is carried in the metadata rather than acted upon: whether replacing an entry
 * means anything is a question for the view layer's navigation stack, not for the adapter.
 *
 * @param source - The navigation source shared with the adapter.
 * @returns A router navigator.
 */
export const makeNativeNavigator = (source: NavigationSource) => {
  return ({ path, replace, options }: RouterNavigationContext): void => {
    source.navigate(path, { ...options, replace })
  }
}
