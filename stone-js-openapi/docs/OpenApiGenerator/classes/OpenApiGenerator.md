[**OpenAPI**](../../README.md)

***

[OpenAPI](../../README.md) / [OpenApiGenerator](../README.md) / OpenApiGenerator

# Class: OpenApiGenerator

Builds an OpenAPI 3.0 document from your Zod schemas and routes.

You describe operations declaratively (request/response as Zod schemas or raw JSON Schema); the
generator converts them, assembles parameters, request bodies and responses, and emits a valid
document you can serve as JSON and render with Swagger UI. It is decoupled from the router:
feed it routes via [OpenApiGenerator.addRoutes](#addroutes) or add paths explicitly.

## Constructors

### Constructor

> **new OpenApiGenerator**(`info`): `OpenApiGenerator`

#### Parameters

##### info

[`OpenApiInfo`](../../declarations/interfaces/OpenApiInfo.md)

The document info.

#### Returns

`OpenApiGenerator`

## Methods

### addPath()

> **addPath**(`method`, `path`, `operation`): `this`

Add one operation.

#### Parameters

##### method

`string`

The HTTP method.

##### path

`string`

The path (OpenAPI style, e.g. `/users/{id}`).

##### operation

[`OpenApiOperation`](../../declarations/interfaces/OpenApiOperation.md)

The operation definition.

#### Returns

`this`

This generator.

***

### addRoutes()

> **addRoutes**(`routes`): `this`

Derive operations from a list of routes (those carrying an `openapi` annotation).

#### Parameters

##### routes

[`OpenApiRoute`](../../declarations/interfaces/OpenApiRoute.md)[]

The routes.

#### Returns

`this`

This generator.

***

### addSchema()

> **addSchema**(`name`, `schema`): `this`

Register a reusable component schema.

#### Parameters

##### name

`string`

The schema name.

##### schema

[`SchemaInput`](../../declarations/type-aliases/SchemaInput.md)

The schema (Zod or JSON Schema).

#### Returns

`this`

This generator.

***

### addServer()

> **addServer**(`url`, `description?`): `this`

Add a server entry.

#### Parameters

##### url

`string`

The server URL.

##### description?

`string`

Optional description.

#### Returns

`this`

This generator.

***

### addTag()

> **addTag**(`name`, `description?`): `this`

Add a tag.

#### Parameters

##### name

`string`

The tag name.

##### description?

`string`

Optional description.

#### Returns

`this`

This generator.

***

### build()

> **build**(): [`OpenApiDocument`](../../declarations/interfaces/OpenApiDocument.md)

Build the OpenAPI document.

#### Returns

[`OpenApiDocument`](../../declarations/interfaces/OpenApiDocument.md)

The document.

***

### create()

> `static` **create**(`info`): `OpenApiGenerator`

#### Parameters

##### info

[`OpenApiInfo`](../../declarations/interfaces/OpenApiInfo.md)

The document info.

#### Returns

`OpenApiGenerator`

A new generator.
