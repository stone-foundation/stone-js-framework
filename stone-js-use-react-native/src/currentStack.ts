import { ScreenStack } from './ScreenStack'

/**
 * The one screen stack this application decided on, reachable without an event.
 *
 * Every other way of reaching the stack goes through the service container, which is scoped to an
 * event: that is right inside a screen, and impossible at the root. `registerRootComponent` mounts
 * the root before any event exists and outside every one that follows, so a component there has no
 * container to ask, and asking anyway is how {@link StoneNativeApp} failed at boot with
 * "no Stone context found".
 *
 * So the stack is published here too, at the moment the build phase decides which one it is. This is
 * not new state: a navigation stack spans events by nature, it is already a singleton on the
 * blueprint, and this is a second door to the same object rather than a second object.
 *
 * It assumes one application per process, which is what a React Native process is.
 */
let current: ScreenStack | undefined

/**
 * Publish the stack the application will use.
 *
 * @param stack - The stack the build phase decided on.
 */
export function setCurrentScreenStack (stack: ScreenStack): void {
  current = stack
}

/**
 * The stack the application decided on, if it has booted.
 *
 * @returns The stack, or `undefined` before the build phase has run.
 */
export function getCurrentScreenStack (): ScreenStack | undefined {
  return current
}
