/**
 * What `react-native` is under a Node test runner: absent.
 *
 * The adapter looks the platform's linking module up at runtime and treats its absence as a
 * supported case, which is what lets the whole native chain be tested without a device. But
 * the lookup keeps a literal `'react-native'` specifier, because a React Native bundler
 * resolves imports statically and would not find the module behind a computed one, and Vite
 * analyses that specifier when it loads the adapter's built entry.
 *
 * So the specifier has to resolve to something here, and the honest something is nothing: no
 * `Linking`, exactly as on a machine that has no React Native installed. Every test that
 * exercises deep links injects its own linking module instead.
 */
export default {}
