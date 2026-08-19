import { OpenApiGenerator } from './OpenApiGenerator'
import { RouterLike } from './fromRouter'
import { IBlueprint, IContainer, IncomingEvent } from '@stone-js/core'
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
  /**
   * Routes to describe by hand.
   *
   * Rarely needed: the contract derives itself from the router. Anything declared here is added on
   * top of what was derived, for an endpoint the router does not own.
   */
  routes?: OpenApiRoute[]

  /**
   * The security scheme name a protected route requires. Default `'bearerAuth'`.
   */
  securityScheme?: string

  /**
   * Stop deriving from the router and describe only what `routes` declares.
   *
   * Off by default, because deriving is the point.
   */
  deriveFromRouter?: boolean
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
  private readonly container?: IContainer

  /**
   * @param dependencies - Auto-wired container services.
   */
  constructor ({ blueprint, container }: { blueprint: IBlueprint, container?: IContainer }) {
    this.blueprint = blueprint
    this.container = container
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

    if (options.deriveFromRouter !== false) {
      generator.addRouter(this.router(), {
        schemas: this.blueprint.get<Record<string, unknown>>('stone.validation.schemas', {}),
        securityScheme: options.securityScheme,
        // The request already runs inside the container, so a schema class whose rules need i18n
        // gets i18n, and the contract is complete rather than partial. Reaching here at all means a
        // router was resolved, so a container exists.
        resolve: (target: any) => this.container?.resolve?.(target, true)
      })
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

  /**
   * The application's router.
   *
   * No router means no routes, and no routes means there is no contract to publish. That is not a
   * degraded case to paper over with an empty document, so it fails and says what to do.
   *
   * @returns The router.
   * @throws {TypeError} When no router is bound.
   */
  private router (): RouterLike {
    const router = this.container?.has?.('router') === true
      ? this.container.make<RouterLike>('router')
      : undefined

    if (router?.getRoutes === undefined) {
      throw new TypeError(
        'Cannot publish an OpenAPI contract without a router: there are no routes to describe. ' +
        'Enable the router on the application with `@Routing()`, or with `routerBlueprint` on the ' +
        'manifest. To publish a hand-written document instead, set `stone.openapi.document`, or ' +
        '`stone.openapi.deriveFromRouter` to false and declare `stone.openapi.routes` yourself.'
      )
    }

    return router
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
