# Function: defineRoutes()

Utility function to define multiple routes.

## Param

An array of route definitions, each containing path, module, and options.

## Call Signature

```ts
function defineRoutes<U>(routes): RouterBlueprint<StoneIncomingEvent>;
```

Utility function to define multiple routes with function-based handlers.

### Type Parameters

#### U

`U` *extends* [`IIncomingEvent`](../../../declarations/interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../../../declarations/interfaces/IIncomingEvent.md)

### Parameters

#### routes

(
  \| [`RouteDefinition`](../../../declarations/interfaces/RouteDefinition.md)\<`U`, `unknown`\>
  \| \[[`FunctionalEventHandler`](../../../declarations/type-aliases/FunctionalEventHandler.md)\<`U`\>, [`RouteDefinition`](../../../declarations/interfaces/RouteDefinition.md)\<`U`, `unknown`\>\])[]

An array of route definitions, each containing path, module, and options.

### Returns

[`RouterBlueprint`](../../../options/RouterBlueprint/interfaces/RouterBlueprint.md)\<[`StoneIncomingEvent`](../../../declarations/interfaces/StoneIncomingEvent.md)\>

The RouterBlueprint.

### Param

An array of route definitions, each containing path, module, and options.

## Call Signature

```ts
function defineRoutes<U>(routes): RouterBlueprint<StoneIncomingEvent>;
```

Utility function to define multiple routes with factory-based handlers.

### Type Parameters

#### U

`U` *extends* [`IIncomingEvent`](../../../declarations/interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../../../declarations/interfaces/IIncomingEvent.md)

### Parameters

#### routes

(
  \| [`RouteDefinition`](../../../declarations/interfaces/RouteDefinition.md)\<`U`, `unknown`\>
  \| \[[`FactoryEventHandler`](../../../declarations/type-aliases/FactoryEventHandler.md)\<`U`\>, [`RouteDefinition`](../../../declarations/interfaces/RouteDefinition.md)\<`U`, `unknown`\> & `object`\])[]

An array of route definitions, each containing path, module, and options.

### Returns

[`RouterBlueprint`](../../../options/RouterBlueprint/interfaces/RouterBlueprint.md)\<[`StoneIncomingEvent`](../../../declarations/interfaces/StoneIncomingEvent.md)\>

The RouterBlueprint.

### Param

An array of route definitions, each containing path, module, and options.
