[**FetchAdapter**](../../../README.md)

***

[FetchAdapter](../../../README.md) / [middleware/IncomingEventMiddleware](../README.md) / IncomingEventMiddleware

# Class: IncomingEventMiddleware

Transforms a Web `Request` into a Stone.js `IncomingHttpEvent`.

Fully platform-agnostic: it relies only on Web-standard APIs (`Request`, `URL`, `Headers`), so
it runs unchanged on Cloudflare Workers, Deno, Bun and the Edge runtimes — no `node:http`, no
`proxy-addr`. The untouched request body is exposed as `metadata.rawBody`; JSON and
URL-encoded bodies are additionally parsed into `body`.

## Constructors

### Constructor

> **new IncomingEventMiddleware**(`options`): `IncomingEventMiddleware`

#### Parameters

##### options

The auto-wired blueprint.

###### blueprint

`IBlueprint`

#### Returns

`IncomingEventMiddleware`

## Methods

### handle()

> **handle**(`context`, `next`): `Promise`\<[`FetchAdapterResponseBuilder`](../../../declarations/type-aliases/FetchAdapterResponseBuilder.md)\>

Build the incoming event from the request.

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
