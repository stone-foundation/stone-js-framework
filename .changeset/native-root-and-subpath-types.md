---
"@stone-js/use-react-native": patch
"@stone-js/use-react": patch
---

fix(use-react-native): the root component works, and the published subpaths carry their types

Two defects in the renderer's public surface, both found by a pilot running the framework on a
device, and both invisible from inside this repository.

**`StoneNativeApp` could not be mounted where the documentation says to mount it.** It reads the
screen stack through the service container, and the container is scoped to an event.
`registerRootComponent` mounts the root before any event exists and outside every one that follows,
so there is no container there: the first render threw `useStone(): no Stone context found` and the
application red-screened at boot. Every starter mounts it exactly that way.

Nothing caught it because every test in this package supplied a context, and `expo export` proves a
bundle, never a boot. A component that cannot work without a context passed its suite by always
being given one.

The stack is now published where the build phase decides it, so a component outside every event can
reach the same object. This is not a second source of truth: a navigation stack spans events by
nature and was already a singleton on the blueprint. Inside a screen the container still wins,
because inside an event it is authoritative. The new tests mount the root with no context above it,
which is the case that ships.

**Four published subpaths declared a `types` file that does not exist**: `@stone-js/use-react/cli`,
and `use-react-native`'s `cli`, `metro` and `navigation`. A single-entry build whose source sits in
a folder emits a folder, so `src/navigation/index.ts` becomes `dist/navigation/index.d.ts` and never
`dist/navigation.d.ts`. The code resolved, so nothing failed; only the types were missing, and
`StoneNativeStack`, the navigator the documentation recommends, imported as `any` with untyped
options.

A new `check:exports` runs in CI and fails when an `exports` target points at a file that is not
there. It was verified by putting the broken path back and watching it refuse.
