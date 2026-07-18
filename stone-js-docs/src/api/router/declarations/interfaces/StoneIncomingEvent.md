# Interface: StoneIncomingEvent

Represents a Stone incoming event.
Used only in StoneJS.

## Extends

- `IncomingEvent`

## Properties

### acceptsTypes()

```ts
acceptsTypes: (...types) => string | boolean;
```

#### Parameters

##### types

...`string`[]

#### Returns

`string` \| `boolean`

***

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

### is()

```ts
is: (key, value) => boolean;
```

Check if the given value is equal to the specified value.

#### Parameters

##### key

`string`

The key to check.

##### value

`unknown`

The value to compare against.

#### Returns

`boolean`

True if the key's value is equal to the specified value, false otherwise.

#### Overrides

```ts
IncomingEvent.is
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

### preferredType()

```ts
preferredType: (types, defaultType?) => string;
```

#### Parameters

##### types

`string`[]

##### defaultType?

`string`

#### Returns

`string`

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

`U` *extends* [`IIncomingEvent`](IIncomingEvent.md)

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
