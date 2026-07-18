# Class: Route\<IncomingEventType, OutgoingResponseType\>

Represents a route that defines how incoming events are handled.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md)

The type of the incoming event.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

The type of the outgoing response.

## Constructors

### Constructor

```ts
new Route<IncomingEventType, OutgoingResponseType>(options): Route<IncomingEventType, OutgoingResponseType>;
```

Creates a new `Route` instance.

#### Parameters

##### options

[`RouteOptions`](../interfaces/RouteOptions.md)\<`IncomingEventType`, `OutgoingResponseType`\>

Configuration options for the route.

#### Returns

`Route`\<`IncomingEventType`, `OutgoingResponseType`\>

A new `Route` instance.

## Properties

### options

```ts
readonly options: RouteOptions<IncomingEventType, OutgoingResponseType>;
```

Configuration options for the route.

## Accessors

### domain

#### Get Signature

```ts
get domain(): string;
```

Gets the hostname of the route.

##### Returns

`string`

The hostname as a string.

***

### hash

#### Get Signature

```ts
get hash(): string;
```

Gets the hash fragment from the event URL.

##### Returns

`string`

The hash fragment as a string.

***

### method

#### Get Signature

```ts
get method(): HttpMethod;
```

Gets the HTTP method for the route.

##### Returns

[`HttpMethod`](../../declarations/type-aliases/HttpMethod.md)

The HTTP method.

***

### params

#### Get Signature

```ts
get params(): RouteParams;
```

Gets the parameters extracted from the route.

##### Throws

If the event is not bound.

##### Returns

[`RouteParams`](../../declarations/type-aliases/RouteParams.md)

The route parameters.

***

### path

#### Get Signature

```ts
get path(): string;
```

Gets the pathname of the route.

##### Returns

`string`

The pathname as a string.

***

### protocol

#### Get Signature

```ts
get protocol(): string;
```

Gets the protocol for the route.

##### Returns

`string`

The protocol as a string (`http` or `https`).

***

### query

#### Get Signature

```ts
get query(): Record<string, string>;
```

Gets the query parameters from the event URL.

##### Returns

`Record`\<`string`, `string`\>

A record of query parameters.

***

### uri

#### Get Signature

```ts
get uri(): string;
```

Gets the full URI of the route.

##### Returns

`string`

The full URI as a string.

***

### url

#### Get Signature

```ts
get url(): URL;
```

Gets the URL of the event.

##### Returns

`URL`

The event URL or a default URL (`http://localhost`).

## Methods

### addMiddleware()

```ts
addMiddleware(middleware): this;
```

Adds a middleware to the route.

#### Parameters

##### middleware

The middleware to add.

`MixedPipe`\<`IncomingEventType`, `OutgoingResponseType`\> | `MixedPipe`\<`IncomingEventType`, `OutgoingResponseType`\>[]

#### Returns

`this`

The updated `Route` instance.

***

### bind()

```ts
bind(event): Promise<void>;
```

Binds the provided event to the route, initializing route parameters and query data.

#### Parameters

##### event

`IncomingEventType`

The incoming event to bind to the route.

#### Returns

`Promise`\<`void`\>

A promise that resolves once the binding is complete.

***

### generate()

```ts
generate(options): string;
```

Generates a URL or URI for the route with optional parameters, query, hash, and protocol.

#### Parameters

##### options

`Omit`\<[`GenerateOptions`](../../declarations/interfaces/GenerateOptions.md), `"name"`\>

Options for generating the URL.
  - `params`: Route parameters to include in the path.
  - `query`: Query parameters to append to the URL.
  - `hash`: A hash fragment to include in the URL.
  - `withDomain`: Whether to include the domain in the URL.
  - `protocol`: The protocol to use in the URL.

#### Returns

`string`

The generated URL as a string.

#### Throws

`RouterError` if required parameters are missing.

***

### getDefinedParams()

```ts
getDefinedParams(): RouteParams;
```

Retrieves all parameters that are defined (non-undefined values).

#### Returns

[`RouteParams`](../../declarations/type-aliases/RouteParams.md)

A record of defined parameters.

***

### getOption()

Retrieves a specified option from the route configuration.

