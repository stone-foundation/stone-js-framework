/** A plain JSON Schema object. */
export type JsonSchema = Record<string, unknown>

/** Structural shape of a Zod schema (so this module never hard-depends on Zod). */
export interface ZodLike {
  safeParse: (data: unknown) => unknown
  _def: unknown
}

/** Either a Zod schema (converted to JSON Schema) or a raw JSON Schema object. */
export type SchemaInput = ZodLike | JsonSchema

/** HTTP methods an operation can use. */
export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options'

/** The `info` object of the document. */
export interface OpenApiInfo {
  title: string
  version: string
  description?: string
}

/** A server entry. */
export interface OpenApiServer {
  url: string
  description?: string
}

/** A single response definition. */
export interface OpenApiResponse {
  description: string
  schema?: SchemaInput
}

/** A single operation (one method on one path). */
export interface OpenApiOperation {
  summary?: string
  description?: string
  tags?: string[]
  operationId?: string
  request?: {
    body?: SchemaInput
    query?: SchemaInput
    params?: SchemaInput
    headers?: SchemaInput
  }
  responses?: Record<string | number, OpenApiResponse>
}

/** A route to derive an operation from (generic — decoupled from the router). */
export interface OpenApiRoute {
  method: HttpMethod | (string & {})
  path: string
  openapi?: OpenApiOperation
}

/** The generated OpenAPI document. */
export interface OpenApiDocument {
  openapi: string
  info: OpenApiInfo
  servers?: OpenApiServer[]
  tags?: Array<{ name: string, description?: string }>
  paths: Record<string, Record<string, unknown>>
  components?: { schemas: Record<string, JsonSchema> }
}
