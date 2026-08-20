import { ConsoleContext } from '../declarations'
import { IBlueprint, IncomingEvent, Promiseable } from '@stone-js/core'

/**
 * What a builder does, per command.
 *
 * Every method is optional: a target that cannot be served, or has nothing to export, simply
 * does not implement that step, and the command says so instead of failing obscurely.
 */
export interface StoneBuilder {
  /** Build for production. */
  build?: (event: IncomingEvent) => Promiseable<void>

  /** Run the development server. */
  dev?: (event: IncomingEvent, restart?: boolean) => Promiseable<void>

  /** Serve what was built. */
  preview?: (event: IncomingEvent) => Promiseable<void>

  /** Build for a console run (`stone <custom-command>`, `stone list`). */
  console?: (event: IncomingEvent) => Promiseable<void>

  /** Export a template or a config file into the project. */
  export?: (event: IncomingEvent) => Promiseable<void>

  /**
   * Watch the sources a rebuild depends on.
   *
   * Only a `supervised` target needs it: the CLI restarts the child, but what to watch is
   * the build's own knowledge.
   */
  watchFiles?: (listener: (path: string, count: number) => void | Promise<void>) => void
}

/**
 * A build target the CLI can drive.
 *
 * The CLI knows when to call a builder and nothing about what it does, which is what lets a
 * module own its own build: `@stone-js/use-react` knows how to build a React application,
 * `@stone-js/use-react-native` delegates to Expo, and a third-party library declares its own
 * target the same way. None of them require a change here.
 *
 * A definition is registered under `stone.builder.builders.<target>`, either by a
 * {@link StoneCliPlugin}'s `blueprintMiddleware` or directly in `stone.config`.
 */
export interface StoneBuilderDefinition {
  /**
   * The target's name, as `--target <name>` and `stone.builder.target` spell it.
   */
  target: string

  /**
   * Whether this target should answer, when nobody named one explicitly.
   *
   * Detection only: the flag and the configured target are handled before this is consulted,
   * so a definition never has to re-implement that precedence.
   */
  match: (blueprint: IBlueprint, event: IncomingEvent) => boolean

  /**
   * Build the builder for this run.
   */
  resolver: (context: ConsoleContext) => StoneBuilder

  /**
   * How `stone serve` should supervise this target's dev server.
   *
   * - `supervised`: the CLI watches the sources, rebuilds and restarts the child. What a
   *   backend build needs, since nothing else reloads it.
   * - `self-hosted`: the builder's own `dev` step owns reloading (Vite's HMR, Expo's dev
   *   server), so the CLI launches it and follows its exit code instead of restarting it.
   *
   * Declaring the capability rather than letting the command match on a target name is what
   * keeps `stone serve` from having to know which targets exist.
   */
  devMode?: 'supervised' | 'self-hosted'

  /**
   * Where `stone preview` should start the built application from.
   *
   * A React build is served by a generated preview server, a backend build by its own bundle,
   * and a native build by neither. Asking the target rather than assuming keeps the command
   * from knowing which is which.
   */
  previewEntry?: (blueprint: IBlueprint) => string

  /**
   * Order among the definitions whose `match` could answer, ascending.
   *
   * Spaced by tens, so a module can slot a target between two existing ones. The fallback
   * target that answers anything sits last on purpose.
   */
  priority?: number
}
