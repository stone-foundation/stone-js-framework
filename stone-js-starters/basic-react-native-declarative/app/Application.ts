import { Routing } from '@stone-js/router'
import { LogLevel, StoneApp } from '@stone-js/core'
import { ReactNative } from '@stone-js/react-native-adapter'
import { UseReactNative } from '@stone-js/use-react-native'

/**
 * Application
 *
 * This is the main application entry point.
 *
 * @Routing() is used to enable the router.
 * @ReactNative() is used to enable the React Native adapter, which turns deep links and
 *   in-app navigation into events.
 * @UseReactNative() is used to enable the React Native renderer, which turns what a page
 *   resolves into a screen.
 * @StoneApp() is used to enable the Stone application, it is required.
 *
 * The web starter's Application carries the same decorators with two swapped: `@Browser()` for
 * `@ReactNative()`, `@UseReact()` for `@UseReactNative()`. That is the promise, in four lines:
 * the domain is written once, and what changes is the context it runs in.
 *
 * Screens live in their own files, one route each. See `app/HomeScreen.tsx`.
 */
@Routing()
@ReactNative()
@UseReactNative()
@StoneApp({ logger: { level: LogLevel.INFO } })
export class Application {}
