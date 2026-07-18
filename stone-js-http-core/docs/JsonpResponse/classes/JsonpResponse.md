# Class: JsonpResponse

Class representing a JsonpResponse.

## Author

Mr. Stone <evensstone@gmail.com>

## Extends

- [`JsonResponse`](../../JsonResponse/classes/JsonResponse.md)

## Constructors

### Constructor

```ts
new JsonpResponse(options): JsonpResponse;
```

Constructor for OutgoingHttpResponse.
Initializes headers and cookies based on the provided options.

#### Parameters

##### options

[`OutgoingHttpResponseOptions`](../../OutgoingHttpResponse/interfaces/OutgoingHttpResponseOptions.md)

Options for the outgoing HTTP response.

#### Returns

`JsonpResponse`

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`constructor`](../../JsonResponse/classes/JsonResponse.md#constructor)

## Properties

### \_blueprintResolver?

```ts
protected optional _blueprintResolver?: () => IBlueprint | undefined;
```

#### Returns

`IBlueprint` \| `undefined`

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`_blueprintResolver`](../../JsonResponse/classes/JsonResponse.md#_blueprintresolver)

***

### \_charset?

```ts
protected optional _charset?: Encoding;
```

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`_charset`](../../JsonResponse/classes/JsonResponse.md#_charset)

***

### \_content

```ts
protected _content: unknown;
```

The content of the response.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`_content`](../../JsonResponse/classes/JsonResponse.md#_content)

***

### \_cookieCollection

```ts
protected readonly _cookieCollection: CookieCollection;
```

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`_cookieCollection`](../../JsonResponse/classes/JsonResponse.md#_cookiecollection)

***

### \_formats?

```ts
protected optional _formats?: Record<string, () => unknown>;
```

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`_formats`](../../JsonResponse/classes/JsonResponse.md#_formats)

***

### \_headers

```ts
protected readonly _headers: Headers;
```

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`_headers`](../../JsonResponse/classes/JsonResponse.md#_headers)

***

### \_incomingEventResolver?

```ts
protected optional _incomingEventResolver?: () => IncomingHttpEvent;
```

#### Returns

[`IncomingHttpEvent`](../../IncomingHttpEvent/classes/IncomingHttpEvent.md)

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`_incomingEventResolver`](../../JsonResponse/classes/JsonResponse.md#_incomingeventresolver)

***

### \_statusCode?

```ts
protected optional _statusCode?: number;
```

The status code of the response.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`_statusCode`](../../JsonResponse/classes/JsonResponse.md#_statuscode)

***

### \_statusMessage?

```ts
protected optional _statusMessage?: string;
```

The status message of the response.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`_statusMessage`](../../JsonResponse/classes/JsonResponse.md#_statusmessage)

***

### metadata

```ts
readonly metadata: Record<string, unknown>;
```

The metadata associated with the event.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`metadata`](../../JsonResponse/classes/JsonResponse.md#metadata)

***

### originalContent

```ts
readonly originalContent: unknown;
```

The original content of the response.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`originalContent`](../../JsonResponse/classes/JsonResponse.md#originalcontent)

***

### prepared

```ts
protected prepared: boolean;
```

The prepared status of the response.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`prepared`](../../JsonResponse/classes/JsonResponse.md#prepared)

***

### source?

```ts
readonly optional source?: object;
```

The source of the event.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`source`](../../JsonResponse/classes/JsonResponse.md#source)

***

### timeStamp

```ts
readonly timeStamp: number;
```

The timestamp of the event creation.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`timeStamp`](../../JsonResponse/classes/JsonResponse.md#timestamp)

***

### type

```ts
readonly type: string;
```

The type of the event.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`type`](../../JsonResponse/classes/JsonResponse.md#type)

***

### OUTGOING\_HTTP\_RESPONSE

```ts
readonly static OUTGOING_HTTP_RESPONSE: "stonejs@outgoing_http_jsonp_response" = 'stonejs@outgoing_http_jsonp_response';
```

#### Overrides

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`OUTGOING_HTTP_RESPONSE`](../../JsonResponse/classes/JsonResponse.md#outgoing_http_response)

## Accessors

### blueprint

#### Get Signature

```ts
get blueprint(): IBlueprint | undefined;
```

Get the blueprint associated with the response.

##### Returns

`IBlueprint` \| `undefined`

The blueprint or undefined if not set.

#### Inherited from

[`RedirectResponse`](../../RedirectResponse/classes/RedirectResponse.md).[`blueprint`](../../RedirectResponse/classes/RedirectResponse.md#blueprint)

***

### charset

#### Get Signature

```ts
get charset(): Encoding;
```

Get the character set encoding.
Defaults to 'utf-8' if not explicitly set.

##### Returns

`Encoding`

The character set encoding.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`charset`](../../JsonResponse/classes/JsonResponse.md#charset)

***

### charsetRegExp

#### Get Signature

```ts
get protected charsetRegExp(): RegExp;
```

Get the regular expression for matching charset in content type.

##### Returns

`RegExp`

The regular expression for matching charset in content type.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`charsetRegExp`](../../JsonResponse/classes/JsonResponse.md#charsetregexp)

***

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

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`content`](../../JsonResponse/classes/JsonResponse.md#content)

***

### etag

#### Get Signature

```ts
get etag(): string | undefined;
```

Get the ETag of the response.

##### Returns

`string` \| `undefined`

The value of the ETag header, if present.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`etag`](../../JsonResponse/classes/JsonResponse.md#etag)

***

### headers

#### Get Signature

```ts
get headers(): Headers;
```

Get the headers of the response.

##### Returns

`Headers`

The headers of the response as a Headers object.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`headers`](../../JsonResponse/classes/JsonResponse.md#headers)

***

### incomingEvent

#### Get Signature

```ts
get incomingEvent(): IncomingHttpEvent;
```

Get the associated IncomingHttpEvent.

##### Throws

InternalServerError if the IncomingHttpEvent resolver is not set.

##### Returns

[`IncomingHttpEvent`](../../IncomingHttpEvent/classes/IncomingHttpEvent.md)

The associated IncomingHttpEvent.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`incomingEvent`](../../JsonResponse/classes/JsonResponse.md#incomingevent)

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

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`isPrepared`](../../JsonResponse/classes/JsonResponse.md#isprepared)

***

### lastModified

#### Get Signature

```ts
get lastModified(): string | undefined;
```

Get the Last-Modified date of the response.

##### Returns

`string` \| `undefined`

The value of the Last-Modified header, if present.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`lastModified`](../../JsonResponse/classes/JsonResponse.md#lastmodified)

***

### status

#### Get Signature

```ts
get status(): number | undefined;
```

Get the HTTP status code.

##### Returns

`number` \| `undefined`

The HTTP status code.

#### Inherited from

[`BinaryFileResponse`](../../BinaryFileResponse/classes/BinaryFileResponse.md).[`status`](../../BinaryFileResponse/classes/BinaryFileResponse.md#status)

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

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`statusCode`](../../JsonResponse/classes/JsonResponse.md#statuscode)

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

[`BinaryFileResponse`](../../BinaryFileResponse/classes/BinaryFileResponse.md).[`statusMessage`](../../BinaryFileResponse/classes/BinaryFileResponse.md#statusmessage)

***

### vary

#### Get Signature

```ts
get vary(): string[] | undefined;
```

Get the Vary header as an array of values.

##### Returns

`string`[] \| `undefined`

The Vary header values split by comma, or undefined if not present.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`vary`](../../JsonResponse/classes/JsonResponse.md#vary)

## Methods

### addVary()

```ts
addVary(field): this;
```

Add a field to the Vary header.

#### Parameters

##### field

`string` \| `string`[]

The field to add to the Vary header.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`addVary`](../../JsonResponse/classes/JsonResponse.md#addvary)

***

### appendHeader()

```ts
appendHeader(key, value): this;
```

Append a value to an existing header or create a new header.

#### Parameters

##### key

`string`

The header name.

##### value

`string`

The value to append.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`appendHeader`](../../JsonResponse/classes/JsonResponse.md#appendheader)

***

### calculateContentLength()

```ts
protected calculateContentLength(): number;
```

Calculate the content length.

#### Returns

`number`

The content length.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`calculateContentLength`](../../JsonResponse/classes/JsonResponse.md#calculatecontentlength)

***

### clearCookie()

```ts
clearCookie(
   name, 
   options?, 
   force?): this;
```

Clear a specific cookie from the response.

#### Parameters

##### name

`string`

The name of the cookie to be cleared.

##### options?

[`CookieOptions`](../../declarations/interfaces/CookieOptions.md) = `{}`

Optional settings for the cookie.

##### force?

`boolean` = `false`

Whether to force the removal of the cookie, even if it doesn't exist.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`clearCookie`](../../JsonResponse/classes/JsonResponse.md#clearcookie)

***

### clearCookies()

```ts
clearCookies(force?): this;
```

Clear all cookies from the response.

#### Parameters

##### force?

`boolean` = `false`

Whether to force the removal of all cookies.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`clearCookies`](../../JsonResponse/classes/JsonResponse.md#clearcookies)

***

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

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`clone`](../../JsonResponse/classes/JsonResponse.md#clone)

***

### defaultEtagFn()

```ts
protected defaultEtagFn(content, encoding): string;
```

Generate a default ETag for the given content.

#### Parameters

##### content

`string`

The content to generate an ETag for.

##### encoding

`Encoding`

The encoding to use.

#### Returns

`string`

The generated ETag as a base64 string.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`defaultEtagFn`](../../JsonResponse/classes/JsonResponse.md#defaultetagfn)

***

### ensureCharset()

```ts
protected ensureCharset(value): this;
```

Ensure that the "Content-Type" header has a charset specified.

#### Parameters

##### value

`string`

The "Content-Type" header value.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`ensureCharset`](../../JsonResponse/classes/JsonResponse.md#ensurecharset)

***

### format()

```ts
format(formats): this;
```

Handles content negotiation based on the `Accept` header of the incoming request.

#### Parameters

##### formats

`Record`\<`string`, () => `unknown`\>

An object where keys are MIME types and values are functions that return the content for that MIME type.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`format`](../../JsonResponse/classes/JsonResponse.md#format)

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

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`get`](../../JsonResponse/classes/JsonResponse.md#get)

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

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`get`](../../JsonResponse/classes/JsonResponse.md#get)

***

### getCallback()

```ts
getCallback(): string | undefined;
```

Get callback.

#### Returns

`string` \| `undefined`

The callback function name.

***

### getHashedContent()

```ts
protected getHashedContent(content, encoding): string;
```

Get the hashed content using the specified encoding.

#### Parameters

##### content

`string`

The content to hash.

##### encoding

`Encoding`

The encoding to use for hashing.

#### Returns

`string`

The hashed content as a hexadecimal string.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`getHashedContent`](../../JsonResponse/classes/JsonResponse.md#gethashedcontent)

***

### getHeader()

Get a header value.

#### Param

**name**

The header name.

#### Param

**fallback**

A fallback value if the header is not found.

#### Call Signature

```ts
getHeader<TReturn>(name): TReturn | undefined;
```

Get a header value.

##### Type Parameters

###### TReturn

`TReturn` = `string`

##### Parameters

###### name

`string`

The header name.

##### Returns

`TReturn` \| `undefined`

The header value or the fallback value.

##### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`getHeader`](../../JsonResponse/classes/JsonResponse.md#getheader)

#### Call Signature

```ts
getHeader<TReturn>(name, fallback): TReturn;
```

Get a header value.

##### Type Parameters

###### TReturn

`TReturn` = `string`

##### Parameters

###### name

`string`

The header name.

###### fallback

`TReturn`

A fallback value if the header is not found.

##### Returns

`TReturn`

The header value or the fallback value.

##### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`getHeader`](../../JsonResponse/classes/JsonResponse.md#getheader)

***

### getHeaderNames()

```ts
getHeaderNames(): string[];
```

Get all header names.

#### Returns

`string`[]

An array of all header names.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`getHeaderNames`](../../JsonResponse/classes/JsonResponse.md#getheadernames)

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

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`getMetadataValue`](../../JsonResponse/classes/JsonResponse.md#getmetadatavalue)

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

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`getMetadataValue`](../../JsonResponse/classes/JsonResponse.md#getmetadatavalue)

***

### handleCacheHeaders()

```ts
protected handleCacheHeaders(): this;
```

Handle cache headers like ETag and Last-Modified.

#### Returns

`this`

The current instance of the response for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`handleCacheHeaders`](../../JsonResponse/classes/JsonResponse.md#handlecacheheaders)

***

### handleContentNegotiation()

```ts
protected handleContentNegotiation(): this;
```

Handles content negotiation based on the `Accept` header of the incoming request.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`handleContentNegotiation`](../../JsonResponse/classes/JsonResponse.md#handlecontentnegotiation)

***

### hasHeader()

```ts
hasHeader(key): boolean;
```

Check if a specific header exists.

#### Parameters

##### key

`string`

The header name to check.

#### Returns

`boolean`

True if the header exists, false otherwise.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`hasHeader`](../../JsonResponse/classes/JsonResponse.md#hasheader)

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

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`is`](../../JsonResponse/classes/JsonResponse.md#is)

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

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`is1xx`](../../JsonResponse/classes/JsonResponse.md#is1xx)

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

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`is2xx`](../../JsonResponse/classes/JsonResponse.md#is2xx)

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

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`is3xx`](../../JsonResponse/classes/JsonResponse.md#is3xx)

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

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`is4xx`](../../JsonResponse/classes/JsonResponse.md#is4xx)

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

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`is5xx`](../../JsonResponse/classes/JsonResponse.md#is5xx)

***

### isEmpty()

```ts
isEmpty(): boolean;
```

Check if the response is empty.

#### Returns

`boolean`

True if the status code indicates an empty response, otherwise false.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`isEmpty`](../../JsonResponse/classes/JsonResponse.md#isempty)

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

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`isError`](../../JsonResponse/classes/JsonResponse.md#iserror)

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

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`isForbidden`](../../JsonResponse/classes/JsonResponse.md#isforbidden)

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

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`isInStatusRange`](../../JsonResponse/classes/JsonResponse.md#isinstatusrange)

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

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`isInvalid`](../../JsonResponse/classes/JsonResponse.md#isinvalid)

***

### isMovedPermanently()

```ts
isMovedPermanently(): boolean;
```

Check if the status code is 301 (Moved Permanently).

#### Returns

`boolean`

True if the status code is 301, otherwise false.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`isMovedPermanently`](../../JsonResponse/classes/JsonResponse.md#ismovedpermanently)

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

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`isNotError`](../../JsonResponse/classes/JsonResponse.md#isnoterror)

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

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`isNotFound`](../../JsonResponse/classes/JsonResponse.md#isnotfound)

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

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`isOk`](../../JsonResponse/classes/JsonResponse.md#isok)

***

### isRedirect()

```ts
isRedirect(location?): boolean;
```

Check if the response is a redirect.

#### Parameters

##### location?

`string`

The optional location to check for redirection.

#### Returns

`boolean`

True if the status code indicates a redirect, otherwise false.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`isRedirect`](../../JsonResponse/classes/JsonResponse.md#isredirect)

***

### isResetContent()

```ts
isResetContent(): boolean;
```

Check if the status code is 205 (Reset Content).

#### Returns

`boolean`

True if the status code is 205, otherwise false.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`isResetContent`](../../JsonResponse/classes/JsonResponse.md#isresetcontent)

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

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`isUnauthorized`](../../JsonResponse/classes/JsonResponse.md#isunauthorized)

***

### isValidateable()

```ts
isValidateable(): boolean;
```

Check if the response is validateable.

#### Returns

`boolean`

True if the response has Last-Modified or ETag headers, otherwise false.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`isValidateable`](../../JsonResponse/classes/JsonResponse.md#isvalidateable)

***

### makeJson()

```ts
protected makeJson(): this;
```

Make JSONP response.

#### Returns

`this`

The current instance for method chaining.

#### Throws

If no callback is provided.

#### Overrides

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`makeJson`](../../JsonResponse/classes/JsonResponse.md#makejson)

***

### morphToJson()

```ts
protected morphToJson(content, options?): string;
```

Convert the given content to a JSON string.

#### Parameters

##### content

`unknown`

The content to convert.

##### options?

`Partial`\<[`HttpJsonConfig`](../../options/HttpConfig/interfaces/HttpJsonConfig.md)\> = `{}`

Options to customize the serialization process.

#### Returns

`string`

A JSON string representation of the content.

#### Throws

InternalServerError if the content cannot be converted to JSON.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`morphToJson`](../../JsonResponse/classes/JsonResponse.md#morphtojson)

***

### prepare()

```ts
prepare(event, container?): JsonpResponse | Promise<JsonpResponse>;
```

Prepare the response before sending.

#### Parameters

##### event

[`IncomingHttpEvent`](../../IncomingHttpEvent/classes/IncomingHttpEvent.md)

The incoming HTTP event.

##### container?

`IContainer`

The service container.

#### Returns

`JsonpResponse` \| `Promise`\<`JsonpResponse`\>

The current instance of the response for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`prepare`](../../JsonResponse/classes/JsonResponse.md#prepare)

***

### prepareContentHeaders()

```ts
protected prepareContentHeaders(): this;
```

Prepare content-related headers such as Content-Length and ETag.

#### Returns

`this`

The current instance of the response for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`prepareContentHeaders`](../../JsonResponse/classes/JsonResponse.md#preparecontentheaders)

***

### prepareCookies()

```ts
protected prepareCookies(): this;
```

Prepare cookies by setting the appropriate headers.

#### Returns

`this`

The current instance of the response for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`prepareCookies`](../../JsonResponse/classes/JsonResponse.md#preparecookies)

***

### removeHeader()

```ts
removeHeader(key): this;
```

Remove headers from the response.

#### Parameters

##### key

`string` \| `string`[]

The header or headers to be removed.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`removeHeader`](../../JsonResponse/classes/JsonResponse.md#removeheader)

***

### secureCookies()

```ts
secureCookies(value?): this;
```

Secure all cookies by setting the "Secure" attribute.

#### Parameters

##### value?

`boolean` = `true`

Whether to set or unset the "Secure" attribute for cookies.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`secureCookies`](../../JsonResponse/classes/JsonResponse.md#securecookies)

***

### setBlueprintResolver()

```ts
setBlueprintResolver(resolver): this;
```

Set the resolver for the blueprint.

#### Parameters

##### resolver

() => `IBlueprint` \| `undefined`

A function that returns the blueprint.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`setBlueprintResolver`](../../JsonResponse/classes/JsonResponse.md#setblueprintresolver)

***

### setCallback()

```ts
setCallback(callback): this;
```

Set callback.

#### Parameters

##### callback

`string` \| `string`[]

The callback function name or array of names.

#### Returns

`this`

The current instance for method chaining.

***

### setCharset()

```ts
setCharset(value): this;
```

Set the character set for the response.

#### Parameters

##### value

`string`

The character encoding to use.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`setCharset`](../../JsonResponse/classes/JsonResponse.md#setcharset)

***

### setContent()

```ts
setContent(value, options?): this;
```

Set the response content.
If the content should be JSON, it will be converted appropriately.

#### Parameters

##### value

`unknown`

The content to set.

##### options?

`Partial`\<[`HttpJsonConfig`](../../options/HttpConfig/interfaces/HttpJsonConfig.md)\> = `{}`

The JSON options.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`setContent`](../../JsonResponse/classes/JsonResponse.md#setcontent)

***

### setContentHeaders()

```ts
protected setContentHeaders(): this;
```

Set content headers such as Content-Length and ETag.

#### Returns

`this`

The current instance of the response for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`setContentHeaders`](../../JsonResponse/classes/JsonResponse.md#setcontentheaders)

***

### setContentType()

```ts
setContentType(value): this;
```

Set the content type of the response.

#### Parameters

##### value

`string`

The MIME type for the response.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

#### Throws

InternalServerError if the provided MIME type is invalid.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`setContentType`](../../JsonResponse/classes/JsonResponse.md#setcontenttype)

***

### setContentTypeIfNeeded()

```ts
protected setContentTypeIfNeeded(): this;
```

Set the content type if it's not already set.

#### Returns

`this`

The current instance of the response for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`setContentTypeIfNeeded`](../../JsonResponse/classes/JsonResponse.md#setcontenttypeifneeded)

***

### setCookie()

```ts
setCookie(
   name, 
   value, 
   options?): this;
```

Set a cookie for the response.

#### Parameters

##### name

`string`

The name of the cookie.

##### value

`unknown`

The value of the cookie.

##### options?

[`CookieOptions`](../../declarations/interfaces/CookieOptions.md) = `{}`

Optional settings for the cookie.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`setCookie`](../../JsonResponse/classes/JsonResponse.md#setcookie)

***

### setEtag()

```ts
setEtag(etag?, weak?): this;
```

Set the ETag for the response.

#### Parameters

##### etag?

`string`

The ETag value to set.

##### weak?

`boolean` = `false`

Whether the ETag should be marked as weak.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`setEtag`](../../JsonResponse/classes/JsonResponse.md#setetag)

***

### setHeader()

```ts
setHeader(key, value): this;
```

Set a single header for the response.
If the header is "Content-Type," ensures charset is set appropriately.

#### Parameters

##### key

`string`

The header name.

##### value

`string` \| `string`[]

The value of the header.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`setHeader`](../../JsonResponse/classes/JsonResponse.md#setheader)

***

### setHeaders()

```ts
setHeaders(values): this;
```

Set multiple headers for the response.

#### Parameters

##### values

[`HeadersType`](../../declarations/type-aliases/HeadersType.md)

A key-value pair of headers to be set.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`setHeaders`](../../JsonResponse/classes/JsonResponse.md#setheaders)

***

### setIncomingEventResolver()

```ts
setIncomingEventResolver(resolver): this;
```

Set the resolver for the incoming HTTP event.

#### Parameters

##### resolver

() => [`IncomingHttpEvent`](../../IncomingHttpEvent/classes/IncomingHttpEvent.md)

A function that returns the incoming HTTP event.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`setIncomingEventResolver`](../../JsonResponse/classes/JsonResponse.md#setincomingeventresolver)

***

### setLastModified()

```ts
setLastModified(date?): this;
```

Set the Last-Modified header for the response.

#### Parameters

##### date?

`Date`

The date to set as the Last-Modified header.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`setLastModified`](../../JsonResponse/classes/JsonResponse.md#setlastmodified)

***

### setLinks()

```ts
setLinks(links): this;
```

Set link headers for the response.

#### Parameters

##### links

`Record`\<`string`, `string`\>

An object representing links to set.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`setLinks`](../../JsonResponse/classes/JsonResponse.md#setlinks)

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

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`setMetadataValue`](../../JsonResponse/classes/JsonResponse.md#setmetadatavalue)

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

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`setPrepared`](../../JsonResponse/classes/JsonResponse.md#setprepared)

***

### setStatus()

```ts
setStatus(code, text?): this;
```

Set the HTTP status code of the response.
Also sets a default status message if none is provided.

#### Parameters

##### code

`number`

The HTTP status code.

##### text?

`string`

Optional status message.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

#### Throws

InternalServerError if the status code is invalid.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`setStatus`](../../JsonResponse/classes/JsonResponse.md#setstatus)

***

### setType()

```ts
setType(value): this;
```

Set the content type by file extension.

#### Parameters

##### value

`string`

The file extension.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`setType`](../../JsonResponse/classes/JsonResponse.md#settype)

***

### shouldBeJson()

```ts
protected shouldBeJson(content): boolean;
```

Determine if the content should be serialized as JSON.

#### Parameters

##### content

`unknown`

The content to check.

#### Returns

`boolean`

True if the content should be serialized as JSON, otherwise false.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`shouldBeJson`](../../JsonResponse/classes/JsonResponse.md#shouldbejson)

***

### stringify()

```ts
protected stringify(
   value, 
   replacer?, 
   spaces?, 
   escape?): string;
```

Convert the given value to a JSON string with optional escaping.

#### Parameters

##### value

`unknown`

The value to convert.

##### replacer?

(`this`, `key`, `value`) => `unknown`

A function or array that alters the behavior of the stringification process.

##### spaces?

`string`

The number of spaces to use for pretty-printing the JSON string.

##### escape?

`boolean`

Whether to escape special characters.

#### Returns

`string`

The JSON string representation of the value.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`stringify`](../../JsonResponse/classes/JsonResponse.md#stringify)

***

### create()

```ts
static create<T>(options): T;
```

Create an instance of OutgoingHttpResponse.

#### Type Parameters

##### T

`T` *extends* [`OutgoingHttpResponse`](../../OutgoingHttpResponse/classes/OutgoingHttpResponse.md) = [`OutgoingHttpResponse`](../../OutgoingHttpResponse/classes/OutgoingHttpResponse.md)

#### Parameters

##### options

[`OutgoingHttpResponseOptions`](../../OutgoingHttpResponse/interfaces/OutgoingHttpResponseOptions.md)

Options for the outgoing HTTP response.

#### Returns

`T`

A new instance of OutgoingHttpResponse.

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`create`](../../JsonResponse/classes/JsonResponse.md#create)

## Events

### OUTGOING\_RESPONSE

```ts
static OUTGOING_RESPONSE: string;
```

OUTGOING_RESPONSE Event name, fires on response to the incoming event.

 OutgoingResponse#OUTGOING_RESPONSE

#### Inherited from

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md).[`OUTGOING_RESPONSE`](../../JsonResponse/classes/JsonResponse.md#outgoing_response)
