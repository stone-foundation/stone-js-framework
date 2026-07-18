# Interface: StoneIncomingEvent

Represents a Stone incoming event.
Used only in StoneJS.

## Extends

- `IncomingEvent`

## Properties

### acceptsTypes

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
optional body?: unknown;
```

***

### decodedPathname?

```ts
optional decodedPathname?: string;
```

***

### getUri

```ts
getUri: (withDomain) => string | undefined;
```

#### Parameters

##### withDomain

`boolean`

#### Returns

`string` \| `undefined`

***

### host

```ts
host: string;
```

***

### is

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

### isMethod

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
readonly optional isSecure?: boolean;
```

***

### locale

```ts
readonly locale: string;
```

The locale of the event.

#### Inherited from

```ts
IncomingEvent.locale
```

***

### metadata

```ts
readonly metadata: Record<string, unknown>;
```

The metadata associated with the event.

#### Inherited from

```ts
IncomingEvent.metadata
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

### preferredType

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
optional query?: URLSearchParams;
```

***

### setRouteResolver

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

### source

```ts
readonly source: IncomingEventSource;
```

The source of the event.

#### Inherited from

```ts
IncomingEvent.source
```

***

### timeStamp

```ts
readonly timeStamp: number;
```

The timestamp of the event creation.

#### Inherited from

```ts
IncomingEvent.timeStamp
```

***

### type

```ts
readonly type: string;
```

The type of the event.

#### Inherited from

```ts
IncomingEvent.type
```

***

### url

```ts
url: URL;
```

## Accessors

### platform

#### Get Signature

```ts
get platform(): string | symbol;
```

Get the platform of the event source.

##### Returns

`string` \| `symbol`

The platform of the event source.

#### Inherited from

```ts
IncomingEvent.platform
```

## Methods

### clone()

```ts
clone(): this;
```

Return a cloned instance.

The `metadata` container is deep-copied (plain objects and arrays are recreated,
special values kept by reference) so that mutating the clone's metadata — e.g. via
middleware — never leaks back into the original event. This is what makes the
Kernel's `originalEvent` snapshot a faithful pre-middleware copy.

#### Returns

`this`

A cloned instance of the current class.

#### Inherited from

```ts
IncomingEvent.clone
```

***

### get()

#### Call Signature

```ts
get<TReturn>(key): TReturn | undefined;
```

Get data from metadata.

##### Type Parameters

###### TReturn

`TReturn` = `unknown`

##### Parameters

###### key

`string`

The key to retrieve from metadata.

##### Returns

`TReturn` \| `undefined`

The value associated with the key or the fallback.

##### Inherited from

```ts
IncomingEvent.get
```

#### Call Signature

```ts
get<TReturn>(key, fallback): TReturn;
```

Get data from metadata.

##### Type Parameters

###### TReturn

`TReturn` = `unknown`

##### Parameters

###### key

`string`

The key to retrieve from metadata.

###### fallback

`TReturn`

The fallback value if the key is not found.

##### Returns

`TReturn`

The value associated with the key or the fallback.

##### Inherited from

```ts
IncomingEvent.get
```

***

### getMetadataValue()

#### Call Signature

```ts
getMetadataValue<TReturn>(key): TReturn | undefined;
```

Get data from metadata.

##### Type Parameters

###### TReturn

`TReturn` = `unknown`

##### Parameters

###### key

`string`

The key to retrieve from metadata.

##### Returns

`TReturn` \| `undefined`

The value associated with the key or the fallback.

##### Inherited from

```ts
IncomingEvent.getMetadataValue
```

#### Call Signature

```ts
getMetadataValue<TReturn>(key, fallback): TReturn;
```

Get data from metadata.

##### Type Parameters

###### TReturn

`TReturn` = `unknown`

##### Parameters

###### key

`string`

The key to retrieve from metadata.

###### fallback

`TReturn`

The fallback value if the key is not found.

##### Returns

`TReturn`

The value associated with the key or the fallback.

##### Inherited from

```ts
IncomingEvent.getMetadataValue
```

***

### isPlatform()

```ts
isPlatform(platform): boolean;
```

Check if the event source is from a platform.

#### Parameters

##### platform

`string` \| `symbol`

The platform to check.

#### Returns

`boolean`

True if the event source is from the platform, false otherwise.

#### Inherited from

```ts
IncomingEvent.isPlatform
```

***

### setMetadataValue()

```ts
setMetadataValue(key, value?): this;
```

Add data to metadata.

#### Parameters

##### key

`string` \| `Record`\<`string`, `unknown`\>

The key or object to add to metadata.

##### value?

`unknown`

The value to associate with the key.

#### Returns

`this`

This Event instance.

#### Inherited from

```ts
IncomingEvent.setMetadataValue
```
