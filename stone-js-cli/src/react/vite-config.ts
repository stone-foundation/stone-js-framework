import builtins from 'module'
import { defineConfig } from 'vite'
import babel from 'vite-plugin-babel'
import browserslist from 'browserslist'
import react from '@vitejs/plugin-react'

/**
 * The default browser targets.
 *
 * Used when the application does not define a browserslist configuration.
 * Covers all browsers supporting native ES modules (Safari 11+, iOS 11+, etc.),
 * which is the minimum required by Vite anyway.
 */
export const DEFAULT_BROWSER_TARGETS = 'defaults and fully supports es6-module'

/**
 * The default esbuild output target for client bundles.
 *
 * ES2018 guarantees no static class blocks, no optional chaining,
 * no nullish coalescing and no class fields in the final output.
 * Server (SSR) builds override this with a Node target.
 */
export const DEFAULT_CLIENT_BUILD_TARGET = 'es2018'

/**
 * Resolves the browser targets for Babel.
 *
 * Reads the application's browserslist configuration (.browserslistrc
 * or the "browserslist" field in package.json) when present,
 * and falls back to safe defaults otherwise.
 *
 * @returns The browser targets.
 */
export const resolveBrowserTargets = (): string | string[] => {
  return browserslist.loadConfig({ path: process.cwd() }) ?? DEFAULT_BROWSER_TARGETS
}

/**
 * The Vite configuration.
 */
export const viteConfig = defineConfig(() => {
  const targets = resolveBrowserTargets()

  return {
    plugins: [
      react({
        babel: {
          presets: [
            ['@babel/preset-env', {
              targets,
              bugfixes: true,
              modules: false,
              useBuiltIns: false
            }],
            '@babel/preset-typescript'
          ],
          plugins: [
            ['@babel/plugin-proposal-decorators', { version: '2023-11' }],
            '@babel/plugin-transform-class-static-block',
            '@babel/plugin-transform-class-properties',
            '@babel/plugin-transform-private-methods'
          ]
        }
      }),
      babel({
        // `include`/`exclude` replace the deprecated `filter` option (vite-plugin-babel >= 1.7).
        include: /\.[tj]sx?$/,
        exclude: /node_modules/,
        babelConfig: {
          babelrc: false,
          configFile: false,
          presets: [
            ['@babel/preset-env', {
              targets,
              bugfixes: true,
              modules: false,
              useBuiltIns: false
            }],
            '@babel/preset-typescript'
          ],
          plugins: [
            ['@babel/plugin-proposal-decorators', { version: '2023-11' }],
            '@babel/plugin-transform-class-static-block',
            '@babel/plugin-transform-class-properties',
            '@babel/plugin-transform-private-methods'
          ]
        }
      })
    ],

    build: {
      target: DEFAULT_CLIENT_BUILD_TARGET,
      rollupOptions: {
        external: [...builtins.builtinModules, /node:/],
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          }
        }
      }
    },

    ssr: {
      noExternal: true,
      external: undefined
    },

    resolve: {
      conditions: ['browser', 'import', 'default'],
      extensions: ['.js', '.mjs', '.ts', '.jsx', '.mjsx', '.tsx', '.json']
    }
  }
})
