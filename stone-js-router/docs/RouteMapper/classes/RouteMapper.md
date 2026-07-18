# Class: RouteMapper\<IncomingEventType, OutgoingResponseType\>

Maps route definitions into concrete `Route` instances.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md)

Represents the type of incoming HTTP events.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

Represents the type of outgoing HTTP responses.

## Constructors

### Constructor

```ts
new RouteMapper<IncomingEventType, OutgoingResponseType>(options): RouteMapper<IncomingEventType, OutgoingResponseType>;
```

Constructs a RouteMapper instance.

#### Parameters

##### options

[`RouteMapperOptions`](../interfaces/RouteMapperOptions.md)\<`IncomingEventType`, `OutgoingResponseType`\>

Configuration options for the RouteMapper.

#### Returns

`RouteMapper`\<`IncomingEventType`, `OutgoingResponseType`\>

#### Throws

If `maxDepth` is not a positive integer.

## Methods

### toRoutes()

```ts
toRoutes(definitions): Route<IncomingEventType, OutgoingResponseType>[];
```

Maps route definitions into Route instances.

#### Parameters

##### definitions

[`RouteDefinition`](../../declarations/interfaces/RouteDefinition.md)\<`IncomingEventType`, `OutgoingResponseType`\>[]

An array of route definitions.

#### Returns

[`Route`](../../Route/classes/Route.md)\<`IncomingEventType`, `OutgoingResponseType`\>[]

An array of Route instances.

***

### create()

```ts
static create<IncomingEventType, OutgoingResponseType>(options): RouteMapper<IncomingEventType, OutgoingResponseType>;
```

Factory method to create a RouteMapper instance.

#### Type Parameters

##### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md)

##### OutgoingResponseType

`OutgoingResponseType` = `unknown`

#### Parameters

##### options

[`RouteMapperOptions`](../interfaces/RouteMapperOptions.md)\<`IncomingEventType`, `OutgoingResponseType`\>

Configuration options for the RouteMapper.

#### Returns

`RouteMapper`\<`IncomingEventType`, `OutgoingResponseType`\>

A new RouteMapper instance.
