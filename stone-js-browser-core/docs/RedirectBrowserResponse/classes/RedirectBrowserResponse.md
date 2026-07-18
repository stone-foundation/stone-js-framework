# Class: RedirectBrowserResponse

Class representing a RedirectBrowserResponse.

## Author

Mr. Stone <evensstone@gmail.com>

## Extends

- [`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md)

## Constructors

### Constructor

```ts
new RedirectBrowserResponse(options): RedirectBrowserResponse;
```

Create a RedirectBrowserResponse.

#### Parameters

##### options

[`RedirectBrowserResponseOptions`](../interfaces/RedirectBrowserResponseOptions.md)

Options for creating the RedirectBrowserResponse.

#### Returns

`RedirectBrowserResponse`

#### Throws

HttpError if the status code is not a redirect code.

#### Overrides

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`constructor`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#constructor)

## Properties

### \_content

```ts
protected _content: unknown;
```

The content of the response.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`_content`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#_content)

***

### \_statusCode?

```ts
protected optional _statusCode?: number;
```

The status code of the response.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`_statusCode`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#_statuscode)

***

### \_statusMessage?

```ts
protected optional _statusMessage?: string;
```

The status message of the response.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`_statusMessage`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#_statusmessage)

***

### metadata

```ts
readonly metadata: Record<string, unknown>;
```

The metadata associated with the event.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`metadata`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#metadata)

***

### originalContent

```ts
readonly originalContent: unknown;
```

The original content of the response.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`originalContent`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#originalcontent)

***

### prepared

```ts
protected prepared: boolean;
```

The prepared status of the response.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`prepared`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#prepared)

***

### source?

```ts
readonly optional source?: object;
```

The source of the event.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`source`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#source)

***

### targetUrl?

```ts
readonly optional targetUrl?: string | URL;
```

***

### timeStamp

```ts
readonly timeStamp: number;
```

The timestamp of the event creation.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`timeStamp`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#timestamp)

***

### type

```ts
readonly type: string;
```

The type of the event.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`type`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#type)

***

### OUTGOING\_BROWSER\_RESPONSE

```ts
static OUTGOING_BROWSER_RESPONSE: string = 'stonejs@outgoing_browser_response';
```

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`OUTGOING_BROWSER_RESPONSE`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#outgoing_browser_response)

***

### REDIRECT\_BROWSER\_RESPONSE

```ts
readonly static REDIRECT_BROWSER_RESPONSE: "stonejs@redirect_browser_response" = 'stonejs@redirect_browser_response';
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

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`content`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#content)

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

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`isPrepared`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#isprepared)

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

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`statusCode`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#statuscode)

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

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`statusMessage`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#statusmessage)

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

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`clone`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#clone)

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

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`get`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#get)

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

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`get`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#get)

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

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`getMetadataValue`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#getmetadatavalue)

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

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`getMetadataValue`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#getmetadatavalue)

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

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`is`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#is)

***

### is1xx()

```ts
is1xx(): boolean;
```

Check if the status code represents an informational response (1xx).

#### Returns

`boolean`

True if the status code is informational, otherwise false.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`is1xx`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#is1xx)

***

### is2xx()

```ts
is2xx(): boolean;
```

Check if the status code represents a successful response (2xx).

#### Returns

`boolean`

True if the status code is successful, otherwise false.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`is2xx`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#is2xx)

***

### is3xx()

```ts
is3xx(): boolean;
```

Check if the status code represents a redirection response (3xx).

#### Returns

`boolean`

True if the status code is a redirection, otherwise false.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`is3xx`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#is3xx)

***

### is4xx()

```ts
is4xx(): boolean;
```

Check if the status code represents a client error response (4xx).

#### Returns

`boolean`

True if the status code is a client error, otherwise false.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`is4xx`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#is4xx)

***

### is5xx()

```ts
is5xx(): boolean;
```

Check if the status code represents a server error response (5xx).

#### Returns

`boolean`

True if the status code is a server error, otherwise false.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`is5xx`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#is5xx)

***

### isError()

```ts
isError(): boolean;
```

Check if the status code is an error (i.e., 4xx or 5xx).

#### Returns

`boolean`

True if the status code is an error, otherwise false.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`isError`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#iserror)

***

### isForbidden()

```ts
isForbidden(): boolean;
```

Check if the status code is 403 (Forbidden).

#### Returns

`boolean`

True if the status code is 403, otherwise false.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`isForbidden`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#isforbidden)

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

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`isInStatusRange`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#isinstatusrange)

***

### isInvalid()

```ts
isInvalid(): boolean;
```

Check if the status code is invalid.

#### Returns

`boolean`

True if the status code is invalid, otherwise false.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`isInvalid`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#isinvalid)

***

### isNotError()

```ts
isNotError(): boolean;
```

Check if the status code is not an error (i.e., not 4xx or 5xx).

#### Returns

`boolean`

True if the status code is not an error, otherwise false.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`isNotError`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#isnoterror)

***

### isNotFound()

```ts
isNotFound(): boolean;
```

Check if the status code is 404 (Not Found).

#### Returns

`boolean`

True if the status code is 404, otherwise false.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`isNotFound`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#isnotfound)

***

### isOk()

```ts
isOk(): boolean;
```

Check if the status code is 200 (OK).

#### Returns

`boolean`

True if the status code is 200, otherwise false.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`isOk`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#isok)

***

### isUnauthorized()

```ts
isUnauthorized(): boolean;
```

Check if the status code is 401 (Unauthorized).

#### Returns

`boolean`

True if the status code is 401, otherwise false.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`isUnauthorized`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#isunauthorized)

***

### prepare()

```ts
prepare(_event, _container?): Promiseable<RedirectBrowserResponse>;
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

`Promiseable`\<`RedirectBrowserResponse`\>

This OutgoingResponse instance.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`prepare`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#prepare)

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

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`setContent`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#setcontent)

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

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`setMetadataValue`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#setmetadatavalue)

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

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`setPrepared`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#setprepared)

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

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`setStatus`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#setstatus)

***

### create()

```ts
static create(options): RedirectBrowserResponse;
```

Create an instance of RedirectBrowserResponse.

#### Parameters

##### options

[`RedirectBrowserResponseOptions`](../interfaces/RedirectBrowserResponseOptions.md)

Options for the outgoing browser response.

#### Returns

`RedirectBrowserResponse`

A new instance of RedirectBrowserResponse.

#### Overrides

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`create`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#create)

***

### to()

```ts
static to(url, statusCode?): RedirectBrowserResponse;
```

Create an instance of RedirectBrowserResponse from the given path or URL.

#### Parameters

##### url

`string` \| `URL`

The path or URL to redirect to. If a string is provided, it will be treated as a relative path.

##### statusCode?

`number` = `302`

The HTTP status code for the redirect (default is 302).

#### Returns

`RedirectBrowserResponse`

A new instance of RedirectBrowserResponse.

## Events

### OUTGOING\_RESPONSE

```ts
static OUTGOING_RESPONSE: string;
```

OUTGOING_RESPONSE Event name, fires on response to the incoming event.

 OutgoingResponse#OUTGOING_RESPONSE

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`OUTGOING_RESPONSE`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#outgoing_response)
