# Class: Router\<IncomingEventType, OutgoingResponseType\>

Represents a configurable router for managing HTTP routes and handling incoming events.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md)

Type of incoming events.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

Type of outgoing responses.

## Constructors

### Constructor

```ts
protected new Router<IncomingEventType, OutgoingResponseType>(routerOptions): Router<IncomingEventType, OutgoingResponseType>;
```

Constructs a `Router` instance.

#### Parameters

##### routerOptions

[`RouterOptions`](../../declarations/interfaces/RouterOptions.md)\<`IncomingEventType`, `OutgoingResponseType`\>

Configuration options for the router.

#### Returns

`Router`\<`IncomingEventType`, `OutgoingResponseType`\>

## Methods

### add()

```ts
add(path, handlerOrDefinition): this;
```

Registers a route that supports the `GET` and `HEAD` methods.

#### Parameters

##### path

The route path.

`string` | `string`[]

##### handlerOrDefinition

The route handler or functional definition.

[`FunctionalRouteDefinition`](../../declarations/type-aliases/FunctionalRouteDefinition.md)\<`IncomingEventType`, `OutgoingResponseType`\> | [`FunctionalEventHandler`](../../declarations/type-aliases/FunctionalEventHandler.md)\<`IncomingEventType`, `OutgoingResponseType`\>

#### Returns

`this`

The router instance for chaining.

***

### any()

```ts
any(path, handlerOrDefinition): this;
```

Registers a route that supports all HTTP methods.

#### Parameters

##### path

The route path.

`string` | `string`[]

##### handlerOrDefinition

The route handler or functional definition.

[`FunctionalRouteDefinition`](../../declarations/type-aliases/FunctionalRouteDefinition.md)\<`IncomingEventType`, `OutgoingResponseType`\> | [`FunctionalEventHandler`](../../declarations/type-aliases/FunctionalEventHandler.md)\<`IncomingEventType`, `OutgoingResponseType`\>

#### Returns

`this`

The router instance for chaining.

***

### configure()

```ts
configure(options): this;
```

Configures the router with specific options.

#### Parameters

##### options

`Partial`\<[`RouterOptions`](../../declarations/interfaces/RouterOptions.md)\<`IncomingEventType`, `OutgoingResponseType`\>\>

A partial configuration object for the router.

#### Returns

`this`

The current `Router` instance.

***

### define()

```ts
define(definitions): this;
```

Defines multiple route definitions in the router.

#### Parameters

##### definitions

[`RouteDefinition`](../../declarations/interfaces/RouteDefinition.md)\<`IncomingEventType`, `OutgoingResponseType`\>[]

An array of route definitions to add.

#### Returns

`this`

The current `Router` instance.

***

### delete()

```ts
delete(path, handlerOrDefinition): this;
```

Registers a route that supports the `DELETE` method.

#### Parameters

##### path

The route path.

`string` | `string`[]

##### handlerOrDefinition

The route handler or functional definition.

[`FunctionalRouteDefinition`](../../declarations/type-aliases/FunctionalRouteDefinition.md)\<`IncomingEventType`, `OutgoingResponseType`\> | [`FunctionalEventHandler`](../../declarations/type-aliases/FunctionalEventHandler.md)\<`IncomingEventType`, `OutgoingResponseType`\>

#### Returns

`this`

The router instance for chaining.

***

### dispatch()

```ts
dispatch(event): Promise<OutgoingResponseType>;
```

Dispatches an event through the router to find and execute the corresponding route.

#### Parameters

##### event

`IncomingEventType`

The incoming event to process.

#### Returns

`Promise`\<`OutgoingResponseType`\>

A promise resolving to the outgoing response after executing the matched route.

***

### dumpRoutes()

```ts
dumpRoutes(): Promise<Record<string, unknown>[]>;
```

Dumps all routes as an array of JSON objects.

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>[]\>

An array of JSON objects representing the routes.

***

### fallback()

```ts
fallback(action): this;
```

Registers a fallback route to handle unmatched requests.

#### Parameters

##### action

[`FunctionalEventHandler`](../../declarations/type-aliases/FunctionalEventHandler.md)\<`IncomingEventType`, `OutgoingResponseType`\>

