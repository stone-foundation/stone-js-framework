---
"@stone-js/react-native-adapter": patch
"@stone-js/starters": patch
---

fix(react-native-adapter): a deep link reaches the route it names, and the resolver stops crashing at boot

Two defects reported by a pilot running the framework on a device, both of them in the one file that
turns a native cause into an event.

**A deep link carrying the application's own scheme did not reach the route it names**, and the worst
case answered `200`. A custom scheme is not a *special* scheme, so WHATWG parsing reads the first
segment as an authority: `myapp://discover` came out as host `discover` with an empty path and the
router served `/`, while `myapp://orgs/klere` came out as `/klere` and answered 404. The first is the
dangerous one, because nothing looks wrong: the user simply lands on another screen. The pilot proved
it not by the status code but by which service the resolved screen called, and a test asserting only
`200` would have passed over it.

Everything after a custom scheme is now read as the path, which is what every platform delivers and
what every deep-link router does. The event keeps the scheme it arrived with, so a handler that wants
to know a deep link brought it here still can. `http` and `https` are untouched: there an authority
really is one.

Three tests and three fixtures encoded the old behaviour, treating a first segment as a throwaway
host, which is exactly the convention that produced the bug. They now describe what a phone delivers.

**The default linking resolver crashed the application at boot.** It did `await import('react-native')`,
and building an ESM namespace evaluates **every** getter on React Native's index, including deprecated
modules such as `PushNotificationIOS` whose native half is not linked on a fresh Expo prebuild:
constructing one threw `new NativeEventEmitter() requires a non-null argument` before the first screen.
It reads `Linking` through `require` now, which runs one getter, and falls back to the dynamic import
where there is no `require`.