#### Param

The key of the option to retrieve.

#### Param

An optional fallback value if the option is not found.

#### Call Signature

```ts
getOption<TReturn>(key): undefined | TReturn;
```

Retrieves a specified option from the route configuration.

##### Type Parameters

###### TReturn

`TReturn` = `unknown`

##### Parameters

###### key

keyof [`RouteOptions`](../interfaces/RouteOptions.md)\<[`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md), `unknown`\>

The key of the option to retrieve.

##### Returns

`undefined` \| `TReturn`

The value of the option or the fallback value if not found.

##### Param

The key of the option to retrieve.

##### Param

An optional fallback value if the option is not found.

#### Call Signature

```ts
getOption<TReturn>(key, fallback): TReturn;
```

Retrieves a specified option from the route configuration.

##### Type Parameters

###### TReturn

`TReturn` = `unknown`

##### Parameters

###### key

keyof [`RouteOptions`](../interfaces/RouteOptions.md)\<[`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md), `unknown`\>

The key of the option to retrieve.

###### fallback

`TReturn`

A fallback value if the option is not found.

##### Returns

`TReturn`

The value of the option or the fallback value if not found.

##### Param

The key of the option to retrieve.

##### Param

An optional fallback value if the option is not found.

***

### getOptionalParamNames()

```ts
getOptionalParamNames(): string[];
```

Retrieves the names of all optional parameters.

#### Returns

`string`[]

An array of optional parameter names.

***

### getOptions()

```ts
getOptions<TReturn>(keys): Record<string, TReturn>;
```

Retrieves a specified options from the route configuration.

#### Type Parameters

##### TReturn

`TReturn` = `unknown`

#### Parameters

##### keys

`string`[]

The kesy of the option to retrieve.

#### Returns

`Record`\<`string`, `TReturn`\>

The values of the option.

***

### getParam()

Retrieves the value of a specific parameter.

#### Param

The name of the parameter to retrieve.

#### Param

An optional fallback value if the parameter is not found.

#### Call Signature

```ts
getParam<TReturn>(name): undefined | TReturn;
```

Retrieves the value of a specific parameter.

##### Type Parameters

###### TReturn

`TReturn` = `unknown`

##### Parameters

###### name

`string`

The name of the parameter to retrieve.

##### Returns

`undefined` \| `TReturn`

The value of the parameter or the fallback value if not found.

##### Param

The name of the parameter to retrieve.

##### Param

An optional fallback value if the parameter is not found.

#### Call Signature

```ts
getParam<TReturn>(name, fallback): TReturn;
```

Retrieves the value of a specific parameter.

##### Type Parameters

###### TReturn

`TReturn` = `unknown`

##### Parameters

###### name

`string`

The name of the parameter to retrieve.

###### fallback

`TReturn`

A fallback value if the parameter is not found.

##### Returns

`TReturn`

The value of the parameter or the fallback value if not found.

##### Param

The name of the parameter to retrieve.

##### Param

An optional fallback value if the parameter is not found.

***

### getParamNames()

```ts
getParamNames(): string[];
```

Retrieves the names of all parameters.

#### Returns

`string`[]

An array of parameter names.

***

### hasDomain()

```ts
hasDomain(): boolean;
```

Checks if the route has a domain constraint.

#### Returns

`boolean`

`true` if the route has a domain constraint, otherwise `false`.

***

### hasParam()

```ts
hasParam(name): boolean;
```

Checks if the route has a specific parameter.

#### Parameters

##### name

`string`

The name of the parameter to check.

#### Returns

`boolean`

`true` if the parameter exists, otherwise `false`.

***

### hasParams()

```ts
hasParams(): boolean;
```

Checks if the route has any parameters.

#### Returns

`boolean`

`true` if parameters are present, otherwise `false`.

***

### isFallback()

```ts
isFallback(): boolean;
```

Checks if the route is marked as a fallback route.

#### Returns

`boolean`

`true` if the route is a fallback, otherwise `false`.

***

### isHttpOnly()

```ts
isHttpOnly(): boolean;
```

Checks if the route uses HTTP protocol.

#### Returns

`boolean`

