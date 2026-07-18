# Class: IncomingHttpEvent

Class representing an IncomingHttpEvent.

## Author

Mr. Stone <evensstone@gmail.com>

## Extends

- `IncomingEvent`

## Constructors

### Constructor

```ts
protected new IncomingHttpEvent(options): IncomingHttpEvent;
```

Constructor for IncomingHttpEvent.

#### Parameters

##### options

[`IncomingHttpEventOptions`](../interfaces/IncomingHttpEventOptions.md)

The options to create an IncomingHttpEvent instance.

#### Returns

`IncomingHttpEvent`

#### Throws

If the URL option is not a valid instance of URL.

#### Overrides

```ts
IncomingEvent.constructor
```

## Properties

### \_headers

```ts
protected readonly _headers: Headers;
```

The headers of the request.

***

### accepts

```ts
readonly accepts: Accepts;
```

The content negotiation handler for the request.

***

### body

```ts
readonly body: Record<string, unknown>;
```

The body of the request.

***

### cookies

```ts
readonly cookies: CookieCollection;
```

The cookies included in the request.

***

### files

```ts
readonly files: Record<string, UploadedFile[]>;
```

The files included in the request.

***

### ip

```ts
readonly ip: string;
```

The IP address of the client making the request.

***

### ips

```ts
readonly ips: string[];
```

The list of IP addresses, typically for proxies.

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
readonly method: HttpMethods;
```

The HTTP method of the request.

***

### protocol

```ts
readonly protocol: string;
```

The protocol used for the request (e.g., http or https).

***

### query

```ts
readonly query: URLSearchParams;
```

The query parameters of the request.

***

### queryString?

```ts
readonly optional queryString?: string;
```

The query string of the request.

***

### routeResolver?

```ts
protected optional routeResolver?: () => IRoute;
```

#### Returns

[`IRoute`](../../declarations/interfaces/IRoute.md)

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
readonly url: URL;
```

The URL of the request.

***

### userResolver?

```ts
protected optional userResolver?: () => unknown;
```

#### Returns

`unknown`

***

### INCOMING\_HTTP\_EVENT

```ts
readonly static INCOMING_HTTP_EVENT: "stonejs@incoming_http_event" = 'stonejs@incoming_http_event';
```

## Accessors

### charset

#### Get Signature

```ts
get charset(): string | undefined;
```

##### Returns

`string` \| `undefined`

The charset specified in the content-type header.

***

### charsets

#### Get Signature

```ts
get charsets(): string[];
```

##### Returns

`string`[]

An array of acceptable character sets for the request.

***

### contentType

#### Get Signature

```ts
get contentType(): string;
```

##### Returns

`string`

The content type specified in the headers.

***

### decodedPathname

#### Get Signature

```ts
get decodedPathname(): string | undefined;
```

##### Returns

`string` \| `undefined`

The decoded pathname of the URL.

***

### encodings

#### Get Signature

```ts
get encodings(): string[];
```

##### Returns

`string`[]

An array of acceptable encodings for the request.

***

### etag

#### Get Signature

```ts
get etag(): string | undefined;
```

##### Returns

`string` \| `undefined`

The ETag of the request, if present.

***

### hash

#### Get Signature

```ts
get hash(): string;
```

##### Returns

`string`

The hash part of the URL.

***

### headers

#### Get Signature

```ts
get headers(): Record<string, string>;
```

##### Returns

`Record`\<`string`, `string`\>

The headers of the request.

***

### host

#### Get Signature

```ts
get host(): string;
```

##### Returns

`string`

The host of the URL (hostname:port).

***

### hostname

#### Get Signature

```ts
get hostname(): string;
```

##### Returns

`string`

The hostname of the URL.

***

### isAjax

#### Get Signature

```ts
get isAjax(): boolean;
```

##### Returns

`boolean`

Whether the request is an AJAX request.

***

### isPrefetch

#### Get Signature

```ts
get isPrefetch(): boolean;
```

##### Returns

`boolean`

Whether the request was prefetch.

***