The handler to execute for the fallback route.

#### Returns

`this`

The current `Router` instance.

***

### findRoute()

```ts
findRoute(event): Promise<Route<IncomingEventType, OutgoingResponseType>>;
```

Finds and matches a route for the given event.

#### Parameters

##### event

`IncomingEventType`

The incoming event to find a route for.

#### Returns

`Promise`\<[`Route`](../../Route/classes/Route.md)\<`IncomingEventType`, `OutgoingResponseType`\>\>

The matched route.

#### Throws

If no route matches the given event.

***

### gatherRouteMiddleware()

```ts
gatherRouteMiddleware(route): MixedPipe<IncomingEventType, OutgoingResponseType>[];
```

Collects middleware for a specific route, including global and route-specific middleware.

#### Parameters

##### route

[`Route`](../../Route/classes/Route.md)\<`IncomingEventType`, `OutgoingResponseType`\>

The route for which middleware should be gathered.

#### Returns

`MixedPipe`\<`IncomingEventType`, `OutgoingResponseType`\>[]

An array of middleware to execute for the route.

***

### generate()

```ts
generate(options): string;
```

Generates a URL based on a named route and the provided options.

#### Parameters

##### options

[`GenerateOptions`](../../declarations/interfaces/GenerateOptions.md)

Options for generating the URL, including the route name, parameters, and query.

#### Returns

`string`

The generated URL as a string.

#### Throws

If no route is found with the specified name.

***

### get()

```ts
get(path, handlerOrDefinition): this;
```

Registers a route that supports the `GET` and `HEAD` methods.

#### Parameters

##### path

The route path.

`string` | `string`[]

##### handlerOrDefinition

The route handler or functional definition.

[`FunctionalRouteDefinition`](../../declarations/type-aliases/FunctionalRouteDefinition.md)\<`IncomingEventType`, `OutgoingResponseType`\> | [`FunctionalEventHandler`](../../declarations/type-aliases/FunctionalEventHandler.md)\<`IncomingEventType`, `OutgoingResponseType`\>

#### Returns

`this`

The router instance for chaining.

***

### getCurrentRoute()

```ts
getCurrentRoute(): 
  | undefined
| Route<IncomingEventType, OutgoingResponseType>;
```

Retrieves the currently active route.

#### Returns

  \| `undefined`
  \| [`Route`](../../Route/classes/Route.md)\<`IncomingEventType`, `OutgoingResponseType`\>

The current route, or `undefined` if no route is active.

***

### getCurrentRouteName()

```ts
getCurrentRouteName(): undefined | string;
```

Retrieves the name of the currently active route.

#### Returns

`undefined` \| `string`

The name of the current route, or `undefined` if no route is active.

***

### getParam()

```ts
getParam<TReturn>(name, fallback?): undefined | TReturn;
```

Retrieves a specific parameter from the current route.

#### Type Parameters

##### TReturn

`TReturn` = `unknown`

The expected return type of the parameter.

#### Parameters

##### name

`string`

The name of the parameter to retrieve.

##### fallback?

`TReturn`

An optional fallback value to return if the parameter is not found.

#### Returns

`undefined` \| `TReturn`

The value of the parameter, or the fallback value if the parameter is not found.

***

### getParams()

```ts
getParams(): 
  | undefined
  | RouteParams;
```

Retrieves the parameters of the current route.

#### Returns

  \| `undefined`
  \| [`RouteParams`](../../declarations/type-aliases/RouteParams.md)

An object containing the parameters of the current route, or `undefined` if no route is active.

***

### getRoutes()

```ts
getRoutes(): RouteCollection<IncomingEventType, OutgoingResponseType>;
```

Retrieves the collection of all routes in the router.

#### Returns

[`RouteCollection`](../../RouteCollection/classes/RouteCollection.md)\<`IncomingEventType`, `OutgoingResponseType`\>

A `RouteCollection` containing all registered routes.

***

### group()

```ts
group(path, definition?): this;
```

Creates a route group.

#### Parameters

##### path

`string`

The base path for the group.

##### definition?

