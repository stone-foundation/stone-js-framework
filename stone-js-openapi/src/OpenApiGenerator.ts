import { SchemaDirection, toJsonSchema } from './toJsonSchema'
import { DerivationRegistries, routesFromRouter, RouterLike } from './fromRouter'
import {
  JsonSchema,
  HttpMethod,
  OpenApiInfo,
  OpenApiRoute,
  OpenApiServer,
  SchemaInput,
  OpenApiDocument,
  OpenApiOperation
} from './declarations'

/**
 * Builds an OpenAPI 3.0 document from your Zod schemas and routes.
 *
 * You describe operations declaratively (request/response as Zod schemas or raw JSON Schema); the
 * generator converts them, assembles parameters, request bodies and responses, and emits a valid
 * document you can serve as JSON and render with Swagger UI. It is decoupled from the router:
 * feed it routes via {@link OpenApiGenerator.addRoutes} or add paths explicitly.
 */
export class OpenApiGenerator {
  private readonly servers: OpenApiServer[] = []
  private readonly tags: Array<{ name: string, description?: string }> = []
  private readonly paths: Record<string, Record<string, unknown>> = {}
  private readonly schemas: Record<string, JsonSchema> = {}

  /**
   * @param info - The document info.
   * @returns A new generator.
   */
  static create (info: OpenApiInfo, onSkipped?: (skipped: { what: string, reason: string }) => void): OpenApiGenerator {
    return new this(info, onSkipped)
  }

  /**
   * @param info - The document info.
   * @param onSkipped - Told when a schema could not be described, so a gap is visible rather than silent.
   */
  constructor (
    private readonly info: OpenApiInfo,
    private readonly onSkipped?: (skipped: { what: string, reason: string }) => void
  ) {}

  /**
   * Add a server entry.
   *
   * @param url - The server URL.
   * @param description - Optional description.
   * @returns This generator.
   */
  addServer (url: string, description?: string): this {
    this.servers.push(description === undefined ? { url } : { url, description })
    return this
  }

  /**
   * Add a tag.
   *
   * @param name - The tag name.
   * @param description - Optional description.
   * @returns This generator.
   */
  addTag (name: string, description?: string): this {
    this.tags.push(description === undefined ? { name } : { name, description })
    return this
  }

  /**
   * Register a reusable component schema.
   *
   * @param name - The schema name.
   * @param schema - The schema (Zod or JSON Schema).
   * @returns This generator.
   */
  addSchema (name: string, schema: SchemaInput): this {
    this.schemas[name] = toJsonSchema(schema)
    return this
  }

  /**
   * Add one operation.
   *
   * @param method - The HTTP method.
   * @param path - The path (OpenAPI style, e.g. `/users/{id}`).
   * @param operation - The operation definition.
   * @returns This generator.
   */
  addPath (method: HttpMethod | (string & {}), path: string, operation: OpenApiOperation): this {
    this.paths[path] = this.paths[path] ?? {}
    this.paths[path][method.toLowerCase()] = this.buildOperation(operation)
    return this
  }

  /**
   * Derive operations from a list of routes (those carrying an `openapi` annotation).
   *
   * @param routes - The routes.
   * @returns This generator.
   */
  /**
   * Derive every documented path from a router.
   *
   * The routing table already says what each endpoint is: its path, its method, what it accepts and
   * whether it is protected. Reading it makes the document a view of the application rather than a
   * second description of it, so there is nothing to restate and nothing that can drift.
   *
   * @param router - The router, duck-typed so this module does not depend on `@stone-js/router`.
   * @param registries - How to resolve a name a route used instead of an inline value.
   * @returns This generator.
   */
  addRouter (router: RouterLike, registries: DerivationRegistries = {}): this {
    return this.addRoutes(routesFromRouter(router, registries))
  }

  addRoutes (routes: OpenApiRoute[]): this {
    for (const route of routes) {
      if (route.openapi !== undefined) {
        this.addPath(route.method, route.path, route.openapi)
      }
    }
    return this
  }

