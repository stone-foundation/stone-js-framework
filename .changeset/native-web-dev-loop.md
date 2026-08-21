---
"@stone-js/use-react-native": patch
"@stone-js/starters": patch
---

docs(use-react-native): the fastest loop on a native application is a browser tab

Expo serves a React Native application to a browser through `react-native-web`, with Fast Refresh,
and the same code then runs on a device untouched. That is the loop most of a mobile application
should be built in, and nothing said so.

Verified rather than assumed: the official starter was bundled for the web target, and the whole
chain goes through, adapter and renderer included. It is documented as opt-in, because the web
target needs `react-dom` and `react-native-web`, which a native-only application has no reason to
carry.

Documented with its limits, which is the part that makes the loop trustworthy: `react-native-web`
covers the core primitives, not every native module, so a screen built on the camera, on secure
storage or on a native gesture handler still has to be tried on a device. Use the browser for the
domain, the navigation and most of the interface; use a device before believing anything about the
parts that are actually native.
