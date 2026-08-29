/**
 * What a test runner has to be told to run a Stone.js application.
 *
 * Its own entry point, `@stone-js/testing/vitest`, because a runner config is loaded before anything
 * else and has no business pulling the test client, the adapter and their platform peers with it.
 */

/**
 * The decorator semantics the framework runs on, as a Vitest `esbuild` option.
 *
 * Stone.js decorators are TC39 2023-11, and the runtime is 2023-11 throughout. A project's
 * `tsconfig.json` nonetheless sets `experimentalDecorators: true`, because the published decorator
 * signatures are legacy-shaped and that is what TypeScript's checker wants. esbuild reads the same
 * file, honours the flag, and emits the **legacy** form, so the first decorated class a test imports
 * fails with `SetupError: Class decorators must be used with the 2023-11 decorators proposal`.
 *
 * Turning the flag off for the runner alone is the whole fix, and it is what `stone test` writes
 * into the config it generates. This is the same value, published, for a project that keeps its own:
 *
 * ```ts
 * import { defineConfig } from 'vitest/config'
 * import { decoratorSemantics } from '@stone-js/testing/vitest'
 *
 * export default defineConfig({
 *   esbuild: decoratorSemantics,
 *   test: { globals: true, include: ['tests/**\/*.spec.ts'] }
 * })
 * ```
 *
 * Everything else esbuild keeps reading from the project's own `tsconfig.json`, so JSX, target and
 * paths behave exactly as they do everywhere else: only the two options that decide which decorator
 * form is emitted are stated here.
 *
 * `useDefineForClassFields` travels with it because 2023-11 decorators and standard class fields are
 * one semantic: a field initialised the legacy way is assigned, not defined, and a decorated field
 * would see the wrong thing.
 *
 * A toolchain that does not read `tsconfigRaw` needs Babel instead, with
 * `@babel/plugin-proposal-decorators` at `version: '2023-11'`.
 */
export const decoratorSemantics = {
  tsconfigRaw: {
    compilerOptions: {
      experimentalDecorators: false,
      useDefineForClassFields: true
    }
  }
}
