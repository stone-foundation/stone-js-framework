---
"@stone-js/use-react-native": patch
"@stone-js/starters": patch
---

feat(starters): the mobile starters are Stone.js applications, in both paradigms

The React Native starter was the proof of concept that unblocked the mobile work, and it still
looked like one: a hand-written adapter in its own `adapter/` folder, a screen of green and red
self-checks instead of an application, and Expo's default blue icon on the home screen. It also
came alone, while every other starter comes as a declarative and an imperative pair.

**Both paradigms now, and they are the same application twice.** `basic-react-native-declarative`
enables the router, the adapter and the renderer with four decorators;
`basic-react-native-imperative` does it with one `defineStoneReactNativeApp` call and two
blueprints, and writes its page with `definePage` instead of `@Page`. Neither wraps the other.

**The same identity as the web starters.** Same welcome screen, same words, same "Obsidienne &
Braise" palette following the device's light or dark appearance, and the same Portal mark, drawn
from the brand's own geometry. The icon, the splash, the Android adaptive layers and the favicon are
the Portal too, so a phone's home screen shows Stone.js rather than Expo's placeholder. What differs
from the web is only what a phone does differently: `View` for `div`, a `StyleSheet` for a
stylesheet, `Linking` for an anchor.

**The 300 lines of hand-written adapter are gone**, replaced by the packages that now exist:
`@stone-js/react-native-adapter` and `@stone-js/use-react-native`, wired the documented way.
`metro.config.js` is `withStone(getDefaultConfig(__dirname), __dirname)`, so the module manifest is
collected before Metro bundles and nothing lists a screen.

**And the tests are real.** They boot the kernel, the router, the adapter and the renderer under
Node, send a deep link through the adapter's own navigation source, and assert what landed on the
navigation stack: the route, the title `head` produced, and that an unknown route surfaces as a
screen rather than a crash. Verified on both starters: 4 tests each, a clean `tsc --noEmit`, and an
`expo export` producing Hermes bytecode for iOS and Android.

**One addition to the renderer made that possible.** `@stone-js/use-react-native/metro` now exports
`writeManifest` alongside `withStone`. `withStone` covers every way Metro can start, but Metro is
not the only thing that needs `.stone/modules.ts` to exist: `tsc --noEmit` on a fresh clone reads
the entry's `import { modules } from './.stone/modules'` before Metro has ever run, and so does a CI
step that type-checks without bundling. The starters' `typecheck` script generates it first, which
is why a fresh clone type-checks instead of failing on a missing import.
