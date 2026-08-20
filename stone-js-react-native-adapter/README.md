# @stone-js/react-native-adapter

React Native adapter for [Stone.js](https://stonejs.dev). Runs your domain as a native mobile application, with Expo or bare React Native.

## Overview

This is the **Integration** dimension for a phone. It captures what a native application can be asked (the URL it was launched with, deep links delivered while it runs, navigation from inside the app), turns each one into the same `IncomingEvent` your handlers already receive, and runs the render effect the view layer deferred.

The domain does not change. A handler that answers `/tasks/:id` behind an HTTP adapter answers the same route when a push notification opens `myapp://tasks/42`, and nothing in it knows the difference.

## Key Features

- **Deep links, for free**: the launch URL and every later link resolve through your router, so `myapp://tasks/42` reaches the handler that owns `/tasks/:id`.
- **One navigation loop**: `router.navigate('/tasks')` from a screen re-enters the kernel exactly like a link would, with no History API anywhere.
- **The same event as the browser**: an `IncomingBrowserEvent`, so pages and middleware move between web and native untouched.
- **Testable without a device**: the platform's linking module is resolved, not imported, so the whole chain runs under a plain Node test runner.
- **Zero configuration**: in-app paths resolve against `stone://app`, cookies are kept in memory, and `react-native` is an optional peer.

## Installation

```bash
npm i @stone-js/core @stone-js/browser-core @stone-js/react-native-adapter
```

React Native's `URL` is a stub without a usable `pathname`, which the router needs on every event, so a polyfill is required before anything from Stone.js loads:

```bash
npm i react-native-url-polyfill
```

```ts
// index.ts, first line
import 'react-native-url-polyfill/auto'
```

Stone.js runs on TC39 2023-11 decorators. `babel-preset-expo` applies the decorators plugin itself, in legacy mode by default, so ask it for the standard semantics rather than adding the plugin separately:

```js
// babel.config.js
module.exports = function (api) {
  api.cache(true)
  return { presets: [['babel-preset-expo', { decorators: { version: '2023-11' } }]] }
}
```

## Usage

Enable it the declarative way, with its decorator:

```ts
import { Routing } from '@stone-js/router'
import { StoneApp } from '@stone-js/core'
import { ReactNative } from '@stone-js/react-native-adapter'

@Routing()
@ReactNative()
@StoneApp({ name: 'my-app' })
export class Application {}
```

Or the imperative way, with its blueprint:

```ts
import { defineStoneApp } from '@stone-js/core'
import { reactNativeAdapterBlueprint } from '@stone-js/react-native-adapter'

export const Application = defineStoneApp(handler, { name: 'my-app' }, [reactNativeAdapterBlueprint])
```

Then write your domain as you would anywhere else:

```ts
import { Controller, Match } from '@stone-js/router'

@Controller()
export class TaskController {
  @Match('/tasks/:id')
  show (event) {
    return this.tasks.find(event.get('id'))
  }
}
```

## Configuration

Every key is optional.

| Key | Description |
|---|---|
| `stone.reactNative.baseUrl` | The base an in-app path resolves against. Defaults to `stone://app`. Set it to your own scheme so links and in-app navigation share an origin. |
| `stone.reactNative.navigationSource` | The navigation source. One is created during the build phase and shared with the router; supply your own to control the linking module. |
| `stone.reactNative.cookie.options` | Options for the in-memory cookie collection. |

## Learn More

- [Documentation](https://stonejs.dev)
- [Continuum Architecture](https://evens-stone.github.io/continuum-manifesto/manifesto)

## API documentation

See the [published API reference](https://stonejs.dev/api).

## Contributing

See [CONTRIBUTING](https://github.com/stone-foundation/stone-js-framework/blob/main/CONTRIBUTING.md).

## License

[MIT](./LICENSE)
