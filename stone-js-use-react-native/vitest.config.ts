import { fileURLToPath } from 'node:url'
import { createVitestConfig } from '../vitest.config.base.mjs'

const config = createVitestConfig(import.meta.url, {
  environment: 'jsdom',
  coverageInclude: ['src/**/*.ts', 'src/**/*.tsx'],
  // `declarations.ts` holds types only and `core.ts` is the single re-export seam: neither has
  // behaviour to cover, and counting them would only make the gate lie in one direction or the
  // other.
  coverageExclude: ['src/declarations.ts', 'src/core.ts', 'src/navigation/index.ts'],
  thresholds: { statements: 97, branches: 97, functions: 97, lines: 97 }
})

// Under Node there is no React Native, which is the case the adapter is built to survive. It
// still keeps a literal `'react-native'` specifier for Metro's sake, and Vite resolves that
// specifier when it loads the adapter's built entry, so it has to point somewhere: it points
// at an empty module, which is what a machine without React Native actually offers.
config.resolve = {
  ...config.resolve,
  alias: {
    ...(config.resolve?.alias as Record<string, string>),
    'react-native': fileURLToPath(new URL('./tests/stubs/react-native.ts', import.meta.url)),
    // The navigator's own dependencies, which this package must not depend on: the specifiers have
    // to resolve for its module to load, and each test then mocks them to record what it asked for.
    '@react-navigation/native': fileURLToPath(new URL('./tests/stubs/react-navigation-native.ts', import.meta.url)),
    '@react-navigation/native-stack': fileURLToPath(new URL('./tests/stubs/react-navigation-native-stack.ts', import.meta.url))
  }
}

export default config
