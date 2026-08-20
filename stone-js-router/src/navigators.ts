import { NAVIGATION_EVENT } from './constants'
import { NavigationContext } from './declarations'
import { RouterError } from './errors/RouterError'

/**
 * The browser navigation effect: push (or replace) a History entry, then announce it.
 *
 * The announcement is what closes the loop: the browser adapter listens for
 * `NAVIGATION_EVENT` (and `popstate`), so a navigation re-enters the kernel as a new
 * incoming event, and the page for the new path is resolved the same way the first one
 * was. Nothing here is imported by the router's matching code, so a platform that has no
 * History API simply supplies its own navigator.
 *
 * @param context - The resolved navigation intent.
 * @throws {RouterError} When called outside a browser environment.
 */
export const browserNavigator = ({ path, replace, options }: NavigationContext): void => {
  // `typeof` guard: referencing a bare, undeclared `window` in Node throws a
  // ReferenceError before the check runs, defeating the universality guard.
  if (typeof window === 'undefined') {
    throw new RouterError('This method can only be used in a browser environment')
  }

  const state = { ...options, path }

  replace
    ? window.history.replaceState(state, '', path)
    : window.history.pushState(state, '', path)

  window.dispatchEvent(new CustomEvent(NAVIGATION_EVENT, { detail: state }))
}
