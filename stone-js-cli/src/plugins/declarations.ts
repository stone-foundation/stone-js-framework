import { MetaPipe } from '@stone-js/pipeline'
import { StoneReporter } from '../StoneReporter'
import { BlueprintContext, ClassType, IBlueprint, IncomingEvent, Promiseable } from '@stone-js/core'

/**
 * A blueprint-phase middleware contributed by a plugin.
 *
 * It runs inside the CLI's own blueprint pipeline (before any command), on the same
 * {@link BlueprintContext} as the CLI, so a plugin can read and augment `stone.builder.*`
 * configuration before the builders run.
 */
export type StonePluginBlueprintMiddleware = MetaPipe<BlueprintContext<IBlueprint, ClassType>, IBlueprint>

/**
 * The context handed to a plugin's build-phase hooks.
 *
 * This is a deliberately small, stable facade over the CLI's internal build context: plugin
 * authors depend on these helpers, never on the CLI internals, so the CLI can evolve without
 * breaking published plugins. Everything a plugin needs to participate in a build is here:
 * read/mutate the blueprint, learn which command is running, report to the user, and generate
 * code into the `.stone/` build directory.
 */
export interface StonePluginContext {
  /**
   * The build blueprint. Read `stone.builder.*` here, or set config the built app will read.
   */
  blueprint: IBlueprint

  /**
   * The incoming console event driving the build (carries CLI flags and arguments).
   */
  event: IncomingEvent

  /**
   * The command currently driving the lifecycle: `'build'`, `'dev'`, `'preview'`, `'export'`, ...
   */
  command: string

  /**
   * The branded reporter, for user-facing output that matches the CLI's own look.
   */
  reporter: StoneReporter

  /**
   * Resolve a path inside `.stone`, the build directory.
   *
   * Not `.stone/tmp`: that one is scratch space for a build, and it is **deleted when the build
   * ends**. A file a plugin generates is imported by the application, so a development server keeps
   * loading it for the whole session, long after some build swept its scratch away. Writing there
   * gave `ENOENT: no such file or directory, open '.stone/tmp/plugins/i18n.mjs'` in the middle of a
   * dev session, from Vite's own transform step.
   *
   * Write under `plugins/`: that directory is emptied at the start of every run, so a module is
   * always fresh and never missing, and one left behind by a plugin that is no longer installed
   * cannot be served by mistake.
   *
   * @param paths - Path segments joined under `.stone`.
   * @returns The absolute path.
   */
  buildPath: (...paths: string[]) => string

  /**
   * Write a file into `.stone`, creating parent directories as needed. Use `plugins/<name>`.
   *
   * @param relativePath - The path, relative to `.stone`. By convention, `plugins/<name>`.
   * @param content - The file content.
   * @returns The absolute path written.
   */
  writeFile: (relativePath: string, content: string) => string

  /**
   * Contribute a module to the built application.
   *
   * The specifier is imported by the generated entry point and its exports are collected into
   * the app's `modules` (exactly like the user's own `app/**` modules), so a plugin can inject
   * decorated classes, blueprints or `defineBuilderConfig(...)` meta-modules. Use a specifier that
   * resolves from `.stone` (a relative path like `./plugins/x.mjs`, or a bare package name); it is
   * rewritten for whichever entry imports it, since a production entry lives in `.stone/tmp` and a
   * development one in `.stone`.
   *
   * @param specifier - An import specifier resolvable from `.stone`.
   */
  addModule: (specifier: string) => void

  /**
   * Contribute a raw blueprint statement to the built application.
   *
   * The statement is injected verbatim into the generated entry's `configure` step, where a
   * local `blueprint` is in scope (e.g. `blueprint.set('stone.i18n.resources', {...})`). Prefer
   * {@link addModule} for anything expressible as a module; reach for this only when you must run
   * imperative configuration at app startup.
   *
   * @param statement - A JavaScript statement executed with `blueprint` in scope.
   */
  addBlueprint: (statement: string) => void
}

/**
 * A Stone.js CLI plugin: a module's way to participate in the build/bundle lifecycle.
 *
 * A plugin is a plain object (or the return of a factory). It is fully agnostic of any specific
 * module: the CLI never knows what a plugin does, only when to call it. Plugins are collected
 * from `stone.config` (`plugins: [...]`, the explicit path, open to any package) and, for
 * first-party `@stone-js/*` packages only, auto-discovered from their `package.json` `stone.cliPlugin`
 * contract (the zero-config path, opt-out via `autoDiscoverPlugins: false`).
 *
 * The lifecycle exposes three moments, from earliest to latest:
 * - {@link blueprintMiddleware}: config phase, augment `stone.builder.*`.
 * - {@link onPrepare}: codegen phase (build **and** dev), write `.stone/` files and contribute modules/config.
 * - {@link onBundle}: just before the bundler runs, for advanced bundler-level participation.
 */
export interface StoneCliPlugin {
  /**
   * A unique, human-readable name (shown when the plugin is loaded).
   */
  name: string

  /**
   * A short description of what the plugin does (shown alongside the name).
   */
  description?: string

  /**
   * Config-phase middleware, run in the CLI's blueprint pipeline before any command.
   *
   * Use this to read or augment `stone.builder.*` configuration. Runs for every command.
   */
  blueprintMiddleware?: StonePluginBlueprintMiddleware[]

  /**
   * Codegen phase: called once per build, before the entry point is generated, for both
   * `build` (production) and `dev`. Write files into `.stone/` and contribute modules or
   * blueprint statements to the built app via the {@link StonePluginContext} helpers.
   *
   * @param context - The build context facade.
   */
  onPrepare?: (context: StonePluginContext) => Promiseable<void>

  /**
   * Bundle phase: called just before the bundler (Rollup/Vite) runs, after {@link onPrepare}.
   * Advanced hook for bundler-level participation, e.g. mutating `stone.builder.rollup`/`vite`
   * on the blueprint so the plugin's bundler options are honored.
   *
   * @param context - The build context facade.
   */
  onBundle?: (context: StonePluginContext) => Promiseable<void>
}
