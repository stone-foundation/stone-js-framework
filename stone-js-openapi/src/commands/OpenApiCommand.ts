import { writeFileSync } from 'node:fs'
import { RouterLike } from '../fromRouter'
import { OpenApiGenerator } from '../OpenApiGenerator'
import { OpenApiServeOptions } from '../OpenApiHandler'
import { IBlueprint, IContainer, IncomingEvent } from '@stone-js/core'

/**
 * Configuration for the `openapi` command.
 */
export const openApiCommandOptions: any = {
  name: 'openapi',
  alias: 'oa',
  args: ['[action]'],
  desc: 'Print or export the OpenAPI contract',
  options: (yargs: any) => {
    return yargs
      .positional('action', {
        type: 'string',
        default: 'show',
        choices: ['show', 'export'],
        desc: 'Print the document, or write it to a file'
      })
      .option('output', {
        alias: 'o',
        type: 'string',
        default: 'openapi.json',
        desc: 'Where to write the document when exporting'
      })
  }
}

/**
 * Print or export the OpenAPI contract from the console.
 *
 * The console adapter boots the whole application before running a command, which is what makes this
 * the most complete way to produce the document: the container is up, so every schema class is built
 * with the services it asked for, and the contract is exactly what the running application would
 * serve. That is a strictly better answer than reading schemas in isolation, and it is why the
 * document belongs in a command as much as on a route.
 *
 * ```bash
 * stone openapi                       # print it
 * stone openapi export -o api.json    # write it, to commit or to feed a type generator
 * ```
 */
export class OpenApiCommand {
  /**
   * @param container - The service container.
   */
  constructor (private readonly container: IContainer) {}

  /**
   * Run the requested action.
   *
   * @param event - The console event carrying the action and options.
   */
  handle (event: IncomingEvent): void {
    const document = this.document()
    const action = event.getMetadataValue<string>('action', 'show')

    if (action === 'export') {
      const output = event.getMetadataValue<string>('output', 'openapi.json') ?? 'openapi.json'
      writeFileSync(output, JSON.stringify(document, null, 2))
      console.log(`OpenAPI contract written to ${output}`)
    } else {
      console.log(JSON.stringify(document, null, 2))
    }
  }

  /**
   * Build the document from the booted application.
   *
   * @returns The document.
   * @throws {TypeError} When no router is bound, since there would be no routes to describe.
   */
  private document (): unknown {
    const blueprint = this.container.make<IBlueprint>('blueprint')
    const options = blueprint.get<OpenApiServeOptions>('stone.openapi', {})

    if (options.document !== undefined) { return options.document }

    const router = this.container.has('router') ? this.container.make<RouterLike>('router') : undefined

    if (router?.getRoutes === undefined) {
      throw new TypeError(
        'Cannot export an OpenAPI contract without a router: there are no routes to describe. ' +
        'Enable the router on the application with `@Routing()`, or with `routerBlueprint` on the manifest.'
      )
    }

    // Collected while deriving, reported once at the end: an endpoint whose payload could not be
    // documented is worth a line on the console, because a contract missing it looks complete.
    const skipped: string[] = []

    const generator = OpenApiGenerator.create(
      options.info ?? { title: 'API', version: '1.0.0' },
      ({ what, reason }) => skipped.push(`${what} — ${reason}`)
    )

    for (const server of options.servers ?? []) {
      generator.addServer(server.url, server.description)
    }

    const document = generator
      .addRouter(router, {
        schemas: blueprint.get<Record<string, unknown>>('stone.validation.schemas', {}),
        // The same registry the runtime projects through, so a route naming a resource documents the
        // response it will actually send.
        resources: blueprint.get<Record<string, unknown>>('stone.resources.registry', {}),
        fragmentParam: blueprint.get<string>('stone.resources.params.fragment', 'view'),
        securityScheme: options.securityScheme,
        onSkipped: ({ route, concern, reason }) => skipped.push(`${route}: ${concern} — ${reason}`),
        // The application is fully booted here, so every schema class gets its services.
        resolve: (target: any) => this.container.resolve(target, true)
      })
      .addRoutes(options.routes ?? [])
      .build()

    if (skipped.length > 0) {
      process.stderr.write(
        `[@stone-js/openapi] ${skipped.length} declaration(s) could not be documented:\n  ` +
        `${skipped.join('\n  ')}\n`
      )
    }

    return document
  }
}
