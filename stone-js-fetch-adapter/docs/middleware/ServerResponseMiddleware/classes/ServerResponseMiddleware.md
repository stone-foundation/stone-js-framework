[**FetchAdapter**](../../../README.md)

***

[FetchAdapter](../../../README.md) / [middleware/ServerResponseMiddleware](../README.md) / ServerResponseMiddleware

# Class: ServerResponseMiddleware

Maps the Stone.js `OutgoingHttpResponse` onto the Web `Response` options.

It lifts the status, headers and body, and emits every `Set-Cookie` as a separate value (never
folded). `HEAD` responses carry no body. Binary file responses are deferred to a later release;
JSON/text/bytes bodies (the overwhelming majority) are handled here.

## Constructors

### Constructor

> **new ServerResponseMiddleware**(): `ServerResponseMiddleware`

#### Returns

`ServerResponseMiddleware`

## Methods

### handle()

> **handle**(`context`, `next`): `Promise`\<[`FetchAdapterResponseBuilder`](../../../declarations/type-aliases/FetchAdapterResponseBuilder.md)\>

#### Parameters

##### context

[`FetchAdapterContext`](../../../declarations/type-aliases/FetchAdapterContext.md)

The adapter context.

##### next

`NextMiddleware`\<[`FetchAdapterContext`](../../../declarations/type-aliases/FetchAdapterContext.md), [`FetchAdapterResponseBuilder`](../../../declarations/type-aliases/FetchAdapterResponseBuilder.md)\>

The next middleware.

#### Returns

`Promise`\<[`FetchAdapterResponseBuilder`](../../../declarations/type-aliases/FetchAdapterResponseBuilder.md)\>

The raw-response builder.

#### Throws

When the context is missing required components.
