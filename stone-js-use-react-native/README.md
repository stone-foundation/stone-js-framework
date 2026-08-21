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
- **No native module of its own**: this package imports nothing but React and Stone.js, so it adds no build step and no linking.

## Installation

```bash
npm i @stone-js/core @stone-js/router @stone-js/browser-core \
      @stone-js/react-native-adapter @stone-js/use-react-native
```

React Native's `URL` is a stub without a usable `pathname`, which the router needs on every event, so a polyfill loads first. The adapter's README covers this and the Babel decorators option, both of which are required.

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

## Developing in a browser

The fastest loop on a native application is not a simulator, it is a browser tab. Expo serves a
React Native application to one through `react-native-web`, with Fast Refresh, and the same code
then runs on a device untouched. Everything in this package works there, verified by bundling the
official starter for the web target.

It is opt-in, because the web target needs two dependencies a native-only application has no
reason to carry:

```bash
npx expo install react-dom react-native-web
npx expo start --web
```

What you get is the real thing: your routes resolve, your loaders run, your screens render, deep
links arrive as URLs. What you do not get is anything a browser cannot do, which is worth knowing
before you trust the loop for a given screen. `react-native-web` covers the core primitives, not
every native module, so a screen built on the camera, on secure storage or on a native gesture
handler has to be tried on a device. Layout is close but not identical, and performance says
nothing about the phone.

Use it for the domain, the navigation and most of the interface. Use a device before believing
anything about the parts that are actually native.

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
