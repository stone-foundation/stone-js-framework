const { getDefaultConfig } = require('expo/metro-config')
const { withStone } = require('@stone-js/use-react-native/metro')

/**
 * `withStone` collects every module under `app/` and writes `.stone/modules.ts` before Metro
 * bundles, because Metro resolves imports statically and has no `import.meta.glob`. It hooks in
 * here rather than in a command on purpose: Metro loads this file whatever started it, so
 * `expo start`, `expo run:ios` and an EAS build all get the generation without anyone asking.
 *
 * Pinning the project root also keeps Metro scoped to this starter, even when it lives inside a
 * larger workspace, as it does in the Stone.js monorepo.
 */
module.exports = withStone(getDefaultConfig(__dirname), __dirname)