`Omit`\<[`FunctionalRouteGroupDefinition`](../../declarations/type-aliases/FunctionalRouteGroupDefinition.md)\<`IncomingEventType`, `OutgoingResponseType`\>, `"path"`\>

Optional group-specific route definitions.

#### Returns

`this`

The router instance for chaining.

***

### hasRoute()

```ts
hasRoute(name): boolean;
```

Checks if the router contains a route with the given name(s).

#### Parameters

##### name

A route name or an array of route names to check.

`string` | `string`[]

#### Returns

`boolean`

`true` if at least one of the specified routes exists, `false` otherwise.

***

### isCurrentRouteNamed()

```ts
isCurrentRouteNamed(name): boolean;
```

Checks if the currently active route matches the specified name.

#### Parameters

##### name

`string`

The name to compare with the current route's name.

#### Returns

`boolean`

`true` if the current route's name matches the specified name, `false` otherwise.

***

### match()

```ts
match(
   path, 
   handlerOrDefinition, 
   methods): this;
```

Adds a route to the router for specific HTTP methods.

#### Parameters

##### path

The path for the route.

`string` | `string`[]

##### handlerOrDefinition

The handler to execute or a route definition object.

[`FunctionalRouteDefinition`](../../declarations/type-aliases/FunctionalRouteDefinition.md)\<`IncomingEventType`, `OutgoingResponseType`\> | [`FunctionalEventHandler`](../../declarations/type-aliases/FunctionalEventHandler.md)\<`IncomingEventType`, `OutgoingResponseType`\>

##### methods

[`HttpMethod`](../../declarations/type-aliases/HttpMethod.md)[]

An array of HTTP methods this route should handle.

#### Returns

`this`

The current `Router` instance.

***

### navigate()

```ts
navigate(pathOrOptions, replace?): void;
```

Navigates to a specific route in the browser environment.

#### Parameters

##### pathOrOptions

The path or navigation options, including route name and parameters.

`string` | [`NavigateOptions`](../../declarations/interfaces/NavigateOptions.md)

##### replace?

`boolean`

Whether to replace the current history entry instead of adding a new one.

#### Returns

`void`

#### Throws

If called outside a browser environment.

***

### noGroup()

```ts
noGroup(): this;
```

Removes the current group definition, ending the grouping context.

#### Returns

`this`

The router instance for chaining.

***

### off()

```ts
off(eventName, listener): this;
```

Unsubscribes from an event emitted by the router's event emitter.

#### Parameters

##### eventName

`string`

The name of the event to stop listening for.

##### listener

`FunctionalEventListener`

The listener function to remove.

#### Returns

`this`

The current `Router` instance.

***

### on()

```ts
on(eventName, listener): this;
```

Subscribes to an event emitted by the router's event emitter.

#### Parameters

##### eventName

`string`

The name of the event to listen for.

##### listener

`FunctionalEventListener`

The listener function to execute when the event is emitted.

#### Returns

`this`

The current `Router` instance.

***

### options()

```ts
options(path, handlerOrDefinition): this;
```

Registers a route that supports the `OPTIONS` method.

#### Parameters

##### path

The route path.

`string` | `string`[]

##### handlerOrDefinition

The route handler or functional definition.

[`FunctionalRouteDefinition`](../../declarations/type-aliases/FunctionalRouteDefinition.md)\<`IncomingEventType`, `OutgoingResponseType`\> | [`FunctionalEventHandler`](../../declarations/type-aliases/FunctionalEventHandler.md)\<`IncomingEventType`, `OutgoingResponseType`\>

#### Returns

`this`

The router instance for chaining.

***

### page()

```ts
page(path, definition): this;
```

Registers a route that supports the `GET` and `HEAD` methods.
Route is considered as a page route.

#### Parameters

##### path

The route path.

`string` | `string`[]

##### definition

[`FunctionalPageRouteDefinition`](../../declarations/type-aliases/FunctionalPageRouteDefinition.md)\<`IncomingEventType`, `OutgoingResponseType`\>

The route functional definition.

#### Returns

`this`

The router instance for chaining.

***

### patch()

```ts
patch(path, handlerOrDefinition): this;
```

Registers a route that supports the `PATCH` method.

#### Parameters

