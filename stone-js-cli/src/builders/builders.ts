import { buildPath, distPath } from '@stone-js/filesystem'
import { ServerBuilder } from '../server/ServerBuilder'
import { IBlueprint } from '@stone-js/core'
import { StoneBuilderDefinition } from './declarations'

/**
 * The backend build target, and the one that answers when nothing else does.
 *
 * Its `match` is unconditional and its priority puts it last, which is what makes it the default:
 * a project that renders nothing is a service, and that is what the CLI has always assumed.
 *
 * It is the only target the CLI still ships. Building a React application is
 * `@stone-js/use-react`'s business and building a native one is `@stone-js/use-react-native`'s;
 * both register their target through the same public key this one uses, and the CLI knows what
 * neither of them does.
 */
export const serverBuilderDefinition: StoneBuilderDefinition = {
  target: 'server',
  priority: 100,
  devMode: 'supervised', // Nothing else reloads a backend build.
  devEntry: () => buildPath('server.mjs'),
  previewEntry: (blueprint: IBlueprint) => distPath(blueprint.get<string>('stone.builder.output', 'server.mjs')),
  match: () => true,
  resolver: (context) => new ServerBuilder(context)
}

/**
 * The target the CLI ships with.
 *
 * Registered through the same key a module or a third-party library uses
 * (`stone.builder.builders`), deliberately: if the first-party target needed a private path, the
 * public one would not be worth much.
 */
export const defaultBuilderDefinitions: Record<string, StoneBuilderDefinition> = {
  server: serverBuilderDefinition
}
