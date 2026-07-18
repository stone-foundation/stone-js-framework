# Class: OutgoingHttpResponse

Class representing an Outgoing HTTP Response.
Extends the OutgoingResponse class and provides additional features
such as setting headers, cookies, and interacting with IncomingHttpEvent.

## Extends

- `OutgoingResponse`

## Extended by

- [`BinaryFileResponse`](../../BinaryFileResponse/classes/BinaryFileResponse.md)
- [`JsonResponse`](../../JsonResponse/classes/JsonResponse.md)
- [`RedirectResponse`](../../RedirectResponse/classes/RedirectResponse.md)

## Implements

- [`IOutgoingHttpResponse`](../../declarations/interfaces/IOutgoingHttpResponse.md)

## Constructors

### Constructor

```ts
new OutgoingHttpResponse(options): OutgoingHttpResponse;
```

Constructor for OutgoingHttpResponse.
Initializes headers and cookies based on the provided options.

#### Parameters

##### options

[`OutgoingHttpResponseOptions`](../interfaces/OutgoingHttpResponseOptions.md)

Options for the outgoing HTTP response.

#### Returns

`OutgoingHttpResponse`

#### Overrides

```ts
OutgoingResponse.constructor
```

## Properties

### \_blueprintResolver()?

```ts
protected optional _blueprintResolver: () => undefined | IBlueprint;
```

#### Returns

`undefined` \| `IBlueprint`

***

### \_charset?

```ts
protected optional _charset: Encoding;
```

***

### \_cookieCollection

```ts
protected readonly _cookieCollection: CookieCollection;
```

***

### \_formats?

```ts
protected optional _formats: Record<string, () => unknown>;
```

***

### \_headers

```ts
protected readonly _headers: Headers;
```

***

### \_incomingEventResolver()?

```ts
protected optional _incomingEventResolver: () => IncomingHttpEvent;
```

#### Returns

[`IncomingHttpEvent`](../../IncomingHttpEvent/classes/IncomingHttpEvent.md)

***

### OUTGOING\_HTTP\_RESPONSE

```ts
static OUTGOING_HTTP_RESPONSE: string = 'stonejs@outgoing_http_response';
```

## Accessors

### blueprint

#### Get Signature

```ts
get blueprint(): undefined | IBlueprint;
```

Get the blueprint associated with the response.

##### Returns

`undefined` \| `IBlueprint`

The blueprint or undefined if not set.

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

***

### etag

#### Get Signature

```ts
get etag(): undefined | string;
```

Get the ETag of the response.

##### Returns

`undefined` \| `string`

The value of the ETag header, if present.

#### Implementation of