### isSecure

#### Get Signature

```ts
get isSecure(): boolean;
```

##### Returns

`boolean`

Whether the request was made over a secure connection.

***

### isXhr

#### Get Signature

```ts
get isXhr(): boolean;
```

##### Returns

`boolean`

Whether the request is an XMLHttpRequest.

***

### languages

#### Get Signature

```ts
get languages(): string[];
```

##### Returns

`string`[]

An array of acceptable languages for the request.

***

### params

#### Get Signature

```ts
get params(): Record<string, unknown> | undefined;
```

##### Returns

`Record`\<`string`, `unknown`\> \| `undefined`

The route parameters.

***

### path

#### Get Signature

```ts
get path(): string;
```

##### Returns

`string`

The full path including pathname and search query.

***

### pathname

#### Get Signature

```ts
get pathname(): string;
```

##### Returns

`string`

The pathname of the URL.

***

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

***

### scheme

#### Get Signature

```ts
get scheme(): string;
```

##### Returns

`string`

The protocol of the URL (e.g., "http" or "https").

***

### segments

#### Get Signature

```ts
get segments(): string[];
```

##### Returns

`string`[]

The URL segments split by '/'.

***

### types

#### Get Signature

```ts
get types(): string[];
```

##### Returns

`string`[]

An array of acceptable content types for the request.

***

### uri

#### Get Signature

```ts
get uri(): string;
```

##### Returns

`string`

The full URL as a string.

***

### userAgent

#### Get Signature

```ts
get userAgent(): string | undefined;
```

##### Returns

`string` \| `undefined`

The user agent of the request.

## Methods

### acceptsCharsets()

```ts
acceptsCharsets(...values): string | false | string[];
```

Return the first accepted charset.

#### Parameters

##### values

...`string`[]

The charsets to check.

#### Returns

`string` \| `false` \| `string`[]

The first accepted charset, or false if none are accepted.

***

### acceptsEncodings()

```ts
acceptsEncodings(...values): string | false | string[];
```

Return the first accepted encoding.

#### Parameters

##### values

...`string`[]

The encodings to check.

#### Returns

`string` \| `false` \| `string`[]

The first accepted encoding, or false if none are accepted.

***

### acceptsLanguages()

```ts
acceptsLanguages(...values): string | false | string[];
```

Return the first accepted language.

#### Parameters

##### values

...`string`[]

The languages to check.

#### Returns

`string` \| `false` \| `string`[]

The first accepted language, or false if none are accepted.

***

### acceptsTypes()

```ts
acceptsTypes(...values): string | false | string[];
```

Return the first accepted content type.

#### Parameters

##### values

...`string`[]

The content types to check.

#### Returns

`string` \| `false` \| `string`[]

The first accepted type, or false if none are accepted.

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

```ts
IncomingEvent.clone
```

***

### filterFiles()

```ts
filterFiles(files): Record<string, UploadedFile[]>;
```

Filter and return files based on their names.

#### Parameters

##### files

`string`[]

The array of file names to filter.

#### Returns

`Record`\<`string`, `UploadedFile`[]\>

An object containing the filtered files.

***

### fingerprint()

```ts
fingerprint(full?): string;
```

Generate a unique fingerprint for the event.

#### Parameters

##### full?

`boolean`

Whether to include the user agent and IP address in the fingerprint.

#### Returns

`string`

The generated fingerprint as a base64 string.

***

### get()

Get request DATA by key, across the request-data sources only.

Priority: route params → body → query → metadata → fallback.

