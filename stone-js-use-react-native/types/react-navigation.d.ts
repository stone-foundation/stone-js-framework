/**
 * Minimal ambient declarations for `@react-navigation/native` and its native stack.
 *
 * This package must not depend on them, in any of the three senses, and the reason is measured
 * rather than stylistic. They declare `react-native` as a peer, package managers install peers, and
 * `react-native` brings Metro, and Metro brings a version of `image-size` with two unpatched
 * denial-of-service advisories. Listing them as development dependencies therefore failed
 * `pnpm audit --audit-level=high` for the whole workspace, to type-check a component that only ever
 * touches three names.
 *
 * Not even as optional peers: pnpm installs an optional peer it can resolve, so the advisories came
 * back the moment they were declared that way. The same conclusion the adapter reached about
 * `react-native` itself, for the same reason: the only application that can satisfy such a peer is a
 * React Native application, where these packages are already direct dependencies. Declaring them
 * would inform nobody and cost everybody, and `npx expo install` is what the README asks for.
 *
 * So the shapes are described here, no wider than what `StoneNativeStack` uses. They are deliberately
 * loose: this is not an attempt to mirror React Navigation's types, and an application importing the
 * real packages gets the real ones. Under the test runner the specifiers resolve to stubs, which is
 * what `vitest.config.ts` is for.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
// `any` returns, not `unknown`: these are used as JSX components, and TypeScript rejects a component
// whose return type it cannot assign to a node. A stand-in should be permissive anyway, since an
// application importing the real packages gets the real types.

declare module '@react-navigation/native' {
  export const NavigationContainer: (props: { children?: any }) => any
}

declare module '@react-navigation/native-stack' {
  /** Whatever the native stack accepts per screen. Forwarded untouched, so never narrowed here. */
  export type NativeStackNavigationOptions = Record<string, any>

  export function createNativeStackNavigator (): {
    Navigator: (props: Record<string, any>) => any
    Screen: (props: Record<string, any>) => any
  }
}
