import { LogLevel } from '@stone-js/core'
import { routerBlueprint } from '@stone-js/router'
import { defineStoneReactNativeApp } from '@stone-js/use-react-native'
import { reactNativeAdapterBlueprint } from '@stone-js/react-native-adapter'

/**
 * Application
 *
 * This is the main application entry point.
 *
 * The same four things the declarative starter says with decorators, said with values instead:
 * `defineStoneReactNativeApp` enables the renderer, and the blueprints it is handed enable the
 * router and the React Native adapter. Neither paradigm is a wrapper around the other; both write
 * to the same manifest.
 *
 * The web starter's Application is this same call with one blueprint swapped: the browser adapter's
 * for the native one. That is the promise, in four lines: the domain is written once, and what
 * changes is the context it runs in.
 *
 * Screens live in their own files, one route each. See `app/HomeScreen.tsx`.
 */
export const Application = defineStoneReactNativeApp(
  { logger: { level: LogLevel.INFO } },
  [routerBlueprint, reactNativeAdapterBlueprint]
)
