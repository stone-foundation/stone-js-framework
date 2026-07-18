# Class: RouteEvent

Class representing a Route Event.

## Extends

- `Event`

## Constructors

### Constructor

```ts
protected new RouteEvent(options): RouteEvent;
```

Create an Event.

#### Parameters

##### options

`EventOptions`

The options to create an Event.

#### Returns

`RouteEvent`

#### Inherited from

```ts
Event.constructor
```

## Properties

### metadata

```ts
readonly metadata: Record<string, unknown>;
```

The metadata associated with the event.

#### Inherited from

```ts
Event.metadata
```

***

### source?

```ts
readonly optional source?: object;
```

The source of the event.

#### Inherited from

```ts
Event.source
```

***

### timeStamp

```ts
readonly timeStamp: number;
```

The timestamp of the event creation.

#### Inherited from

```ts
Event.timeStamp
```

***

### type

```ts
readonly type: string;
```

The type of the event.

#### Inherited from

```ts
Event.type
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
Event.clone
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
Event.get
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
Event.get
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
Event.getMetadataValue
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
Event.getMetadataValue
```

***

### is()

```ts
is(key, value): boolean;
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

#### Inherited from

```ts
Event.is
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
Event.setMetadataValue
```

***

### create()

```ts
static create(options): RouteEvent;
```

Create a RouteEvent.

#### Parameters

##### options

`EventOptions`

The options to create a RouteEvent.

#### Returns

`RouteEvent`

A new RouteEvent instance.

## Events

### ROUTED

```ts
readonly static ROUTED: string = 'stonejs@router:routed';
```

ROUTE_MATCHED Event name, fires after event matched route.

 RouteEvent#ROUTE_MATCHED

***

### ROUTING

```ts
readonly static ROUTING: string = 'stonejs@router:routing';
```

ROUTING Event name, fires before event match route.

 RouteEvent#ROUTING
