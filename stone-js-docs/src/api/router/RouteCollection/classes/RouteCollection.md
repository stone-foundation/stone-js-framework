# Class: RouteCollection\<IncomingEventType, OutgoingResponseType\>

Manages a collection of `Route` instances.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md)

The type of incoming HTTP events.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

The type of outgoing HTTP responses.

## Constructors

### Constructor

```ts
new RouteCollection<IncomingEventType, OutgoingResponseType>(routes?): RouteCollection<IncomingEventType, OutgoingResponseType>;
```

Constructs a `RouteCollection` instance.

#### Parameters

##### routes?

[`Route`](../../Route/classes/Route.md)\<`IncomingEventType`, `OutgoingResponseType`\>[]

Optional array of `Route` instances to initialize the collection.

#### Returns

`RouteCollection`\<`IncomingEventType`, `OutgoingResponseType`\>

## Accessors

### size

#### Get Signature

```ts
get size(): number;
```

Retrieves the total number of routes in the collection.

##### Returns

`number`

## Methods

### \[iterator\]()

```ts
iterator: Iterator<Route<IncomingEventType, OutgoingResponseType>>;
```

Implements the iterable protocol for iterating over routes.

#### Returns

`Iterator`\<[`Route`](../../Route/classes/Route.md)\<`IncomingEventType`, `OutgoingResponseType`\>\>

An iterator for the routes.

***

### add()

```ts
add(route): this;
```

Adds a `Route` to the collection.

#### Parameters

##### route

[`Route`](../../Route/classes/Route.md)\<`IncomingEventType`, `OutgoingResponseType`\>

The `Route` to add.

#### Returns

`this`

The updated `RouteCollection` instance.

***

### dump()

```ts
dump(): Promise<Record<string, unknown>[]>;
```

Dumps all routes as an array of JSON objects.

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>[]\>

An array of route definitions.

***

### getByName()

```ts
getByName(name): 
  | undefined
| Route<IncomingEventType, OutgoingResponseType>;
```

Retrieves a route by name.

#### Parameters

##### name

`string`

The name of the route.

#### Returns

  \| `undefined`
  \| [`Route`](../../Route/classes/Route.md)\<`IncomingEventType`, `OutgoingResponseType`\>

The corresponding `Route`, or `undefined` if not found.

***

### getRoutes()

```ts
getRoutes(): Route<IncomingEventType, OutgoingResponseType>[];
```

Retrieves all registered routes as an array.

#### Returns

[`Route`](../../Route/classes/Route.md)\<`IncomingEventType`, `OutgoingResponseType`\>[]

An array of all routes.

***

### getRoutesByMethod()

```ts
getRoutesByMethod(method): Route<IncomingEventType, OutgoingResponseType>[];
```

Retrieves all routes for a given HTTP method.

#### Parameters

##### method

`string`

The HTTP method.

#### Returns

[`Route`](../../Route/classes/Route.md)\<`IncomingEventType`, `OutgoingResponseType`\>[]

An array of matching routes.

***

### hasNamedRoute()

```ts
hasNamedRoute(name): boolean;
```

Checks if a named route exists.

#### Parameters

##### name

`string`

The name of the route.

#### Returns

`boolean`

`true` if the named route exists, `false` otherwise.

***

### match()

```ts
match(event, includingMethod): Route<IncomingEventType, OutgoingResponseType>;
```

Matches a `Route` based on an incoming event.

#### Parameters

##### event

`IncomingEventType`

The incoming HTTP event.

##### includingMethod

`boolean` = `true`

Whether to consider the HTTP method during matching. Defaults to `true`.

#### Returns

[`Route`](../../Route/classes/Route.md)\<`IncomingEventType`, `OutgoingResponseType`\>

The matched `Route`.

#### Throws

If no route matches the event.

***

### toString()

```ts
toString(): Promise<string>;
```

Converts all routes to a JSON string.

#### Returns

`Promise`\<`string`\>

A JSON string representing all routes.

***

### create()

```ts
static create<IncomingEventType, OutgoingResponseType>(routes?): RouteCollection<IncomingEventType, OutgoingResponseType>;
```

Factory method to create a `RouteCollection` instance.

#### Type Parameters

##### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md)

##### OutgoingResponseType

`OutgoingResponseType` = `unknown`

#### Parameters

##### routes?

[`Route`](../../Route/classes/Route.md)\<`IncomingEventType`, `OutgoingResponseType`\>[]

Optional array of `Route` instances to initialize the collection.

#### Returns

`RouteCollection`\<`IncomingEventType`, `OutgoingResponseType`\>

A new `RouteCollection` instance.