##### path

The route path.

`string` | `string`[]

##### handlerOrDefinition

The route handler or functional definition.

[`FunctionalRouteDefinition`](../../declarations/type-aliases/FunctionalRouteDefinition.md)\<`IncomingEventType`, `OutgoingResponseType`\> | [`FunctionalEventHandler`](../../declarations/type-aliases/FunctionalEventHandler.md)\<`IncomingEventType`, `OutgoingResponseType`\>

#### Returns

`this`

The router instance for chaining.

***

### post()

```ts
post(path, handlerOrDefinition): this;
```

Registers a route that supports the `POST` method.

#### Parameters

##### path

The route path.

`string` | `string`[]

##### handlerOrDefinition

The route handler or functional definition.

[`FunctionalRouteDefinition`](../../declarations/type-aliases/FunctionalRouteDefinition.md)\<`IncomingEventType`, `OutgoingResponseType`\> | [`FunctionalEventHandler`](../../declarations/type-aliases/FunctionalEventHandler.md)\<`IncomingEventType`, `OutgoingResponseType`\>

#### Returns

`this`

The router instance for chaining.

***

### put()

```ts
put(path, handlerOrDefinition): this;
```

Registers a route that supports the `PUT` method.

#### Parameters

##### path

The route path.

`string` | `string`[]

##### handlerOrDefinition

The route handler or functional definition.

[`FunctionalRouteDefinition`](../../declarations/type-aliases/FunctionalRouteDefinition.md)\<`IncomingEventType`, `OutgoingResponseType`\> | [`FunctionalEventHandler`](../../declarations/type-aliases/FunctionalEventHandler.md)\<`IncomingEventType`, `OutgoingResponseType`\>

#### Returns

`this`

The router instance for chaining.

***

### respondWithRouteName()

```ts
respondWithRouteName(event, name): Promise<OutgoingResponseType>;
```

Dispatches an event to a specific route by its name.

#### Parameters

##### event

`IncomingEventType`

The incoming event to process.

##### name

`string`

The name of the route to execute.

#### Returns

`Promise`\<`OutgoingResponseType`\>

A promise resolving to the outgoing response after executing the specified route.

#### Throws

If no route is found with the given name.

***

### setRoutes()

```ts
setRoutes(routes): this;
```

Sets the routes for the router using a `RouteCollection`.

#### Parameters

##### routes

[`RouteCollection`](../../RouteCollection/classes/RouteCollection.md)\<`IncomingEventType`, `OutgoingResponseType`\>

The `RouteCollection` instance containing routes to set.

#### Returns

`this`

The current `Router` instance.

#### Throws

If the provided parameter is not an instance of `RouteCollection`.

***

### use()

```ts
use(middleware): this;
```

Adds global middleware to the router.

#### Parameters

##### middleware

A single middleware or an array of middleware to add.

`MixedPipe`\<`IncomingEventType`, `OutgoingResponseType`\> | `MixedPipe`\<`IncomingEventType`, `OutgoingResponseType`\>[]

#### Returns

`this`

The current `Router` instance.

***

### useOn()

```ts
useOn(name, middleware): this;
```

Attaches middleware to specific routes by their name.

#### Parameters

##### name

A single route name or an array of route names to attach the middleware to.

`string` | `string`[]

##### middleware

A single middleware or an array of middleware to attach.

`MixedPipe`\<`IncomingEventType`, `OutgoingResponseType`\> | `MixedPipe`\<`IncomingEventType`, `OutgoingResponseType`\>[]

#### Returns

`this`

The current `Router` instance.

***

### create()

```ts
static create<IncomingEventType, OutgoingResponseType>(options): Router<IncomingEventType, OutgoingResponseType>;
```

Factory method for creating a router instance.

#### Type Parameters

##### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md)

##### OutgoingResponseType

`OutgoingResponseType` = `unknown`

#### Parameters

##### options

[`RouterOptions`](../../declarations/interfaces/RouterOptions.md)\<`IncomingEventType`, `OutgoingResponseType`\>

Configuration options for the router.

#### Returns

`Router`\<`IncomingEventType`, `OutgoingResponseType`\>

A new `Router` instance.
