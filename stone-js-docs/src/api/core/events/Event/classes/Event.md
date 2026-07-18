# Class: `abstract` Event

Class representing an Event.

## Author

Mr. Stone <evensstone@gmail.com>

## Extended by

- [`IncomingEvent`](../../IncomingEvent/classes/IncomingEvent.md)
- [`OutgoingResponse`](../../OutgoingResponse/classes/OutgoingResponse.md)

## Constructors

### Constructor

```ts
protected new Event(options): Event;
```

Create an Event.

#### Parameters

##### options

[`EventOptions`](../interfaces/EventOptions.md)

The options to create an Event.

#### Returns

`Event`

## Properties

### metadata

```ts
readonly metadata: Record<string, unknown>;
```

The metadata associated with the event.

***

### source?

```ts
readonly optional source: object;
```

The source of the event.

***

### timeStamp

```ts
readonly timeStamp: number;
```

The timestamp of the event creation.

***

### type

```ts
readonly type: string;
```

The type of the event.

## Methods

### clone()

```ts
clone<T>(): T;
```

Return a cloned instance.

#### Type Parameters

##### T

`T` *extends* `Event`

#### Returns

`T`

A cloned instance of the current class.

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
