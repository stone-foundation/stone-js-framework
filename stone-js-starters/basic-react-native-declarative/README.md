# Stone.js · Basic React Native starter (declarative API)

The same Stone.js domain you deploy on Node, serverless, edge or the browser, running as a **native mobile application** with React Native and Expo.

## What this starter demonstrates

- A Stone.js domain (`app/`) written with the declarative API: `@StoneApp`, `@Routing`, `@Controller`, `@Match`. The domain never knows it runs inside a native application.
- Stage-3 decorators (2023-11) with `Symbol.metadata`, transformed by Babel under Metro (see `babel.config.js`: the decorators plugin runs before the Expo preset).
- The universal Stone router matching navigation intents (`stone://app/hello/:name`) exactly like it matches URLs in a browser SPA or paths behind an HTTP adapter.
- A minimal native adapter (`adapter/`): it captures navigation intents, normalizes them into `IncomingBrowserEvent` and executes the render effect. It prefigures `@stone-js/react-native-adapter` and will be replaced by it once published.
- The platform polyfills React Native needs (`index.ts`): the WHATWG `URL` API and, on older Hermes versions, `TextEncoder`.

The start screen is a live self-check: decorators, URL API, TextEncoder, kernel boot and router dispatch are verified at runtime and shown as green or red rows.

## Run it

```bash
npm install
npm start        # then press i (iOS simulator) or a (Android emulator)
```

## Test it

The whole chain (domain, router, adapter) is pure JavaScript, so the exact modules the application boots are also tested under Node:

```bash
npm test
npm run typecheck
```

## What is shared with your other platforms

Domain, routing, services and data loading. Not the UI components: native screens are React Native components, browser pages are DOM components.
