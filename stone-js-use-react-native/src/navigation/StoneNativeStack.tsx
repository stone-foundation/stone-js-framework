import { JSX, useCallback } from 'react'
import { shouldPopStone } from './reconcile'
import { useScreens, useScreenStack } from '../hooks'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator()

/**
 * Options for {@link StoneNativeStack}.
 */
export interface StoneNativeStackOptions {
  /** What to show before the first route has been resolved. */
  fallback?: JSX.Element | null

  /**
   * Options applied to every screen, forwarded to `@react-navigation/native-stack` untouched.
   *
   * A screen's title is set from its page's `head` and does not need to be repeated here.
   */
  screenOptions?: NativeStackNavigationOptions
}

/**
 * The navigation stack, displayed by a real native navigator.
 *
 * {@link StoneNativeApp} shows the top screen and nothing more, which is what makes a first run work
 * with nothing installed. This is what an application graduates to: the platform's own transitions,
 * the swipe-back gesture, the hardware back button, and a screen keeping its own state while another
 * covers it. None of that can be imitated in JavaScript.
 *
 * **The pages do not change.** Stone's stack is still the truth, the router still resolves every
 * route, and this component only displays what landed. What it adds is the other direction: a gesture
 * is a navigation the framework has not heard about yet, so it is reported back (see
 * {@link shouldPopStone}).
 *
 * Behind `@stone-js/use-react-native/navigation`, so `@react-navigation/native` and its own native
 * dependencies stay optional: an application that is happy with the floor installs none of them.
 *
 * @example
 * ```sh
 * npx expo install @react-navigation/native @react-navigation/native-stack \
 *   react-native-screens react-native-safe-area-context
 * ```
 *
 * ```tsx
 * import { registerRootComponent } from 'expo'
 * import { StoneNativeStack } from '@stone-js/use-react-native/navigation'
 *
 * registerRootComponent(() => <StoneNativeStack />)
 * ```
 *
 * @param options - What to show while empty, and the options every screen gets.
 * @returns The navigator.
 */
export function StoneNativeStack ({ fallback = null, screenOptions }: StoneNativeStackOptions = {}): JSX.Element | null {
  const stack = useScreenStack()
  const screens = useScreens()

  // Read through a ref-free callback: `screens` is the render's snapshot, and by the time a removal
  // fires the stack may have moved on. Asking the stack is asking the truth.
  const onDeparture = useCallback((key: string) => {
    if (shouldPopStone(key, stack.all())) { stack.pop() }
  }, [stack])

  // Nothing resolved yet: there is no navigator to show, because a navigator with no screens is a
  // runtime error in `@react-navigation/native-stack` rather than an empty view.
  if (screens.length === 0) { return fallback }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {screens.map((screen) => (
          <Stack.Screen
            key={screen.key}
            name={screen.key}
            options={{ title: screen.title }}
            listeners={{ beforeRemove: () => { onDeparture(screen.key) } }}
          >
            {/* Wrapped, because React 19 types a `ReactNode` as possibly a promise and a render prop
                 must not be one. */}
            {() => <>{screen.element}</>}
          </Stack.Screen>
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
