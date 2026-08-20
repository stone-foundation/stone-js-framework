---
"@stone-js/starters": patch
---

feat(starters): a React Native starter, so the continuum reaches the phone

`basic-react-native-declarative` is the first official starter that runs a Stone.js domain as a
**native mobile application**, with React Native and Expo. The domain is the same one any other
starter ships: `@StoneApp`, `@Routing`, `@Controller`, `@Match('/hello/:name')`. It does not know
it is running on a phone, which is the whole point.

It is also the proof that nothing in the framework's core is tied to a browser or a server. The
starter carries a small local adapter (`adapter/`) that captures navigation intents, normalizes
them into `IncomingBrowserEvent` and executes the render effect: the exact native counterpart of
`BrowserAdapter`, with an in-memory event source where the browser has `window`. It is activated
the canonical way, through `@StoneApp(options, [nativeAdapterBlueprint])`, and it prefigures
`@stone-js/react-native-adapter`, which will replace it with real deep links (`Linking`) and
app-state handling on the same skeleton.

Two platform facts the starter settles, because they are not obvious and they cost a day to
discover:

- **Decorators.** `babel-preset-expo` applies `@babel/plugin-proposal-decorators` itself, in legacy
  mode by default, so the 2023-11 semantics must be requested through the preset's own option
  (`['babel-preset-expo', { decorators: { version: '2023-11' } }]`). Adding the plugin separately
  fails the build outright ("Cannot use the decorators and decorators-legacy plugin together"), and
  ordering it by hand against the preset's class-field transforms is exactly what the preset
  already gets right.
- **Polyfills.** React Native's built-in `URL` is a stub with no usable `pathname` or
  `searchParams`, which the router needs on every event, so `react-native-url-polyfill` is loaded
  before anything from Stone.js; `TextEncoder` is installed only when the engine lacks it.

The start screen is a live self-check: decorators and `Symbol.metadata`, the URL API, `TextEncoder`,
the kernel boot and the router dispatch each report green or red on device. The same chain is also
covered by behavioural tests under Node, booting the real modules through the real adapter, because
all of it is plain JavaScript.

What is shared across platforms is stated plainly in the README: domain, routing, services and data
loading, never the UI components.
