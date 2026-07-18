# Class: OutgoingBrowserResponse

## Extends

- `OutgoingResponse`

## Extended by

- [`RedirectBrowserResponse`](../../RedirectBrowserResponse/classes/RedirectBrowserResponse.md)

## Constructors

### Constructor

```ts
new OutgoingBrowserResponse(options): OutgoingBrowserResponse;
```

Constructor for OutgoingBrowserResponse.
Initializes headers and cookies based on the provided options.

#### Parameters

##### options

[`OutgoingBrowserResponseOptions`](../interfaces/OutgoingBrowserResponseOptions.md)

Options for the outgoing browser response.

#### Returns

`OutgoingBrowserResponse`

#### Overrides

```ts
OutgoingResponse.constructor
```

## Properties

### \_content

```ts
protected _content: unknown;
```

The content of the response.

#### Inherited from

```ts
OutgoingResponse._content
```

***

### \_statusCode?

```ts
protected optional _statusCode?: number;
```

The status code of the response.

#### Inherited from

```ts
OutgoingResponse._statusCode
```

***

### \_statusMessage?

```ts
protected optional _statusMessage?: string;
```

The status message of the response.

#### Inherited from

```ts
OutgoingResponse._statusMessage
```

***

### metadata

```ts
readonly metadata: Record<string, unknown>;
```

The metadata associated with the event.

#### Inherited from

```ts
OutgoingResponse.metadata
```

***

### originalContent

```ts
readonly originalContent: unknown;
```

The original content of the response.

#### Inherited from

```ts
OutgoingResponse.originalContent
```

***

### prepared

```ts
protected prepared: boolean;
```

The prepared status of the response.

#### Inherited from

```ts
OutgoingResponse.prepared
```

***

### source?

```ts
readonly optional source?: object;
```

The source of the event.

#### Inherited from

```ts
OutgoingResponse.source
```

***

### timeStamp

```ts
readonly timeStamp: number;
```

The timestamp of the event creation.

#### Inherited from

```ts
OutgoingResponse.timeStamp
```

***

### type

```ts
readonly type: string;
```

The type of the event.

#### Inherited from

```ts
OutgoingResponse.type
```

***

### OUTGOING\_BROWSER\_RESPONSE

```ts
static OUTGOING_BROWSER_RESPONSE: string = 'stonejs@outgoing_browser_response';
```

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

#### Inherited from

```ts
OutgoingResponse.content
```

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

#### Inherited from

```ts
OutgoingResponse.isPrepared
```

***

### statusCode

#### Get Signature

```ts
get statusCode(): number | undefined;
```

Gets the status code of the outgoing response.

##### Returns

`number` \| `undefined`

The status code of the response, or undefined if not set.

#### Inherited from

