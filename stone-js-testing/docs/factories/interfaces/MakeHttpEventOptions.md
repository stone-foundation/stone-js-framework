[**Testing**](../../README.md)

***

[Testing](../../README.md) / [factories](../README.md) / MakeHttpEventOptions

# Interface: MakeHttpEventOptions

Options for [makeIncomingHttpEvent](../functions/makeIncomingHttpEvent.md).

## Properties

### body?

> `optional` **body?**: `Record`\<`string`, `unknown`\>

Parsed request body.

***

### headers?

> `optional` **headers?**: `Record`\<`string`, `string`\>

Request headers.

***

### ip?

> `optional` **ip?**: `string`

Client IP (default `127.0.0.1`).

***

### method?

> `optional` **method?**: `string`

HTTP method (default `GET`).

***

### url?

> `optional` **url?**: `string`

Full URL or path (default `/`); a path is resolved against `http://localhost`.
