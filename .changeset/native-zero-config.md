---
"@stone-js/use-react-native": patch
"@stone-js/cli": patch
---

feat(use-react-native): a native application stops listing its modules

A web application never lists its pages: the build collects them. A native one had to, and that
was the last place the mobile story asked for something the other platforms do not. The reason was
never conceptual, it was the bundler: collection is a bundler question, the web build asks Vite for
`import.meta.glob`, and Metro has no such thing and would not understand one.

So the question is answered before any bundler runs. `withStone` wraps a Metro configuration,
collects everything under `app/` and writes `.stone/modules.ts`: real static imports, which is what
Metro needs to see, extensionless so per-platform files (`HomePage.ios.tsx`) still win as they
would for hand-written code, and sorted so the file is byte-identical between two runs on the same
tree. Only rewritten when it changed, because Metro watches what it bundles and an identical
rewrite would ask it to reload for nothing.

```js
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config')
const { withStone } = require('@stone-js/use-react-native/metro')

module.exports = withStone(getDefaultConfig(__dirname), __dirname)
```

```ts
import { modules } from './.stone/modules'

stoneApp({ modules }).run()
```

**It hooks into `metro.config.js` on purpose.** Metro loads that file whatever brought it up, so
`expo start`, `expo run:ios` and an EAS build all get the generation without anyone remembering to
ask. A command could not make that claim. It runs at Metro start rather than continuously, so
adding a page to a running dev server means restarting it; editing one needs nothing.

**And the CLI gains a `native` target**, auto-discovered from this package, so there is one
vocabulary across platforms: `stone dev native` and `stone build native` collect the modules and
hand the rest to `expo start` and `expo export`. Deliberately thin: Expo and Metro own native
bundling, and producing an installable application stays `expo run:ios` or an EAS build, which need
a native toolchain and are better commands than a wrapper would be. It is also the first target
registered by a module rather than by the CLI, which is what the registered-targets work was for.

**One CLI change, and it removes the last hardcoded path from a command.** A `self-hosted` target
now declares what `stone serve` should launch, through `devEntry`, exactly as it already declared
where `stone preview` starts from. The React target names its generated Vite server; the native
one names nothing, because Expo's own process is the dev server and there is nothing left to
supervise. `stone serve` no longer knows any target's file layout.