[`RedirectBrowserResponse`](../../RedirectBrowserResponse/classes/RedirectBrowserResponse.md).[`statusCode`](../../RedirectBrowserResponse/classes/RedirectBrowserResponse.md#statuscode)

***

### statusMessage

#### Get Signature

```ts
get statusMessage(): string | undefined;
```

Gets the status message of the outgoing response.

##### Returns

`string` \| `undefined`

The status message of the response, or undefined if not set.

#### Inherited from

[`RedirectBrowserResponse`](../../RedirectBrowserResponse/classes/RedirectBrowserResponse.md).[`statusMessage`](../../RedirectBrowserResponse/classes/RedirectBrowserResponse.md#statusmessage)

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
OutgoingResponse.clone
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
OutgoingResponse.get
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
OutgoingResponse.get
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
OutgoingResponse.getMetadataValue
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
OutgoingResponse.getMetadataValue
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
OutgoingResponse.is
```

***

### is1xx()

```ts
is1xx(): boolean;
```

Check if the status code represents an informational response (1xx).

#### Returns

`boolean`

True if the status code is informational, otherwise false.

***

### is2xx()

```ts
is2xx(): boolean;
```

Check if the status code represents a successful response (2xx).

#### Returns

`boolean`

True if the status code is successful, otherwise false.

***

### is3xx()

```ts
is3xx(): boolean;
```

Check if the status code represents a redirection response (3xx).

#### Returns

`boolean`

True if the status code is a redirection, otherwise false.

***

### is4xx()

```ts
is4xx(): boolean;
```

Check if the status code represents a client error response (4xx).

#### Returns

`boolean`

True if the status code is a client error, otherwise false.

***

### is5xx()

```ts
is5xx(): boolean;
```

Check if the status code represents a server error response (5xx).

#### Returns

`boolean`

True if the status code is a server error, otherwise false.

***

### isError()

```ts
isError(): boolean;
```

Check if the status code is an error (i.e., 4xx or 5xx).

#### Returns

`boolean`

True if the status code is an error, otherwise false.

***

### isForbidden()

```ts
isForbidden(): boolean;
```

Check if the status code is 403 (Forbidden).

#### Returns

`boolean`

True if the status code is 403, otherwise false.

***

### isInStatusRange()

```ts
isInStatusRange(start, end): boolean;
```

Check if the status code falls within the specified range.

#### Parameters

##### start

`number`

The starting value of the range (inclusive).

##### end

`number`

The ending value of the range (exclusive).

#### Returns

`boolean`

True if the status code is within the specified range, otherwise false.

***

### isInvalid()

```ts
isInvalid(): boolean;
```

Check if the status code is invalid.

#### Returns

`boolean`

True if the status code is invalid, otherwise false.

***

### isNotError()

```ts
isNotError(): boolean;
```

Check if the status code is not an error (i.e., not 4xx or 5xx).

#### Returns

`boolean`

True if the status code is not an error, otherwise false.

***

### isNotFound()

```ts
isNotFound(): boolean;
```

Check if the status code is 404 (Not Found).

#### Returns

`boolean`

True if the status code is 404, otherwise false.

***

### isOk()

```ts
isOk(): boolean;
```

Check if the status code is 200 (OK).

#### Returns

`boolean`

True if the status code is 200, otherwise false.

***

### isUnauthorized()

```ts
isUnauthorized(): boolean;
```

Check if the status code is 401 (Unauthorized).

#### Returns

`boolean`

True if the status code is 401, otherwise false.

***

### prepare()

```ts
prepare(_event, _container?): Promiseable<OutgoingBrowserResponse>;
```

Prepare response before sending it.

#### Parameters

##### \_event

`IncomingEvent`

The incoming event associated with this response.

##### \_container?

`Container`

The container.

#### Returns

`Promiseable`\<`OutgoingBrowserResponse`\>

This OutgoingResponse instance.

#### Inherited from

```ts
OutgoingResponse.prepare
```

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

#### Inherited from

```ts
OutgoingResponse.setContent
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
OutgoingResponse.setMetadataValue
```

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

#### Inherited from

```ts
OutgoingResponse.setPrepared
```

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

#### Inherited from

```ts
OutgoingResponse.setStatus
```

***

### create()

```ts
static create(options): OutgoingBrowserResponse;
```

Create an instance of OutgoingBrowserResponse.

#### Parameters

##### options

[`OutgoingBrowserResponseOptions`](../interfaces/OutgoingBrowserResponseOptions.md)

Options for the outgoing browser response.

#### Returns

`OutgoingBrowserResponse`

A new instance of OutgoingBrowserResponse.

#### Overrides

```ts
OutgoingResponse.create
```

## Events

### OUTGOING\_RESPONSE

```ts
static OUTGOING_RESPONSE: string;
```

OUTGOING_RESPONSE Event name, fires on response to the incoming event.

 OutgoingResponse#OUTGOING_RESPONSE

#### Inherited from

```ts
OutgoingResponse.OUTGOING_RESPONSE
```
