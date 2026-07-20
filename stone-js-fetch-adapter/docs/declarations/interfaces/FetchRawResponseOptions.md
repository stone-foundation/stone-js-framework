[**FetchAdapter**](../../README.md)

***

[FetchAdapter](../../README.md) / [declarations](../README.md) / FetchRawResponseOptions

# Interface: FetchRawResponseOptions

The options accumulated by the raw-response builder before a Web `Response` is produced.

## Extends

- `RawResponseOptions`

## Indexable

> \[`k`: `string` \| `number` \| `symbol`\]: `unknown`

## Properties

### body?

> `optional` **body?**: `BodyInit` \| `null`

Response body.

***

### cookies?

> `optional` **cookies?**: `string`[]

`Set-Cookie` values (emitted as repeated headers).

***

### headers?

> `optional` **headers?**: `Record`\<`string`, `string`\>

Response headers.

***

### status?

> `optional` **status?**: `number`

HTTP status code.

***

### statusText?

> `optional` **statusText?**: `string`

HTTP status text.
