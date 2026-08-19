import { OpenApiConfig } from '../options/OpenApiBlueprint'
import { OpenApiCommand, openApiCommandOptions } from '../commands/OpenApiCommand'
import { BlueprintContext, IBlueprint, NextMiddleware, type MetaMiddleware } from '@stone-js/core'
import { DEFAULT_DOCS_PATH, DEFAULT_SPEC_PATH, OpenApiHandler } from '../OpenApiHandler'

/**
 * Build-phase middleware: registers the two contract routes, with their paths taken from
 * configuration.
 *
 * A middleware rather than static route definitions on the blueprint, because the paths are
 * configurable and the blueprint constant is evaluated before the application has said anything.
 * Reading configuration is only safe once everything has been collected, which is why it reads
 * AFTER `next`, and it returns what `next` returned: a build-phase middleware that returns its own
 * value replaces the blueprint for every later phase.
 *
 * Both routes are added to `stone.router.definitions`, the same array the router scans, so nothing
 * here depends on the router package itself.
 *
 * @param context - The blueprint context.
 * @param next - The next blueprint middleware.
 * @returns The blueprint.
 */
export const OpenApiRoutesMiddleware = async (
  context: BlueprintContext<IBlueprint>,
  next: NextMiddleware<BlueprintContext<IBlueprint>, IBlueprint>
): Promise<IBlueprint> => {
  const blueprint = await next(context)
  const options = blueprint.get<OpenApiConfig>('stone.openapi', {})
  const specPath = options.specPath ?? DEFAULT_SPEC_PATH
  const docsPath = options.docsPath ?? DEFAULT_DOCS_PATH

  // The console adapter boots the whole application before a command runs, which is the most complete
  // place to produce the document: every schema class gets its services.
  if (blueprint.get<string>('stone.adapter.platform') === 'node_console') {
    blueprint.add('stone.adapter.commands', [
      { options: openApiCommandOptions, isClass: true, module: OpenApiCommand }
    ])
  }

  blueprint.add('stone.router.definitions', [
    {
      path: specPath,
      method: 'GET',
      name: 'openapi.spec',
      handler: { module: OpenApiHandler, action: 'spec', isClass: true }
    }
  ])

  // `docsPath: false` serves the machine-readable contract only, which is what you want when the
  // explorer is hosted elsewhere or must not be public.
  if (docsPath !== false) {
    blueprint.add('stone.router.definitions', [
      {
        path: docsPath,
        method: 'GET',
        name: 'openapi.docs',
        handler: { module: OpenApiHandler, action: 'docs', isClass: true }
      }
    ])
  }

  return blueprint
}

/**
 * Meta blueprint middleware for the OpenAPI module.
 */
export const MetaOpenApiRoutesMiddleware: MetaMiddleware<BlueprintContext<IBlueprint>, IBlueprint> = {
  module: OpenApiRoutesMiddleware,
  priority: 5
}