[`IOutgoingHttpResponse`](../../declarations/interfaces/IOutgoingHttpResponse.md).[`etag`](../../declarations/interfaces/IOutgoingHttpResponse.md#etag)

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

***

### lastModified

#### Get Signature

```ts
get lastModified(): undefined | string;
```

Get the Last-Modified date of the response.

##### Returns

`undefined` \| `string`

The value of the Last-Modified header, if present.

#### Implementation of

[`IOutgoingHttpResponse`](../../declarations/interfaces/IOutgoingHttpResponse.md).[`lastModified`](../../declarations/interfaces/IOutgoingHttpResponse.md#lastmodified)

***

### status

#### Get Signature

```ts
get status(): undefined | number;
```

Get the HTTP status code.

##### Returns

`undefined` \| `number`

The HTTP status code.

#### Implementation of

[`IOutgoingHttpResponse`](../../declarations/interfaces/IOutgoingHttpResponse.md).[`status`](../../declarations/interfaces/IOutgoingHttpResponse.md#status)

***

### vary

#### Get Signature

```ts
get vary(): undefined | string[];
```

Get the Vary header as an array of values.

##### Returns

`undefined` \| `string`[]

The Vary header values split by comma, or undefined if not present.

## Methods

### addVary()

```ts
addVary(field): this;
```

Add a field to the Vary header.

#### Parameters

##### field

The field to add to the Vary header.

`string` | `string`[]

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

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

***

### calculateContentLength()

```ts
protected calculateContentLength(generateETag): number;
```

Calculate the content length.

#### Parameters

##### generateETag

`boolean`

Whether to generate an ETag for the content.

#### Returns

`number`

The content length.

***

### clearCookie()

```ts
clearCookie(
   name, 
   options, 
   force): this;
```

Clear a specific cookie from the response.

#### Parameters

##### name

`string`

The name of the cookie to be cleared.

##### options

[`CookieOptions`](../../declarations/interfaces/CookieOptions.md) = `{}`

Optional settings for the cookie.

##### force

`boolean` = `false`

Whether to force the removal of the cookie, even if it doesn't exist.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

***

### clearCookies()

```ts
clearCookies(force): this;
```

Clear all cookies from the response.

#### Parameters

##### force

`boolean` = `false`

Whether to force the removal of all cookies.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

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

***

### getHeader()

Get a header value.

#### Param

The header name.

#### Param

A fallback value if the header is not found.

#### Call Signature

```ts
getHeader<TReturn>(name): undefined | TReturn;
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

`undefined` \| `TReturn`

The header value or the fallback value.

##### Param

The header name.

##### Param

A fallback value if the header is not found.

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

##### Param

The header name.

##### Param

A fallback value if the header is not found.

***

### getHeaderNames()

```ts
getHeaderNames(): string[];
```

Get all header names.

#### Returns

`string`[]

An array of all header names.

***

### handleCacheHeaders()

```ts
protected handleCacheHeaders(): this;
```

Handle cache headers like ETag and Last-Modified.

#### Returns

`this`

The current instance of the response for chaining.

***

### handleContentNegotiation()

```ts
protected handleContentNegotiation(): this;
```

Handles content negotiation based on the `Accept` header of the incoming request.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

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

### isEmpty()

```ts
isEmpty(): boolean;
```

Check if the response is empty.

#### Returns

`boolean`

True if the status code indicates an empty response, otherwise false.

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

### isMovedPermanently()

```ts
isMovedPermanently(): boolean;
```

Check if the status code is 301 (Moved Permanently).

#### Returns

`boolean`

True if the status code is 301, otherwise false.

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

***

### isResetContent()

```ts
isResetContent(): boolean;
```

Check if the status code is 205 (Reset Content).

#### Returns

`boolean`

True if the status code is 205, otherwise false.

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

### isValidateable()

```ts
isValidateable(): boolean;
```

Check if the response is validateable.

#### Returns

`boolean`

True if the response has Last-Modified or ETag headers, otherwise false.

***

### morphToJson()

```ts
protected morphToJson(content, options): string;
```

Convert the given content to a JSON string.

#### Parameters

##### content

`unknown`

The content to convert.

##### options

`Partial`\<[`HttpJsonConfig`](../../options/HttpConfig/interfaces/HttpJsonConfig.md)\> = `{}`

Options to customize the serialization process.

#### Returns

`string`

A JSON string representation of the content.

#### Throws

InternalServerError if the content cannot be converted to JSON.

***

### prepare()

```ts
prepare(event, container?): OutgoingHttpResponse | Promise<OutgoingHttpResponse>;
```

Prepare the response before sending.

#### Parameters

##### event

[`IncomingHttpEvent`](../../IncomingHttpEvent/classes/IncomingHttpEvent.md)

The incoming HTTP event.

##### container?

`Container`

The service container.

#### Returns

`OutgoingHttpResponse` \| `Promise`\<`OutgoingHttpResponse`\>

The current instance of the response for chaining.

#### Overrides

```ts
OutgoingResponse.prepare
```

***

### prepareContentHeaders()

```ts
protected prepareContentHeaders(): this;
```

Prepare content-related headers such as Content-Length and ETag.

#### Returns

`this`

The current instance of the response for chaining.

***

### prepareCookies()

```ts
protected prepareCookies(): this;
```

Prepare cookies by setting the appropriate headers.

#### Returns

`this`

The current instance of the response for chaining.

***

### removeHeader()

```ts
removeHeader(key): this;
```

Remove headers from the response.

#### Parameters

##### key

The header or headers to be removed.

`string` | `string`[]

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

***

### secureCookies()

```ts
secureCookies(value): this;
```

Secure all cookies by setting the "Secure" attribute.

#### Parameters

##### value

`boolean` = `true`

Whether to set or unset the "Secure" attribute for cookies.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

***

### setBlueprintResolver()

```ts
setBlueprintResolver(resolver): this;
```

Set the resolver for the blueprint.

#### Parameters

##### resolver

() => `undefined` \| `IBlueprint`

A function that returns the blueprint.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

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

***

### setContent()

```ts
setContent(value, options): this;
```

Set the response content.
If the content should be JSON, it will be converted appropriately.

#### Parameters

##### value

`unknown`

The content to set.

##### options

`Partial`\<[`HttpJsonConfig`](../../options/HttpConfig/interfaces/HttpJsonConfig.md)\> = `{}`

The JSON options.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

#### Overrides

```ts
OutgoingResponse.setContent
```

***

### setContentHeaders()

```ts
protected setContentHeaders(): this;
```

Set content headers such as Content-Length and ETag.

#### Returns

`this`

The current instance of the response for chaining.

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

***

### setContentTypeIfNeeded()

```ts
protected setContentTypeIfNeeded(): this;
```

Set the content type if it's not already set.

#### Returns

`this`

The current instance of the response for chaining.

***

### setCookie()

```ts
setCookie(
   name, 
   value, 
   options): this;
```

Set a cookie for the response.

#### Parameters

##### name

`string`

The name of the cookie.

##### value

`unknown`

The value of the cookie.

##### options

[`CookieOptions`](../../declarations/interfaces/CookieOptions.md) = `{}`

Optional settings for the cookie.

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

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

The value of the header.

`string` | `string`[]

#### Returns

`this`

The current instance of OutgoingHttpResponse for chaining.

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

#### Overrides

```ts
OutgoingResponse.setStatus
```

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

***

### create()

```ts
static create<T>(options): T;
```

Create an instance of OutgoingHttpResponse.

#### Type Parameters

##### T

`T` *extends* `OutgoingHttpResponse` = `OutgoingHttpResponse`

#### Parameters

##### options

[`OutgoingHttpResponseOptions`](../interfaces/OutgoingHttpResponseOptions.md)

Options for the outgoing HTTP response.

#### Returns

`T`

A new instance of OutgoingHttpResponse.

#### Overrides

```ts
OutgoingResponse.create
```
