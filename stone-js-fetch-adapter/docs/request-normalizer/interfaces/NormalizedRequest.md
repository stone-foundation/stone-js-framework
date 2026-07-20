[**FetchAdapter**](../../README.md)

***

[FetchAdapter](../../README.md) / [request-normalizer](../README.md) / NormalizedRequest

# Interface: NormalizedRequest

A canonical HTTP request derived from a Web `Request`.

A `Request` is already the Web standard, so normalisation is mostly a matter of reading the
(single-shot) body once and lifting headers/cookies/ip into a plain, agnostic shape the rest of
the adapter can use without ever touching a runtime-specific API.

## Properties

### cookies

> **cookies**: `string`[]

Raw cookie strings (e.g. `['a=1', 'b=2']`).

***

### headers

> **headers**: `Record`\<`string`, `string`\>

Lower-cased headers.

***

### ip

> **ip**: `string`

Best-effort client IP from forwarding headers.

***

### method

> **method**: `string`

The HTTP method (upper-case).

***

### rawBody?

> `optional` **rawBody?**: `string` \| `Uint8Array`\<`ArrayBufferLike`\>

The raw request body (text for textual content types, bytes otherwise, `undefined` if none).

***

### rawQueryString

> **rawQueryString**: `string`

The raw query string (without the leading `?`).

***

### url

> **url**: `URL`

The absolute request URL.
