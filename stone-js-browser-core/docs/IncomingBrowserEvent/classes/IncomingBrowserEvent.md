# Class: IncomingBrowserEvent

Class representing an IncomingBrowserEvent.

## Author

Mr. Stone <evensstone@gmail.com>

## Extends

- `IncomingEvent`

## Constructors

### Constructor

```ts
protected new IncomingBrowserEvent(options): IncomingBrowserEvent;
```

Constructor for IncomingBrowserEvent.

#### Parameters

##### options

[`IncomingBrowserEventOptions`](../interfaces/IncomingBrowserEventOptions.md)

The options to create an IncomingBrowserEvent instance.

#### Returns

`IncomingBrowserEvent`

#### Throws

If the URL option is not a valid instance of URL.

#### Overrides

```ts
IncomingEvent.constructor
```

## Properties

### cookies

```ts
readonly cookies: CookieCollection;
```

The cookies included in the request.

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
readonly method: "GET";
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

### INCOMING\_BROWSER\_EVENT

```ts
static INCOMING_BROWSER_EVENT: string = 'stonejs@incoming_browser_event';
```

## Accessors

### decodedPathname

#### Get Signature

```ts
get decodedPathname(): string | undefined;
```

##### Returns

`string` \| `undefined`

The decoded pathname of the URL.

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

### isSecure

#### Get Signature

```ts
get isSecure(): boolean;
```

##### Returns

`boolean`

Whether the request was made over a secure connection.

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

The user agent, or undefined outside a browser (SSR/tests/workers).

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

### fingerprint()

```ts
fingerprint(): string;
```

Generate a unique fingerprint for the event.

#### Returns

`string`

The generated fingerprint as a base64 string.

***

### get()

Get data from the request.

Priority:
1. Route params
2. Query params
3. Cookies
4. Metadata
5. Fallback value

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

Get data from the request.

Priority:
1. Route params
2. Query params
3. Cookies
4. Metadata
5. Fallback value

##### Type Parameters

###### TReturn

`TReturn` = `unknown`

##### Parameters

###### key

`string`

The key to look for.

##### Returns

`TReturn` \| `undefined`

The value of the key or the fallback.

##### Overrides

```ts
IncomingEvent.get
```

#### Call Signature

```ts
get<TReturn>(key, fallback): TReturn;
```

Get data from the request.

Priority:
1. Route params
2. Query params
3. Cookies
4. Metadata
5. Fallback value

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
static create(options): IncomingBrowserEvent;
```

Create an IncomingBrowserEvent.

#### Parameters

##### options

[`IncomingBrowserEventOptions`](../interfaces/IncomingBrowserEventOptions.md)

The IncomingBrowserEvent options.

#### Returns

`IncomingBrowserEvent`

A new instance of IncomingBrowserEvent.

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
