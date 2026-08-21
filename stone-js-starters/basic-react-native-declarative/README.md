# Stone.js - Basic React Native starter

Stone.js's basic starter to create a React Native (Expo) app using the declarative API.

The same welcome screen the web starters show, on a phone. Same mark, same palette, same words,
because it is the same domain: `app/HomeScreen.tsx` is a page, with `handle`, `head` and `render`,
and only `render` knows it is native.

## Project Setup

```sh
npm install
```

### Run it

```sh
npm start           # Expo dev server: press i for iOS, a for Android
npm run ios         # straight to the iOS simulator
npm run android     # straight to an Android emulator
```

### Run it in a browser

The fastest loop is often a browser tab: Fast Refresh, and the same code then runs on a device
untouched. It is opt-in, because the web target needs two dependencies a native-only app has no
reason to carry.

```sh
npx expo install react-dom react-native-web
npm run web
```

Use it for the domain, the navigation and most of the interface. Use a device before believing
anything about the parts that are actually native: `react-native-web` covers the core primitives,
not the camera, secure storage or a native gesture handler.

### Bundle for production

```sh
npm run export      # a Hermes bytecode bundle, per platform
```

An installable build is `npx expo run:ios` or an [EAS build](https://docs.expo.dev/build/setup/):
both need a native toolchain, and they are better commands than a wrapper would be.

### Run tests

```sh
npm run test
npm run test:cvg
```

The tests boot the real kernel, router, adapter and renderer under Node, send a deep link, and
assert what landed on the navigation stack. No device, no simulator, no Metro.

### Type-check

```sh
npm run typecheck
```

## What is where

| File | What it does |
|---|---|
| `app/Application.ts` | Enables the router, the adapter and the renderer. Four decorators. |
| `app/HomeScreen.tsx` | The page answering `/`. Adding a screen is adding a file like it. |
| `app/WelcomeView.tsx` | What the screen draws, in React Native components. |
| `app/theme.ts` | The Stone.js palette, following the device's light or dark appearance. |
| `index.ts` | Polyfills, boot, and `registerRootComponent`. |
| `metro.config.js` | `withStone`: collects `app/` into `.stone/modules.ts` before Metro bundles. |

## Nothing lists your screens

A web application never lists its pages, and this one does not either. `withStone` collects
everything under `app/` and writes `.stone/modules.ts` whenever Metro starts, so `expo start`,
`expo run:ios` and an EAS build all get it without anyone remembering to ask.

It runs when Metro starts, not while it runs: **adding** a screen to a running dev server means
restarting it. **Editing** one needs nothing, Fast Refresh was never involved.

`.stone/` is generated. It is in `.gitignore`, and there is no reason to open it.

## Navigating

```tsx
import { useNavigate, useGoBack } from '@stone-js/use-react-native'

const navigate = useNavigate()

navigate('/tasks/42')                  // push a screen
navigate('/tasks/42', 'replace')       // swap the current one
navigate('/sign-in', 'reset')          // start again, leaving no history
```

Navigation goes through the router, so a screen never renders another screen itself. `useGoBack()`
returns `{ goBack, canGoBack }`: wire `goBack` to your header button and to Android's hardware back
button, and let the platform leave the application when `canGoBack` is false.

Deep links arrive the same way. This starter's scheme is `stone`, so `stone://app/?name=Ada` reaches
the page that owns `/`, with `name` readable through `event.get('name')`. Change `scheme` in
`app.json` to your own.

## Using a native navigator

`App.tsx` renders `StoneNativeApp`, which shows the screen on top of the stack. That is the floor,
not the ceiling: it is what makes the first run work with nothing installed. The platform's
transitions, the swipe-back gesture, and a screen keeping its own state while another covers it are
things only a native navigator gives you.

The stack is public state, so a navigator drives itself from it:

```tsx
import { useScreens } from '@stone-js/use-react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator()

export default function App () {
  const screens = useScreens()

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {screens.map((screen) => (
          <Stack.Screen key={screen.key} name={screen.key} options={{ title: screen.title }}>
            {() => screen.element}
          </Stack.Screen>
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
```

Nothing about your pages changes.

## The imperative twin

The same application, written with values instead of decorators, is
[`basic-react-native-imperative`](../basic-react-native-imperative). Neither paradigm wraps the
other; both write to the same manifest.

## Learn more

- [Stone.js documentation](https://stonejs.dev/docs)
- [`@stone-js/use-react-native`](https://www.npmjs.com/package/@stone-js/use-react-native)
- [`@stone-js/react-native-adapter`](https://www.npmjs.com/package/@stone-js/react-native-adapter)
