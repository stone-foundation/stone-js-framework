import { UserConfig } from 'vite'
import { RollupOptions } from 'rollup'
import { dotenv, DotenvConfig } from './DotenvConfig'
import { StoneCliPlugin } from '../plugins/declarations'
import { rollupBuildConfig, rollupBundleConfig } from '../server/rollup-config'

/**
 * Configuration for the test run, under `stone.builder.test`.
 *
 * Tests are a context like any other, so they are configured in the same file as the build: a project
 * needs no second config file to keep in sync with the first.
 */
export interface TestConfig {
  /**
   * The files to treat as test suites.
   * Defaults to `./tests/**` matching `.test.` / `.spec.` in js/ts, with or without JSX.
   */
  include?: string[]

  /**
   * The env file to load before the runner starts, so a value read at module load sees it.
   * Defaults to `.env.test`. It takes precedence over `.env`, which is already loaded by then.
   */
  envFile?: string

  /**
   * The files `createTestApp()` discovers the application from.
   * Defaults to whatever the build scans, which is the point: the suite boots what ships.
   */
  pattern?: string

  /**
   * Escape hatch: raw Vitest config, merged over the defaults, exactly as `vite` and `rollup` are.
   * This is where a frontend project switches `environment` to `happy-dom` for component tests.
   */
  vitest?: Record<string, unknown>
}

/**
 * Configuration for automatically loading modules during buildtime.
 *
 * Specifies glob patterns to identify modules for transpilation.
 */
export interface InputConfig {
  /**
   * The input path pattern for the entire application.
   */
  all?: string

  /**
   * The input path pattern for the application modules expect views.
   * We need to separate the rest of the application modules from the views
   * For the lazy loading of views.
   */
  app?: string

  /**
   * The input path pattern for only the application views.
   * We need to separate views from the rest of the application modules
   * For the lazy loading of views.
   */
  views?: string

  /**
   * The input path for the application Main CSS stylesheet.
   */
  mainCSS?: string
}

/**
 * Static asset alias configuration.
 *
 * `dir` is the assets root (relative to the project root). `aliases` maps an import alias
 * to a subfolder of `dir` (empty string means `dir` itself). Example resolution with
 * `{ dir: 'assets', aliases: { '@img': 'images' } }`: `@img/logo.png` → `<root>/assets/images/logo.png`.
 */
export interface AssetsConfig {
  /**
   * The assets root directory, relative to the project root. Default `assets`.
   */
  dir?: string

  /**
   * Map of import alias to subfolder of `dir`.
   */
  aliases?: Record<string, string>
}

/**
 * Rollup configuration for the application.
 */
export interface RollupConfig {
  /**
   * This configuration is used for building the application.
   */
  build: Partial<RollupOptions>

  /**
   * This configuration is used for bundling the application.
   */
  bundle: Partial<RollupOptions>
}

/**
 * Configuration for building the Stone.js application.
 */
export interface BuilderConfig {
  /**
   * The language used in the application.
   */
  language?: 'typescript' | 'javascript'

  /**
   * The application target.
   */
  target?: 'react' | 'service'

  /**
   * Whether the application is using lazy loading for pages, error pages and layouts.
   */
  lazy?: boolean

  /**
   * Whether the application is using server-side rendering.
   */
  rendering?: 'csr' | 'ssr' | 'ssg'

  /**
   * Whether the application is using imperative programming style.
   */
  imperative?: boolean

  /**
   * Environment variable management configuration.
   */
  dotenv?: Partial<DotenvConfig>

  /**
   * The test run configuration.
   */
  test?: TestConfig

  /**
   * The HTTP server configuration for the application.
   */
  server?: {
    /**
     * Should print or not the URLs of the server.
     */
    printUrls?: boolean
  }

  /**
   * The browser configuration for the application.
   */
  browser?: {
    /**
     * Modules to be removed from the browser build.
     */
    excludedModules?: string[]
  }

  /**
   * Module autoloading configuration.
   */
  input?: InputConfig

  /**
   * Static asset import aliases for components (client and SSR).
   *
   * Lets components import assets with short, stable aliases instead of brittle relative
   * paths, e.g. `import logo from '@img/logo.png'`. Each alias resolves to a subfolder of
   * `assets.dir` under the project root. Applied to dev, build, client and SSR via Vite's
   * `resolve.alias`; user `builder.vite.resolve.alias` still wins.
   */
  assets?: AssetsConfig

  /**
   * The public directory served/copied verbatim (defaults to `public`).
   */
  public?: string

  /**
   * Static Site Generation options (used with `rendering: 'ssg'` / `--ssg`).
   */
  ssg?: {
    /**
     * The routes to pre-render to static HTML. Defaults to `['/']`.
     * Parameterized routes should be listed explicitly (e.g. `/blog/hello`).
     */
    routes?: string[]
  }

  /**
   * The output file path for the production build.
   */
  output?: string

  /**
   * File watching configuration.
   */
  watcher?: {
    /**
     * Files to be ignored during watching.
     */
    ignored?: string[]
  }

  /**
   * The rollup configuration for the application.
   */
  rollup?: RollupConfig

  /**
   * The Vite configuration for the application.
   */
  vite?: Partial<UserConfig>

  /**
   * CLI plugins that participate in the build/bundle lifecycle.
   *
   * This is the explicit, primary path, open to any package: list the plugins a module exposes
   * (e.g. `plugins: [i18nCliPlugin()]`). First-party `@stone-js/*` plugins are additionally
   * auto-discovered from their `package.json` contract (see {@link autoDiscoverPlugins}); a plugin
   * listed here always wins over the same plugin auto-discovered.
   */
  plugins?: StoneCliPlugin[]

  /**
   * Whether to auto-discover first-party (`@stone-js/*`) CLI plugins (default `true`).
   *
   * When enabled, `@stone-js/*` packages in the project's direct dependencies that advertise a
   * `stone.cliPlugin` contract are loaded automatically, so first-party modules stay truly
   * zero-config. Third-party plugins are never auto-discovered: they must be declared in
   * {@link plugins}. Set to `false` to opt out entirely and load every plugin explicitly.
   */
  autoDiscoverPlugins?: boolean
}

/**
 * Default configuration for building the Stone.js application.
 */
export const builder: BuilderConfig = {
  dotenv,
  plugins: [],
  lazy: true, // Lazy pages by default: per-route code splitting, and the scanned route definitions feed zero-config SSG.
  public: 'public',
  autoDiscoverPlugins: true, // First-party `@stone-js/*` plugins are zero-config; third-party plugins go through `plugins`.
  assets: {
    dir: 'assets',
    aliases: {
      '@assets': '',
      '@img': 'images',
      '@css': 'css',
      '@fonts': 'fonts',
      '@styles': 'styles'
    }
  },
  rollup: {
    build: rollupBuildConfig,
    bundle: rollupBundleConfig
  },
  browser: {
    excludedModules: [
      // Removes the Stone built-in SSR imports from the application.
      '@stone-js/http-core',
      '@stone-js/filesystem',
      '@stone-js/node-cli-adapter',
      '@stone-js/node-http-adapter',
      '@stone-js/aws-lambda-http-adapter'
    ]
  },
  watcher: {
    ignored: ['node_modules/**', 'dist/**', '.stone/**']
  }
}
