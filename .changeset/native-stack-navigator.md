---
"@stone-js/use-react-native": patch
"@stone-js/starters": patch
---

feat(use-react-native): the native navigator, wired

`StoneNativeApp` shows the screen on top of the stack, which is what makes a first run work with
nothing installed. It is the floor. The platform's own transitions, the swipe-back gesture, the
hardware back button, and a screen keeping its own state while another covers it are things only a
native navigator gives you, and none of them can be imitated in JavaScript. Until now the README
explained how to wire one yourself; `StoneNativeStack` is that wiring, shipped.

```tsx
import { registerRootComponent } from 'expo'
import { StoneNativeStack } from '@stone-js/use-react-native/navigation'

registerRootComponent(() => <StoneNativeStack screenOptions={{ headerShown: true }} />)
```

Nothing about a page changes. Each Stone screen becomes a native one, keyed by its own identity so
the navigator keeps its state as the stack grows, and titled from the page's `head`.

**The one thing worth understanding is a single comparison.** There are two stacks and one truth: the
router owns navigation, so Stone's stack is the truth and the navigator displays it. A screen can then
leave the navigator for two reasons, and only one needs answering. A swipe back removed it without
telling Stone, so Stone still has it on top and it gets popped. A `useGoBack` or a `reset` popped it
already, and the navigator is only catching up with a render it was given: popping again would eat the
screen underneath. Comparing the departing screen's key with what Stone now has on top separates the
two exactly, with no flag to keep and no window in which a fast double-back does the wrong thing. It
is `shouldPopStone`, exported, and it is the part to read before writing your own navigator.

**Behind `/navigation`, and depending on nothing.** React Navigation declares `react-native` as a
peer, package managers install peers, `react-native` brings Metro, and Metro brings a version of
`image-size` with two unpatched advisories: declaring these packages, even as optional peers, failed
`pnpm audit --audit-level=high` for the whole workspace. So they are described by ambient
declarations instead, the same conclusion the adapter reached about `react-native` itself, and the
package's main entry imports nothing from them. An application that is happy with the floor installs
nothing; one that wants the navigator runs `npx expo install`.

**What is verified, and what is not.** The rule has nine cases against a real screen stack, and the
component's wiring has seven with React Navigation stood in for: what a navigator *does* with a screen
is its business, and reproducing it under a test runner would test their library with ours. Resolution
and bundling are verified for real: the starter bundles to Hermes bytecode for iOS and Android with
the navigator in place, and to the web target too, so the whole chain can be seen in a browser tab
before a device is involved. The transitions and the gesture themselves need a device, and nothing
here pretends otherwise.