SECURITY: `get()` deliberately does NOT read headers or cookies. Mixing trust levels
(route params are kernel-trusted; body/query are attacker-controlled) in one lookup let an
attacker spoof a header value — e.g. `event.get('authorization')` could be satisfied by
`?authorization=...`. Read trusted transport values through the dedicated, unspoofable
accessors [getHeader](#getheader) and [getCookie](#getcookie) instead.

#### Param

**key**

The key to look for.

#### Param

**fallback**

A fallback value if the key is not found.

#### Call Signature

```ts
get<TReturn>(key): TReturn | undefined;
```

Get request DATA by key (route params → body → query → metadata).

SECURITY: does NOT read headers or cookies — use [getHeader](#getheader)/[getCookie](#getcookie).

##### Type Parameters

###### TReturn

`TReturn` = `unknown`

##### Parameters

###### key

`string`

The key to look for.

##### Returns

`TReturn` \| `undefined`

The value of the key, or undefined.

##### Overrides

```ts
IncomingEvent.get
```

#### Call Signature

```ts
get<TReturn>(key, fallback): TReturn;
```

Get request DATA by key with a fallback (route params → body → query → metadata).

SECURITY: does NOT read headers or cookies — use [getHeader](#getheader)/[getCookie](#getcookie).

##### Type Parameters

###### TReturn

`TReturn` = `unknown`

##### Parameters

###### key

`string`

The key to look for.

###### fallback

`TReturn`

A fallback value if the key is not found.

##### Returns

`TReturn`

The value of the key or the fallback.

##### Overrides

```ts
IncomingEvent.get
```

***

### getBody()

Get the body of the request.

#### Param

**fallback**

The fallback value if the body is not found.

#### Call Signature

```ts
getBody<TReturn>(): TReturn | undefined;
```

Get the body of the request.

##### Type Parameters

###### TReturn

`TReturn` = `unknown`

##### Returns

`TReturn` \| `undefined`

The body of the request or the fallback.

#### Call Signature

```ts
getBody<TReturn>(fallback): TReturn;
```

Get the body of the request.

##### Type Parameters

###### TReturn

`TReturn` = `unknown`

##### Parameters

###### fallback

`TReturn`

The fallback value if the body is not found.

##### Returns

`TReturn`

The body of the request or the fallback.

***

### getCookie()

Get a cookie value.

#### Param

**name**

The cookie name.

#### Param

**fallback**

A fallback value if the cookie is not found.

#### Call Signature

```ts
getCookie<TReturn>(name): TReturn | undefined;
```

Get a cookie value.

##### Type Parameters

###### TReturn

`TReturn` *extends* [`Cookie`](../../cookies/Cookie/classes/Cookie.md) = [`Cookie`](../../cookies/Cookie/classes/Cookie.md)

##### Parameters

###### name

`string`

The cookie name.

##### Returns

`TReturn` \| `undefined`

The cookie value or the fallback.

#### Call Signature

```ts
getCookie<TReturn>(name, fallback): TReturn;
```

Get a cookie value.

##### Type Parameters

###### TReturn

`TReturn` *extends* [`Cookie`](../../cookies/Cookie/classes/Cookie.md) = [`Cookie`](../../cookies/Cookie/classes/Cookie.md)

##### Parameters

###### name

`string`

The cookie name.

###### fallback

`TReturn`

A fallback value if the cookie is not found.

##### Returns

`TReturn`

The cookie value or the fallback.

***

### getFile()

```ts
getFile(name): UploadedFile[] | undefined;
```

Get a file by its name.

#### Parameters

##### name

`string`

The name of the file.

#### Returns

`UploadedFile`[] \| `undefined`

The file if it exists, otherwise undefined.

***

### getFormat()

```ts
getFormat(mimeType): string | undefined;
```

Get file extension for a given MIME type.

#### Parameters

##### mimeType

`string`

The MIME type.

#### Returns

`string` \| `undefined`

The corresponding file extension, or undefined if not found.

***

### getHeader()

Get a header value.

#### Param

**name**

The header name.

#### Param

**fallback**

A fallback value if the header is not found.

#### Throws

If the header name is not a valid string.

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

##### Throws

If the header name is not a valid string.

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

##### Throws

If the header name is not a valid string.

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

### getMimeType()

```ts
getMimeType(format): string | undefined;
```

Get MIME type for a given file path or extension.

#### Parameters

##### format

`string`

The file path or extension.

#### Returns

`string` \| `undefined`

The corresponding MIME type, or undefined if not found.

***

### getParam()

Retrieve a parameter from the route if it exists.

#### Param

**name**

The name of the parameter to retrieve.

#### Param

**fallback**

The fallback value if the parameter does not exist.

#### Call Signature

```ts
getParam<TReturn>(name): TReturn | undefined;
```

Retrieve a parameter from the route if it exists.

##### Type Parameters

###### TReturn

`TReturn` = `unknown`

##### Parameters

###### name

`string`

The name of the parameter to retrieve.

##### Returns

`TReturn` \| `undefined`

The value of the parameter if it exists, otherwise undefined.

#### Call Signature

```ts
getParam<TReturn>(name, fallback): TReturn;
```

Retrieve a parameter from the route if it exists.

##### Type Parameters

###### TReturn

`TReturn` = `unknown`

##### Parameters

###### name

`string`

The name of the parameter to retrieve.

###### fallback

`TReturn`

The fallback value if the parameter does not exist.

##### Returns

`TReturn`

The value of the parameter if it exists, otherwise undefined.

***

### getRoute()

```ts
getRoute<RouteType>(): RouteType | undefined;
```

Return the current route or a route parameter.

#### Type Parameters

##### RouteType

`RouteType` *extends* [`IRoute`](../../declarations/interfaces/IRoute.md) = [`IRoute`](../../declarations/interfaces/IRoute.md)

#### Returns

`RouteType` \| `undefined`

The route parameter or the route object.

***

### getRouteResolver()

```ts
getRouteResolver(): () => IRoute | undefined;
```

Get the route resolver function.

#### Returns

The route resolver function.

() => [`IRoute`](../../declarations/interfaces/IRoute.md) \| `undefined`

***

### getUri()

```ts
getUri(withDomain?): string | undefined;
```

Get the URI with or without the domain.

#### Parameters

##### withDomain?

`boolean` = `false`

Whether to include the domain in the URI.

#### Returns

`string` \| `undefined`

The URI with or without the domain.

***

### getUser()

```ts
getUser<T>(): T;
```

Get the user instance.

#### Type Parameters

##### T

`T` = `undefined`

#### Returns

`T`

The user object, resolved through a user resolver function if available.

***

### getUserResolver()

```ts
getUserResolver(): () => unknown;
```

Get the user resolver function.

#### Returns

The user resolver function.

() => `unknown`

***

### hasCookie()

```ts
hasCookie(name): boolean;
```

Check if a cookie exists.

#### Parameters

##### name

`string`

The cookie name to check.

#### Returns

`boolean`

True if the cookie exists, otherwise false.

***

### hasFile()

```ts
hasFile(name): boolean;
```

Check if a file exists by its name.

#### Parameters

##### name

`string`

The name of the file.

#### Returns

`boolean`

True if the file exists, otherwise false.

***

### hasHeader()

```ts
hasHeader(name): boolean;
```

Check if a header exists.

#### Parameters

##### name

`string`

The header name to check.

#### Returns

`boolean`

True if the header exists, otherwise false.

***

### hasJson()

```ts
hasJson(key): boolean;
```

Check if a key exists in the JSON body.

#### Parameters

##### key

`string`

The key to check for.

#### Returns

`boolean`

True if the key exists, otherwise false.

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
IncomingEvent.is
```

***

### isFresh()

```ts
isFresh(response): boolean;
```

Determine if the response cache is fresh.

#### Parameters

##### response

[`IOutgoingHttpResponse`](../../declarations/interfaces/IOutgoingHttpResponse.md)

The outgoing HTTP response to check freshness against.

#### Returns

`boolean`

True if the cache is fresh, otherwise false.

***

### isMethod()

```ts
isMethod(method): boolean;
```

Check if the current event method matches the given method.

#### Parameters

##### method

`string`

The method to check.

#### Returns

`boolean`

True if the event method matches, otherwise false.

***

### isMethodCacheable()

```ts
isMethodCacheable(): boolean;
```

Check if the current event method is cacheable.

#### Returns

`boolean`

True if the method is cacheable, otherwise false.

***

### isMethodSafe()

```ts
isMethodSafe(): boolean;
```

Check if the current event method is considered safe.

#### Returns

`boolean`

True if the method is safe, otherwise false.

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

### isStale()

```ts
isStale(response): boolean;
```

Determine if the response cache is stale.

#### Parameters

##### response

[`IOutgoingHttpResponse`](../../declarations/interfaces/IOutgoingHttpResponse.md)

The outgoing HTTP response to check staleness against.

#### Returns

`boolean`

True if the cache is stale, otherwise false.

***

### isType()

```ts
isType(...types): string | false;
```

Check if the request matches one of the given content types.

#### Parameters

##### types

...`string`[]

The content types to check.

#### Returns

`string` \| `false`

The best match, or false if no match is found.

***

### json()

Get a value from the JSON body.

#### Param

**key**

The key to look for in the JSON body.

#### Param

**fallback**

A fallback value if the key is not found.

#### Call Signature

```ts
json<TReturn>(key): TReturn | undefined;
```

Get a value from the JSON body.

##### Type Parameters

###### TReturn

`TReturn` = `unknown`

##### Parameters

###### key

`string`

The key to look for in the JSON body.

##### Returns

`TReturn` \| `undefined`

The value of the key or the fallback.

#### Call Signature

```ts
json<TReturn>(key, fallback): TReturn;
```

Get a value from the JSON body.

##### Type Parameters

###### TReturn

`TReturn` = `unknown`

##### Parameters

###### key

`string`

The key to look for in the JSON body.

###### fallback

`TReturn`

A fallback value if the key is not found.

##### Returns

`TReturn`

The value of the key or the fallback.

***

### preferredType()

```ts
preferredType(types?, defaultType?): string;
```

Determines the preferred response type based on content negotiation.
Uses Accept, Content-Type, User-Agent, and AJAX detection.

#### Parameters

##### types?

`string`[] = `...`

Allowed response types, in priority order.

##### defaultType?

`string` = `'json'`

Default type if none match.

#### Returns

`string`

The best response type as a string.

***

### range()

```ts
range(size, combine?): Result | Ranges | undefined;
```

Get request range.

#### Parameters

##### size

`number`

The maximum size of the resource.

##### combine?

`boolean` = `false`

Specifies if overlapping & adjacent ranges should be combined.

#### Returns

`Result` \| `Ranges` \| `undefined`

The parsed range, or undefined if not applicable.

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

***

### setRouteResolver()

```ts
setRouteResolver<RouteType>(resolver): this;
```

Set the route resolver function.

#### Type Parameters

##### RouteType

`RouteType` *extends* [`IRoute`](../../declarations/interfaces/IRoute.md) = [`IRoute`](../../declarations/interfaces/IRoute.md)

#### Parameters

##### resolver

() => `RouteType`

The route resolver function.

#### Returns

`this`

The current instance for method chaining.

***

### setUserResolver()

```ts
setUserResolver(resolver): this;
```

Set the user resolver function.

#### Parameters

##### resolver

() => `unknown`

The user resolver function.

#### Returns

`this`

The current instance for method chaining.

***

### uriForPath()

```ts
uriForPath(path): string;
```

Generate a full URL for the given path.

#### Parameters

##### path

`string`

The path to append to the base URL.

#### Returns

`string`

The full URL for the given path.

***

### create()

```ts
static create(options): IncomingHttpEvent;
```

Create an IncomingHttpEvent.

#### Parameters

##### options

[`IncomingHttpEventOptions`](../interfaces/IncomingHttpEventOptions.md)

The IncomingHttpEvent options.

#### Returns

`IncomingHttpEvent`

A new instance of IncomingHttpEvent.

#### Overrides

```ts
IncomingEvent.create
```

## Events

### INCOMING\_EVENT

```ts
static INCOMING_EVENT: string;
```

INCOMING_EVENT Event name, fires on platform message.

 IncomingEvent#INCOMING_EVENT

#### Inherited from

```ts
IncomingEvent.INCOMING_EVENT
```
