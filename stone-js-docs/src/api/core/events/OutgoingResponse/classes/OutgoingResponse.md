# Class: OutgoingResponse

Class representing an OutgoingResponse.

## Extends

- [`Event`](../../Event/classes/Event.md)

## Constructors

### Constructor

```ts
protected new OutgoingResponse(options): OutgoingResponse;
```

Create an OutgoingResponse.

#### Parameters

##### options

[`OutgoingResponseOptions`](../interfaces/OutgoingResponseOptions.md)

The options to create an OutgoingResponse.

#### Returns

`OutgoingResponse`

#### Overrides

[`Event`](../../Event/classes/Event.md).[`constructor`](../../Event/classes/Event.md#constructor)

## Properties

### \_content

```ts
protected _content: unknown;
```

The content of the response.

***

### \_statusCode?

```ts
protected optional _statusCode: number;
```

The status code of the response.

***

### \_statusMessage?

```ts
protected optional _statusMessage: string;
```

The status message of the response.

***

### metadata

```ts
readonly metadata: Record<string, unknown>;
```

The metadata associated with the event.

#### Inherited from

[`Event`](../../Event/classes/Event.md).[`metadata`](../../Event/classes/Event.md#metadata)

***

### originalContent

```ts
readonly originalContent: unknown;
```

The original content of the response.

***

### prepared

```ts
protected prepared: boolean;
```

The prepared status of the response.

***

### source?

```ts
readonly optional source: object;
```

The source of the event.

#### Inherited from

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

### content

#### Get Signature

```ts
get content(): unknown;
```

Gets the content of the outgoing response.

##### Returns

`unknown`

The content of the outgoing response.

***

### isPrepared

#### Get Signature

```ts
get isPrepared(): boolean;
```

Gets the prepared status of the outgoing response.

##### Returns

`boolean`

The prepared status of the response.

***

### statusCode

#### Get Signature

```ts
get statusCode(): undefined | number;
```

Gets the status code of the outgoing response.

##### Returns

`undefined` \| `number`

The status code of the response, or undefined if not set.

***

### statusMessage

#### Get Signature

```ts
get statusMessage(): undefined | string;
```

Gets the status message of the outgoing response.

##### Returns

`undefined` \| `string`

The status message of the response, or undefined if not set.

## Methods

### clone()

```ts
clone<T>(): T;
```

Return a cloned instance.

#### Type Parameters

##### T

`T` *extends* `OutgoingResponse`

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

### prepare()

```ts
prepare(_event, _container?): Promiseable<OutgoingResponse>;
```

Prepare response before sending it.

#### Parameters

##### \_event

[`IncomingEvent`](../../IncomingEvent/classes/IncomingEvent.md)

The incoming event associated with this response.

##### \_container?

`Container`

The container.

#### Returns

[`Promiseable`](../../../declarations/type-aliases/Promiseable.md)\<`OutgoingResponse`\>

This OutgoingResponse instance.

***

### setContent()

```ts
setContent(content): this;
```

Set the content of the response.

#### Parameters

##### content

`unknown`

The content to set.

#### Returns

`this`

This OutgoingResponse instance.

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

### setPrepared()

```ts
setPrepared(prepared): this;
```

Set the prepared status of the response.

#### Parameters

##### prepared

`boolean`

The prepared status to set.

#### Returns

`this`

This OutgoingResponse instance.

***

### setStatus()

```ts
setStatus(code, text?): this;
```

Set the status code of the response.

#### Parameters

##### code

`number`

The status code.

##### text?

`string`

Optional status message.

#### Returns

`this`

This OutgoingResponse instance.

***

### create()

```ts
static create(options): OutgoingResponse;
```

Create an OutgoingResponse.

#### Parameters

##### options

[`OutgoingResponseOptions`](../interfaces/OutgoingResponseOptions.md)

The options to create an OutgoingResponse.

#### Returns

`OutgoingResponse`

A new OutgoingResponse instance.

## Events

### OUTGOING\_RESPONSE

```ts
static OUTGOING_RESPONSE: string = 'stonejs@outgoing_response';
```

OUTGOING_RESPONSE Event name, fires on response to the incoming event.

 OutgoingResponse#OUTGOING_RESPONSE
