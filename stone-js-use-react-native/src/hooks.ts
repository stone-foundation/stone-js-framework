import { useContext, useEffect, useState } from 'react'
import { ScreenStack } from './ScreenStack'
import { HeadContext } from '@stone-js/use-view'
import { NativeRuntime } from './NativeRuntime'
import { NativeScreen, ScreenTransition } from './declarations'
import { STONE_REACT_RUNTIME, STONE_SCREEN_STACK } from './constants'
import { getCurrentScreenStack } from './currentStack'
import { UseReactNativeError } from './errors/UseReactNativeError'
import { IRouter, StoneContext, useContainer } from '@stone-js/use-react-core'

/**
 * The hooks a native screen needs on top of the shared ones.
 *
 * Everything platform-independent (`useStone`, `useEvent`, `useData`, `useRoute`,
 * `useService`, …) comes from `@stone-js/use-react-core` and is re-exported by this package,
 * so a component's imports do not change when it moves between platforms. These are the ones
 * that only mean something on a device.
 */

/**
 * The runtime of the platform you are running on.
 *
 * @returns The native runtime.
 */
export function useRuntime (): NativeRuntime {
  return useContainer().make<NativeRuntime>(STONE_REACT_RUNTIME)
}

/**
 * Set the current screen's title from within a component.
 *
 * The web counterpart applies a full head to the document. A phone has no document, so the
 * title is what survives, and it becomes the screen's title.
 *
 * @param head - The head context to apply.
 */
export function useHead (head: HeadContext): void {
  const runtime = useRuntime()

  useEffect(() => { runtime.head(head) }, [head])
}

/**
 * The navigation stack.
 *
 * @returns The screen stack.
 */
export function useScreenStack (): ScreenStack {
  // `useContext` rather than `useContainer`, deliberately: the latter throws when there is no
  // context, and having no context is the normal case here. A screen has one, because it is
  // rendered inside an event; the root component does not, because `registerRootComponent` mounts
  // it outside every event. Both must reach the same stack.
  const context = useContext(StoneContext)
  const stack = context?.container?.make<ScreenStack>(STONE_SCREEN_STACK) ?? getCurrentScreenStack()

  if (stack === undefined) {
    throw new UseReactNativeError(
      'No screen stack yet. The renderer publishes it during the build phase, so this component rendered before `stoneApp(...).run()` was called, or the renderer was never enabled with `@UseReactNative()` or its blueprint.'
    )
  }

  return stack
}

/**
 * The current screens, kept in sync with the stack.
 *
 * This is what a custom navigator subscribes to: give it the screens and it decides how to
 * display them, which is how `@react-navigation/native-stack` is driven without this package
 * depending on it.
 *
 * @returns The screens, oldest first.
 */
export function useScreens (): NativeScreen[] {
  const stack = useScreenStack()
  const [screens, setScreens] = useState<NativeScreen[]>(() => stack.all())

  useEffect(() => stack.subscribe(setScreens), [stack])

  return screens
}

/**
 * Navigate from a screen.
 *
 * It goes through the router, so the route is matched, its loader runs and its middleware
 * runs, exactly as they would for a deep link: a screen never renders another screen itself.
 *
 * `reset` empties the stack first, so the route that follows becomes the only screen. It is
 * done here rather than carried as an intent, because the router's navigation API carries
 * whether to replace and nothing more, and inventing a third channel for it would be a
 * fiction. Emptying then navigating is exactly what a reset is.
 *
 * @returns A function taking a path (or named-route options) and how it should enter the stack.
 */
export function useNavigate (): (pathOrOptions: any, transition?: ScreenTransition) => void {
  const stack = useScreenStack()
  const router = useContainer().make<IRouter>('router')

  return (pathOrOptions: any, transition: ScreenTransition = 'push') => {
    if (transition === 'reset') {
      stack.clear()
    }

    router.navigate(pathOrOptions, transition === 'replace')
  }
}

/**
 * Go back one screen, and whether that is possible.
 *
 * A native application needs both: the action for a header button, and the answer for
 * whatever handles the hardware back button, which must let the platform leave the
 * application when there is nowhere left to go.
 *
 * @returns The back action and whether it would stay inside the application.
 */
export function useGoBack (): { goBack: () => boolean, canGoBack: boolean } {
  const stack = useScreenStack()
  const screens = useScreens()

  return {
    canGoBack: screens.length > 1,
    goBack: () => {
      if (!stack.canGoBack()) { return false }
      stack.pop()
      return true
    }
  }
}