  /**
   * Build the OpenAPI document.
   *
   * @returns The document.
   */
  build (): OpenApiDocument {
    return {
      openapi: '3.0.3',
      info: this.info,
      ...(this.servers.length > 0 ? { servers: this.servers } : {}),
      ...(this.tags.length > 0 ? { tags: this.tags } : {}),
      paths: this.paths,
      ...(Object.keys(this.schemas).length > 0 ? { components: { schemas: this.schemas } } : {})
    }
  }

  /**
   * Assemble a single OpenAPI operation object.
   *
   * @param operation - The operation definition.
   * @returns The operation object.
   */
  private buildOperation (operation: OpenApiOperation): Record<string, unknown> {
    const result: Record<string, unknown> = {}

    if (operation.summary !== undefined) { result.summary = operation.summary }
    if (operation.description !== undefined) { result.description = operation.description }
    if (operation.tags !== undefined) { result.tags = operation.tags }
    // An unnamed route has no operation id, and `""` is not one: readers key generated clients off it.
    if (operation.operationId !== undefined && operation.operationId !== '') { result.operationId = operation.operationId }
    // A protected endpoint must SAY it is protected: a contract that omits it invites a caller to
    // try the endpoint unauthenticated and read the 401 as a bug.
    if (operation.security !== undefined) { result.security = operation.security }

    const parameters = [
      ...this.parametersFrom('path', operation.request?.params),
      ...this.parametersFrom('query', operation.request?.query),
      ...this.parametersFrom('header', operation.request?.headers),
      // Stated outright, for what a schema cannot express: a closed set of fragment names.
      ...(operation.parameters ?? [])
    ]
    if (parameters.length > 0) { result.parameters = parameters }

    if (operation.request?.body !== undefined) {
      const body = this.describe(operation.request.body, 'input', 'the request body')
      if (body !== undefined) {
        result.requestBody = { required: true, content: { 'application/json': { schema: body } } }
      }
    }

    const responses = operation.responses ?? { 200: { description: 'OK' } }
    result.responses = Object.fromEntries(
      Object.entries(responses).map(([code, response]) => {
        const described = response.schema === undefined
          ? undefined
          : this.describe(response.schema, 'output', `the ${code} response`)
        return [
          code,
          described === undefined
            ? { description: response.description }
            : { description: response.description, content: { 'application/json': { schema: described } } }
        ]
      })
    )

    return result
  }

  /**
   * Describe one schema, and refuse to let it take the document with it.
   *
   * A conversion can fail for reasons that belong to a single schema: a transform has no output shape,
   * an engine may not know a construct. Before this, one such schema threw out of the whole generation
   * and the endpoint that served the contract answered 500, so an API documented nothing because one
   * of its bodies normalised a string.
   *
   * What it does instead is leave that one schema out and say so. The rest of the document stands, and
   * the gap is visible, which is the same rule the derivation already follows: a missing contract beats
   * a wrong one.
   *
   * @param schema - The schema to describe.
   * @param direction - Whether it describes what is sent or what is answered.
   * @param what - What is being described, for the diagnostic.
   * @returns The JSON Schema, or nothing when it could not be described.
   */
  private describe (schema: SchemaInput, direction: SchemaDirection, what: string): JsonSchema | undefined {
    try {
      return toJsonSchema(schema, direction)
    } catch (error: any) {
      this.onSkipped?.({ what, reason: String(error?.message ?? error) })
      return undefined
    }
  }

  /**
   * Turn an object schema into OpenAPI parameters for a given location.
   *
   * @param location - `path`, `query` or `header`.
   * @param schema - The object schema (optional).
   * @returns The parameter objects.
   */
  private parametersFrom (location: 'path' | 'query' | 'header', schema?: SchemaInput): Array<Record<string, unknown>> {
    if (schema === undefined) { return [] }

    const json = this.describe(schema, 'input', `the ${location} parameters`) ?? {}
    const properties = (json.properties ?? {}) as Record<string, JsonSchema>
    const required = new Set((json.required ?? []) as string[])

    return Object.entries(properties).map(([name, propertySchema]) => ({
      name,
      in: location,
      required: location === 'path' ? true : required.has(name),
      schema: propertySchema
    }))
  }
}
