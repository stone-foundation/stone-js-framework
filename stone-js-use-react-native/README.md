# @stone-js/use-react-native

React Native renderer for [Stone.js](https://stonejs.dev). Your pages become native screens.

## Overview

The same domain, the same routes, the same loaders. A page that answers `/tasks/:id` behind an HTTP adapter answers it on a phone too, and what changes is where the result goes: a browser replaces a document, a phone pushes a screen onto a stack.

Everything before that last step is shared with the web renderer, from [`@stone-js/use-react-core`](https://www.npmjs.com/package/@stone-js/use-react-core): the same `@Page` decorator, the same layouts, the same error pages, the same view providers, the same hooks. There is no native variant of a page's logic to write.

## Key Features

- **Your pages, as screens**: `@Page('/tasks/:id')` and its loader work unchanged.
- **A real stack**: screens stack as the user goes deeper, each keeping its own state, so a back gesture has somewhere to go.
- **Deep links for free**: with [`@stone-js/react-native-adapter`](https://www.npmjs.com/package/@stone-js/react-native-adapter), `myapp://tasks/42` reaches the page that owns `/tasks/:id`.
- **Navigation through the router**: `useNavigate()` goes through the router, so a screen never renders another screen itself.
- **Nothing to list**: your modules are collected from `app/` at build time, so adding a page is adding a file.
- **One vocabulary**: `stone dev native` and `stone build native` alongside `stone dev` and `stone build`, with Expo still doing the bundling.
- **No native module of its own**: the renderer imports nothing but React and Stone.js, so it adds no build step and no linking.

## Installation

```bash
npm i @stone-js/core @stone-js/router @stone-js/browser-core \
      @stone-js/react-native-adapter @stone-js/use-react-native
```

React Native's `URL` is a stub without a usable `pathname`, which the router needs on every event, so a polyfill loads first. The adapter's README covers this and the Babel decorators option, both of which are required.

## Zero configuration

A web application never lists its pages: the build collects them. A native one should not have to
either, and the only reason it did is that the collection is a bundler question, and no two
bundlers answer it the same way. The web build asks Vite for `import.meta.glob`; Metro has no such
thing and would not understand one.

So the question is answered before any bundler runs. Two lines in `metro.config.js`:

```js
const { getDefaultConfig } = require('expo/metro-config')
const { withStone } = require('@stone-js/use-react-native/metro')

module.exports = withStone(getDefaultConfig(__dirname), __dirname)
```

and one import in your entry:

```ts
import { stoneApp } from '@stone-js/core'
import { modules } from './.stone/modules'

stoneApp({ modules }).run()
```

`.stone/modules.ts` is generated: real static imports of everything under `app/`, which is what
Metro needs to see. Add `.stone/` to your `.gitignore` and never open it again.

Why `metro.config.js` rather than a command: Metro loads that file whatever brought it up, so
`expo start`, `expo run:ios` and an EAS build all get the generation without anyone remembering to
ask for it. One thing to know is that it runs when Metro starts, not while it runs: adding a page
to a running dev server means restarting it. Editing a page that already exists needs nothing,
Fast Refresh was never involved.

## The `native` build target

Installing this package also gives the CLI a native target, auto-discovered, so there is one
vocabulary across platforms:

```bash
stone dev native        # collects your modules, then `expo start`
stone build native      # collects your modules, then `expo export`
stone build native --platform ios
```

It is deliberately thin. Expo and Metro own native bundling, and they know about Hermes, the
per-platform resolution, the native projects and the dev client; there is nothing to gain from a
second opinion on any of it. Producing an installable application stays `expo run:ios` or an EAS
build, which need a native toolchain and are better commands than any wrapper would be.

Running `expo start` directly keeps working, and keeps collecting your modules, because that part
lives in the Metro configuration rather than in the command.

## Usage

Enable the adapter and the renderer, declaratively:

```ts
import { Routing } from '@stone-js/router'
import { StoneApp } from '@stone-js/core'
import { ReactNative } from '@stone-js/react-native-adapter'
import { UseReactNative } from '@stone-js/use-react-native'

@Routing()
@ReactNative()
@UseReactNative()
@StoneApp({ name: 'my-app' })
export class Application {}
```

Or imperatively:

```ts
import { defineStoneReactNativeApp } from '@stone-js/use-react-native'
import { reactNativeAdapterBlueprint } from '@stone-js/react-native-adapter'

export const Application = defineStoneReactNativeApp({ name: 'my-app' }, [reactNativeAdapterBlueprint])
```

Write a page exactly as you would for the web, with React Native components in its `render`:

```tsx
import { Text, View } from 'react-native'
import { Page, IPage } from '@stone-js/use-react-native'

@Page('/tasks/:id')
export class TaskScreen implements IPage<any> {
  constructor (private readonly tasks: TaskService) {}

  async handle (event) {
    return await this.tasks.find(event.get('id'))
  }

  head ({ data }) {
    return { title: data.title }
  }

  render ({ data }) {
    return <View><Text>{data.title}</Text></View>
  }
}
```

Then show it. `StoneNativeApp` displays the screen on top, with nothing to install:

```tsx
import { registerRootComponent } from 'expo'
import { StoneNativeApp } from '@stone-js/use-react-native'

registerRootComponent(() => <StoneNativeApp fallback={<Splash />} />)
```

## Navigating

```tsx
import { useNavigate, useGoBack } from '@stone-js/use-react-native'

const navigate = useNavigate()

navigate('/tasks/42')                  // push a screen
navigate('/tasks/42', 'replace')       // swap the current one
navigate('/sign-in', 'reset')          // start again, leaving no history
navigate({ name: 'tasks.show', params: { id: 42 } })  // by route name
```

`useGoBack()` returns `{ goBack, canGoBack }`. Wire `goBack` to your header button, and to the hardware back button on Android, letting the platform leave the application when `canGoBack` is false.

## Using a native navigator

`StoneNativeApp` is the floor, not the ceiling: it shows the top screen and no more. The platform's transitions, the swipe-back gesture, and a screen keeping its own state while another covers it are things only a native navigator gives you.

So the stack is public state rather than a private detail. Drive `@react-navigation/native-stack` from it, and this package still depends on nothing:

```tsx
import { useScreens } from '@stone-js/use-react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator()

export function App () {
  const screens = useScreens()

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {screens.map((screen) => (
          <Stack.Screen
            key={screen.key}
            name={screen.key}
            options={{ title: screen.title }}
          >
            {() => screen.element}
          </Stack.Screen>
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
```

Each Stone screen becomes a native one, keyed by its own identity, so the navigator keeps its state as the stack grows. Nothing about your pages changes.

## Testing under Node

Your domain, your routes and your loaders test without a device or a simulator, which is where
most of the value is. One configuration detail makes it work.

The adapter looks React Native's `Linking` module up at runtime and treats its absence as a
supported case, but it keeps a literal `'react-native'` specifier so a native bundler can find
the real module on a device. A Node test runner resolves that specifier too, and there is no
React Native to resolve it to, so point it at an empty module:

```ts
// vitest.config.ts
resolve: {
  alias: {
    'react-native': fileURLToPath(new URL('./tests/stubs/react-native.ts', import.meta.url))
  }
}
```

The stub exports an empty object, which is exactly what a machine without React Native offers.
Tests that exercise deep links inject their own linking module instead, so nothing is being
faked that matters.

## What is shared with your other platforms

Domain, routing, services, loaders, and the whole page contract. Not the components: a native screen is built from `View` and `Text`, a web page from `div` and `span`, and no honest abstraction hides that.

## Learn More

- [Documentation](https://stonejs.dev)
- [Continuum Architecture](https://evens-stone.github.io/continuum-manifesto/manifesto)

## Contributing

See [CONTRIBUTING](https://github.com/stone-foundation/stone-js-framework/blob/main/CONTRIBUTING.md).

## License

[MIT](./LICENSE)
