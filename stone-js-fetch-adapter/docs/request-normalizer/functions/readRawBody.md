[**FetchAdapter**](../../README.md)

***

[FetchAdapter](../../README.md) / [request-normalizer](../README.md) / readRawBody

# Function: readRawBody()

> **readRawBody**(`request`): `Promise`\<`string` \| `Uint8Array`\<`ArrayBufferLike`\> \| `undefined`\>

Reads a request body once, returning text for textual content types and bytes otherwise.

## Parameters

### request

`Request`

The Web request.

## Returns

`Promise`\<`string` \| `Uint8Array`\<`ArrayBufferLike`\> \| `undefined`\>

The raw body, or `undefined` when there is no body.
