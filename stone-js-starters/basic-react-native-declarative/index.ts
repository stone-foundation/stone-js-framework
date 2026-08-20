/**
 * Platform polyfills come first, before anything from Stone.js loads.
 *
 * - React Native's built-in `URL` is a stub (no `pathname`, no `searchParams`);
 *   Stone.js relies on the full WHATWG URL API, so the polyfill is required.
 * - `TextEncoder` is installed only when the JS engine does not provide it
 *   (older Hermes versions).
 */
import 'react-native-url-polyfill/auto'

if (typeof globalThis.TextEncoder === 'undefined') {
  require('fast-text-encoding')
}

import { registerRootComponent } from 'expo'

import App from './App'

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App)
