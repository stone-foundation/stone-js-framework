# Function: createServerLoaderContext()

```ts
function createServerLoaderContext<EventType>(options): ServerLoaderContext<EventType>;
```

Build a [ServerLoaderContext](../interfaces/ServerLoaderContext.md) from primitives. Resolves the auth token from the
cookies (by name) or a bearer `authorization` header value.

## Type Parameters

### EventType

`EventType` = `unknown`

## Parameters

### options

Context primitives.

#### authorization?

`string`

#### cookies?

`Record`\<`string`, `string`\>

#### event

`EventType`

#### fetch?

\{
  (`input`, `init?`): `Promise`\<`Response`\>;
  (`input`, `init?`): `Promise`\<`Response`\>;
\}

#### isServer

`boolean`

#### signal?

`AbortSignal`

#### tokenCookieName?

`string`

## Returns

[`ServerLoaderContext`](../interfaces/ServerLoaderContext.md)\<`EventType`\>

A ready-to-use loader context.
