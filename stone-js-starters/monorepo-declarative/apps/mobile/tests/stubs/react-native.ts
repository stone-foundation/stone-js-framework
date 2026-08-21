/**
 * What `react-native` is under a Node test runner: absent.
 *
 * The screen imports `View`, `Text` and friends at module scope, so the specifier has to resolve to
 * something for the application to even load. It resolves to this: the primitives as inert
 * identifiers, which is enough because a resolved screen is a React element that has been *built*,
 * not mounted. React never calls these components here, so there is nothing for them to do.
 *
 * That is the line this test draws, and it is the honest one. What runs under Node is the domain:
 * the kernel, the router, the loader, the head. What a `View` looks like is React Native's business,
 * and the way to see it is to run the application, either on a device or in a browser tab through
 * `npx expo start --web`.
 */
const component = (name: string): string => name

export const View = component('View')
export const Text = component('Text')
export const Image = component('Image')
export const Pressable = component('Pressable')
export const ScrollView = component('ScrollView')

export const StyleSheet = {
  create: <T>(styles: T): T => styles,
  flatten: (style: unknown): unknown => style
}

export const Platform = {
  OS: 'ios',
  select: <T>(spec: Record<string, T>): T | undefined => spec.ios ?? spec.default
}

export const Linking = {
  openURL: async (): Promise<void> => {},
  getInitialURL: async (): Promise<string | null> => null,
  addEventListener: () => ({ remove: () => {} })
}

export const useColorScheme = (): string | null => null

export default {
  View, Text, Image, Pressable, ScrollView, StyleSheet, Platform, Linking, useColorScheme
}
