import { glob } from 'glob'
import { basePath, buildPath, distPath } from '@stone-js/filesystem'
import { ReactBuilder } from '../react/ReactBuilder'
import { ServerBuilder } from '../server/ServerBuilder'
import { IBlueprint, IncomingEvent } from '@stone-js/core'
import { StoneBuilderDefinition } from './declarations'

/**
 * Whether this project looks like a React application.
 *
 * Detection only: whether a target was named on the command line or in the configuration is
 * the resolver's business, so this answers the one question it is asked.
 *
 * @param blueprint - The blueprint.
 * @returns True when the project has views.
 */
export const hasReactViews = (blueprint: IBlueprint): boolean => {
  return glob.sync(basePath(blueprint.get('stone.builder.input.views', 'app/**/*.{tsx,jsx,mjsx}'))).length > 0
}

/**
 * The React build target.
 */
export const reactBuilderDefinition: StoneBuilderDefinition = {
  target: 'react',
  priority: 10,
  devMode: 'self-hosted', // Vite owns HMR.
  devEntry: () => buildPath('server.mjs'),
  previewEntry: () => buildPath('preview.mjs'),
  match: (blueprint: IBlueprint, _event: IncomingEvent) => hasReactViews(blueprint),
  resolver: (context) => new ReactBuilder(context)
}

/**
 * The backend build target, and the one that answers when nothing else does.
 *
 * Its `match` is unconditional and its priority puts it last, which is what makes it the
 * default: a project with no views is a service, and that is what the CLI has always assumed.
 */
export const serverBuilderDefinition: StoneBuilderDefinition = {
  target: 'server',
  priority: 100,
  devMode: 'supervised', // Nothing else reloads a backend build.
  previewEntry: (blueprint) => distPath(blueprint.get<string>('stone.builder.output', 'server.mjs')),
  match: () => true,
  resolver: (context) => new ServerBuilder(context)
}

/**
 * The targets the CLI ships with.
 *
 * Registered through the same key a module or a third-party library uses
 * (`stone.builder.builders`), deliberately: if the first-party targets needed a private path,
 * the public one would not be worth much. Both are destined to move out, React into
 * `@stone-js/use-react` and the backend one into whichever package owns service builds, and
 * the day they do, nothing here has to be replaced, only removed.
 */
export const defaultBuilderDefinitions: Record<string, StoneBuilderDefinition> = {
  react: reactBuilderDefinition,
  server: serverBuilderDefinition
}
