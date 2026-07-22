import { toJsonSchema } from './toJsonSchema'
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
  static create (info: OpenApiInfo): OpenApiGenerator {
    return new this(info)
  }

  /**
   * @param info - The document info.
   */
  constructor (private readonly info: OpenApiInfo) {}

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
    if (operation.operationId !== undefined) { result.operationId = operation.operationId }

    const parameters = [
      ...this.parametersFrom('path', operation.request?.params),
      ...this.parametersFrom('query', operation.request?.query),
      ...this.parametersFrom('header', operation.request?.headers)
    ]
    if (parameters.length > 0) { result.parameters = parameters }

    if (operation.request?.body !== undefined) {
      result.requestBody = {
        required: true,
        content: { 'application/json': { schema: toJsonSchema(operation.request.body) } }
      }
    }

    const responses = operation.responses ?? { 200: { description: 'OK' } }
    result.responses = Object.fromEntries(
      Object.entries(responses).map(([code, response]) => [
        code,
        response.schema === undefined
          ? { description: response.description }
          : { description: response.description, content: { 'application/json': { schema: toJsonSchema(response.schema) } } }
      ])
    )

    return result
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

    const json = toJsonSchema(schema)
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
