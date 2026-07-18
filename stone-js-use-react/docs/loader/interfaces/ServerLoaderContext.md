# Interface: ServerLoaderContext\<EventType\>

Context handed to a server loader. Carries the request, the resolved auth token and
cookies, an abort signal, a credentials-aware `fetch`, and the runtime side (server/client).

## Type Parameters

### EventType

`EventType` = `unknown`

The incoming event type.

## Properties

### cookies

```ts
cookies: Record<string, string>;
```

Parsed request cookies.

***

### event

```ts
event: EventType;
```

The incoming event (request/intention).

***

### fetch

```ts
fetch: {
  (input, init?): Promise<Response>;
  (input, init?): Promise<Response>;
};
```

A fetch implementation (credentials-aware on the server).

#### Call Signature

```ts
(input, init?): Promise<Response>;
```

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/fetch)

##### Parameters

###### input

`URL` \| `RequestInfo`

###### init?

`RequestInit`

##### Returns

`Promise`\<`Response`\>

#### Call Signature

```ts
(input, init?): Promise<Response>;
```

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/fetch)

##### Parameters

###### input

`string` \| `URL` \| `Request`

###### init?

`RequestInit`

##### Returns

`Promise`\<`Response`\>

***

### isClient

```ts
isClient: boolean;
```

True in the browser.

***

### isServer

```ts
isServer: boolean;
```

True during server-side rendering.

***

### signal?

```ts
optional signal?: AbortSignal;
```

Abort signal to cancel the load (e.g. request aborted).

***

### token?

```ts
optional token?: string;
```

Auth token resolved from the request (cookie/header), if any.
