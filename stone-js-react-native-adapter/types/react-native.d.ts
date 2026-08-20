/**
 * A minimal ambient declaration for `react-native`.
 *
 * This package must not depend on `react-native`, in any of the three senses. It does not
 * import it statically, so nothing here needs it to load. It does not list it as a peer,
 * because the only application that could satisfy such a peer is a React Native application,
 * where `react-native` is already a direct dependency: the declaration would inform nobody,
 * while dragging the entire Metro toolchain into the install of every workspace that merely
 * builds this package.
 *
 * But the runtime lookup in `NavigationSource` has to keep a literal specifier, because a
 * React Native bundler resolves imports statically and would not find the module behind a
 * computed one. So the specifier stays literal and this declaration is what keeps the
 * compiler happy when the package is absent, which in this repository is always.
 *
 * The shape is deliberately `unknown`: the real `Linking` API is described structurally by
 * {@link LinkingLike}, and the resolver narrows to it. Nothing here should look like an
 * attempt to mirror React Native's types.
 */
declare module 'react-native' {
  const reactNative: unknown
  export default reactNative
}
