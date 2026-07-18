# Interface: IIncomingEvent

Represents an incoming event.
Generic interface for incoming events.
Standalone interface for incoming events.

## Extends

- `IncomingEvent`

## Properties

### body?

```ts
optional body: unknown;
```

***

### decodedPathname?

```ts
optional decodedPathname: string;
```

***

### getUri()

```ts
getUri: (withDomain) => undefined | string;
```

#### Parameters

##### withDomain

`boolean`

#### Returns

`undefined` \| `string`

***

### host

```ts
host: string;
```

***

### isMethod()

```ts
isMethod: (method) => boolean;
```

#### Parameters

##### method

[`HttpMethod`](../type-aliases/HttpMethod.md)

#### Returns

`boolean`

***

### isSecure?

```ts
readonly optional isSecure: boolean;
```

***

### method

```ts
method: HttpMethod;
```

***

### pathname

```ts
pathname: string;
```

***

### query?

```ts
optional query: URLSearchParams;
```

***

### setRouteResolver()

```ts
setRouteResolver: <U, V>(resolver) => void;
```

#### Type Parameters

##### U

`U` *extends* `IIncomingEvent`

##### V

`V` = `unknown`

#### Parameters

##### resolver

() => [`Route`](../../Route/classes/Route.md)\<`U`, `V`\>

#### Returns

`void`

***

### url

```ts
url: URL;
```
