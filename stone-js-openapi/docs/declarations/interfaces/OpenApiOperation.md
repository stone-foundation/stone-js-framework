[**OpenAPI**](../../README.md)

***

[OpenAPI](../../README.md) / [declarations](../README.md) / OpenApiOperation

# Interface: OpenApiOperation

A single operation (one method on one path).

## Properties

### description?

> `optional` **description?**: `string`

***

### operationId?

> `optional` **operationId?**: `string`

***

### request?

> `optional` **request?**: `object`

#### body?

> `optional` **body?**: [`SchemaInput`](../type-aliases/SchemaInput.md)

#### headers?

> `optional` **headers?**: [`SchemaInput`](../type-aliases/SchemaInput.md)

#### params?

> `optional` **params?**: [`SchemaInput`](../type-aliases/SchemaInput.md)

#### query?

> `optional` **query?**: [`SchemaInput`](../type-aliases/SchemaInput.md)

***

### responses?

> `optional` **responses?**: `Record`\<`string` \| `number`, [`OpenApiResponse`](OpenApiResponse.md)\>

***

### summary?

> `optional` **summary?**: `string`

***

### tags?

> `optional` **tags?**: `string`[]
