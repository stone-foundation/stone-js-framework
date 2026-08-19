import { OpenApiGenerator } from './OpenApiGenerator'
import { IBlueprint, IncomingEvent } from '@stone-js/core'
import { swaggerUiHtml, SwaggerUiOptions } from './serve'
import { OpenApiDocument, OpenApiInfo, OpenApiRoute } from './declarations'

/**
 * Options for the served contract, read from `stone.openapi`.
 */
export interface OpenApiServeOptions {
  /** Document metadata (title, version, description). */
  info?: OpenApiInfo
  /** Where the JSON document is served (default `/openapi.json`). */
  specPath?: string
  /** Where the explorer is served (default `/docs`). Set to `false` to serve only the JSON. */
  docsPath?: string | false
  /** Routes to describe, until the contract derives itself from the router. */
  routes?: OpenApiRoute[]
  /** A pre-built document, when the application assembles its own. */
  document?: OpenApiDocument
  /** Swagger UI rendering options. */
  swaggerUi?: SwaggerUiOptions
  /** Server URLs to advertise. Omitted, the URL of the request that asked is used. */
  servers?: Array<{ url: string, description?: string }>
}

/**
 * Serves the OpenAPI contract and its explorer.
 *
 * The document is assembled per request rather than once at boot, because the server URL it
 * advertises must be the host that answered: the same artefact runs behind a local port, a load
 * balancer and an API Gateway stage, and a URL frozen at build time is wrong for at least two of
 * them. Configuration wins when it declares `servers` explicitly.
 */
export class OpenApiHandler {
  private readonly blueprint: IBlueprint

  /**
   * @param dependencies - Auto-wired container services.
   */
  constructor ({ blueprint }: { blueprint: IBlueprint }) {
    this.blueprint = blueprint
  }

  /**
   * Serve the OpenAPI JSON document.
   *
   * @param event - The incoming event.
   * @returns The document.
   */
  spec (event: IncomingEvent): OpenApiDocument {
    const options = this.options()

    if (options.document !== undefined) { return options.document }

    const generator = OpenApiGenerator.create(
      options.info ?? { title: 'API', version: '1.0.0' }
    )

    for (const server of options.servers ?? [{ url: this.originOf(event) }]) {
      generator.addServer(server.url, server.description)
    }

    return generator.addRoutes(options.routes ?? []).build()
  }

  /**
   * Serve the API explorer.
   *
   * @param event - The incoming event.
   * @returns The HTML page.
   */
  docs (event: IncomingEvent): string {
    const options = this.options()
    return swaggerUiHtml(options.specPath ?? DEFAULT_SPEC_PATH, {
      title: options.info?.title,
      ...options.swaggerUi
    })
  }

  /** The `stone.openapi` bucket. */
  private options (): OpenApiServeOptions {
    return this.blueprint.get<OpenApiServeOptions>('stone.openapi', {})
  }

  /**
   * The origin of the request that asked for the document.
   *
   * Duck-typed on the event so this module never depends on an HTTP layer: the kernel is agnostic,
   * and so is this handler.
   *
   * @param event - The incoming event.
   * @returns The origin, or `/` when the event carries no URL.
   */
  private originOf (event: IncomingEvent): string {
    const url = (event as unknown as { url?: URL | string }).url
    if (url === undefined) { return '/' }
    try {
      return new URL(String(url)).origin
    } catch {
      return '/'
    }
  }
}

/** Default path of the JSON document. */
export const DEFAULT_SPEC_PATH = '/openapi.json'

/** Default path of the explorer. */
export const DEFAULT_DOCS_PATH = '/docs'
