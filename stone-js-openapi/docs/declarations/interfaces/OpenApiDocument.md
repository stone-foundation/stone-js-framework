[**OpenAPI**](../../README.md)

***

[OpenAPI](../../README.md) / [declarations](../README.md) / OpenApiDocument

# Interface: OpenApiDocument

The generated OpenAPI document.

## Properties

### components?

> `optional` **components?**: `object`

#### schemas

> **schemas**: `Record`\<`string`, [`JsonSchema`](../type-aliases/JsonSchema.md)\>

***

### info

> **info**: [`OpenApiInfo`](OpenApiInfo.md)

***

### openapi

> **openapi**: `string`

***

### paths

> **paths**: `Record`\<`string`, `Record`\<`string`, `unknown`\>\>

***

### servers?

> `optional` **servers?**: [`OpenApiServer`](OpenApiServer.md)[]

***

### tags?

> `optional` **tags?**: `object`[]

#### description?

> `optional` **description?**: `string`

#### name

> **name**: `string`