`true` if the route is HTTP-only, otherwise `false`.

***

### isHttpsOnly()

```ts
isHttpsOnly(): boolean;
```

Checks if the route uses HTTPS protocol.

#### Returns

`boolean`

`true` if the route is HTTPS-only, otherwise `false`.

***

### isMiddlewareExcluded()

```ts
isMiddlewareExcluded(mixedMiddleware): boolean;
```

Determines if a specific middleware is excluded from execution.

#### Parameters

##### mixedMiddleware

`MixedPipe`\<`IncomingEventType`, `OutgoingResponseType`\>

The middleware to check.

#### Returns

`boolean`

`true` if the middleware is excluded, otherwise `false`.

***

### isParamNameOptional()

```ts
isParamNameOptional(name): boolean;
```

Checks if a parameter name is optional.

#### Parameters

##### name

`string`

The name of the parameter to check.

#### Returns

`boolean`

`true` if the parameter is optional, otherwise `false`.

***

### isSecure()

```ts
isSecure(): boolean;
```

Checks if the route requires HTTPS for security.

#### Returns

`boolean`

`true` if the route is HTTPS-only, otherwise `false`.

***

### isStrict()

```ts
isStrict(): boolean;
```

Checks if the route operates in strict mode.

#### Returns

`boolean`

`true` if the route is strict, otherwise `false`.

***

### matches()

```ts
matches(event, includingMethod): boolean;
```

Checks if the provided event matches the route.

#### Parameters

##### event

`IncomingEventType`

The incoming event to check against the route.

##### includingMethod

`boolean`

Whether to include HTTP method matching in the evaluation.

#### Returns

`boolean`

`true` if the event matches the route, otherwise `false`.

***

### run()

```ts
run(event): Promise<OutgoingResponseType>;
```

Executes the route's action based on the provided event.

Note: The order of execution is important and should not be changed.

#### Parameters

##### event

`IncomingEventType`

The incoming event to handle.

#### Returns

`Promise`\<`OutgoingResponseType`\>

A promise that resolves to the outgoing response generated by the route's action.

#### Throws

`RouterError` if the route action is invalid.

***

### setDispatchers()

```ts
setDispatchers(dispatchers): this;
```

Sets the dispatchers for handling callable or handler actions.

#### Parameters

##### dispatchers

[`IDispatchers`](../../declarations/type-aliases/IDispatchers.md)\<`IncomingEventType`, `OutgoingResponseType`\>

The dispatchers to set.

#### Returns

`this`

The updated `Route` instance.

***

### setMatchers()

```ts
setMatchers(matchers): this;
```

Sets the matchers to use for evaluating if an event matches the route.

#### Parameters

##### matchers

[`IMatcher`](../../declarations/type-aliases/IMatcher.md)\<`IncomingEventType`, `OutgoingResponseType`\>[]

An array of matchers to set.

#### Returns

`this`

The updated `Route` instance.

***

### setResolver()

```ts
setResolver(resolver?): this;
```

Sets the resolver for the route.
The resolver is used to resolve the route's handler.

#### Parameters

##### resolver?

[`DependencyResolver`](../../declarations/interfaces/DependencyResolver.md)

The resolver to set.

#### Returns

`this`

The updated `Route` instance.

***

### toJSON()

```ts
toJSON(): Promise<Record<string, unknown>>;
```

Converts the route into a JSON object representation.

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

A JSON object representing the route.

***

### toString()

```ts
toString(): Promise<string>;
```

Converts the route into a string representation (JSON format).

#### Returns

`Promise`\<`string`\>

A JSON string representing the route.

***

### create()

```ts
static create<IncomingEventType, OutgoingResponseType>(options): Route<IncomingEventType, OutgoingResponseType>;
```

Factory method for creating a route instance.

#### Type Parameters

##### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md)

##### OutgoingResponseType

`OutgoingResponseType` = `unknown`

#### Parameters

##### options

[`RouteOptions`](../interfaces/RouteOptions.md)\<`IncomingEventType`, `OutgoingResponseType`\>

Configuration options for the route.

#### Returns

`Route`\<`IncomingEventType`, `OutgoingResponseType`\>

A new `Route` instance.
