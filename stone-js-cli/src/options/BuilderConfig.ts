import { UserConfig } from 'vite'
import { RollupOptions } from 'rollup'
import { dotenv, DotenvConfig } from './DotenvConfig'
import { rollupBuildConfig, rollupBundleConfig } from '../server/rollup-config'

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
}

/**
 * Default configuration for building the Stone.js application.
 */
export const builder: BuilderConfig = {
  dotenv,
  lazy: true, // Lazy pages by default: per-route code splitting, and the scanned route definitions feed zero-config SSG.
  public: 'public',
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
