# Class: IncomingEvent

Class representing an IncomingEvent.

## Author

Mr. Stone <evensstone@gmail.com>

## Extends

- [`Event`](../../Event/classes/Event.md)

## Constructors

### Constructor

```ts
protected new IncomingEvent(options): IncomingEvent;
```

Create an IncomingEvent.

#### Parameters

##### options

[`IncomingEventOptions`](../interfaces/IncomingEventOptions.md)

The options to create an IncomingEvent.

#### Returns

`IncomingEvent`

#### Overrides

[`Event`](../../Event/classes/Event.md).[`constructor`](../../Event/classes/Event.md#constructor)

## Properties

### locale

```ts
readonly locale: string;
```

The locale of the event.

***

### metadata

```ts
readonly metadata: Record<string, unknown>;
```

The metadata associated with the event.

#### Inherited from

[`Event`](../../Event/classes/Event.md).[`metadata`](../../Event/classes/Event.md#metadata)

***

### source

```ts
readonly source: IncomingEventSource;
```

The source of the event.

#### Overrides

[`Event`](../../Event/classes/Event.md).[`source`](../../Event/classes/Event.md#source)

***

### timeStamp

```ts
readonly timeStamp: number;
```

The timestamp of the event creation.

#### Inherited from

[`Event`](../../Event/classes/Event.md).[`timeStamp`](../../Event/classes/Event.md#timestamp)

***

### type

```ts
readonly type: string;
```

The type of the event.

#### Inherited from

[`Event`](../../Event/classes/Event.md).[`type`](../../Event/classes/Event.md#type)

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

## Methods

### clone()

```ts
clone<T>(): T;
```

Return a cloned instance.

#### Type Parameters

##### T

`T` *extends* `IncomingEvent`

#### Returns

`T`

A cloned instance of the current class.

#### Inherited from

[`Event`](../../Event/classes/Event.md).[`clone`](../../Event/classes/Event.md#clone)

***

### get()

Get data from metadata.

#### Param

The key to retrieve from metadata.

#### Param

The fallback value if the key is not found.

#### Call Signature

```ts
get<TReturn>(key): undefined | TReturn;
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

`undefined` \| `TReturn`

The value associated with the key or the fallback.

##### Param

The key to retrieve from metadata.

##### Param

The fallback value if the key is not found.

##### Inherited from

[`Event`](../../Event/classes/Event.md).[`get`](../../Event/classes/Event.md#get)

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

##### Param

The key to retrieve from metadata.

##### Param

The fallback value if the key is not found.

##### Inherited from

[`Event`](../../Event/classes/Event.md).[`get`](../../Event/classes/Event.md#get)

***

### getMetadataValue()

Get data from metadata.

#### Param

The key to retrieve from metadata.

#### Param

The fallback value if the key is not found.

#### Call Signature

```ts
getMetadataValue<TReturn>(key): undefined | TReturn;
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

`undefined` \| `TReturn`

The value associated with the key or the fallback.

##### Param

The key to retrieve from metadata.

##### Param

The fallback value if the key is not found.

##### Inherited from

[`Event`](../../Event/classes/Event.md).[`getMetadataValue`](../../Event/classes/Event.md#getmetadatavalue)

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

##### Param

The key to retrieve from metadata.

##### Param

The fallback value if the key is not found.

##### Inherited from

[`Event`](../../Event/classes/Event.md).[`getMetadataValue`](../../Event/classes/Event.md#getmetadatavalue)

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

[`Event`](../../Event/classes/Event.md).[`is`](../../Event/classes/Event.md#is)

***

### isPlatform()

```ts
isPlatform(platform): boolean;
```

Check if the event source is from a platform.

#### Parameters

##### platform

The platform to check.

`string` | `symbol`

#### Returns

`boolean`

True if the event source is from the platform, false otherwise.

***

### setMetadataValue()

```ts
setMetadataValue(key, value?): this;
```

Add data to metadata.

#### Parameters

##### key

The key or object to add to metadata.

`string` | `Record`\<`string`, `unknown`\>

##### value?

`unknown`

The value to associate with the key.

#### Returns

`this`

This Event instance.

#### Inherited from

[`Event`](../../Event/classes/Event.md).[`setMetadataValue`](../../Event/classes/Event.md#setmetadatavalue)

***

### create()

```ts
static create(options): IncomingEvent;
```

Create an IncomingEvent.

#### Parameters

##### options

[`IncomingEventOptions`](../interfaces/IncomingEventOptions.md)

The options to create an IncomingEvent.

#### Returns

`IncomingEvent`

A new IncomingEvent instance.

## Events

### INCOMING\_EVENT

```ts
static INCOMING_EVENT: string = 'stonejs@incoming_event';
```

INCOMING_EVENT Event name, fires on platform message.

 IncomingEvent#INCOMING_EVENT
