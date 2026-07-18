# Function: defineRoute()

Utility function to define a route.

## Param

The EventHandler module.

## Param

Route definition options.

## Param

Indicates that the handler is a factory function.

## Param

Indicates that the handler is a class.

## Param

The action name for the event handler.

## Call Signature

```ts
function defineRoute<U>(module, options): RouterBlueprint<StoneIncomingEvent>;
```

Utility function to define a route with function-based handler.

### Type Parameters

#### U

`U` *extends* [`IIncomingEvent`](../../../declarations/interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../../../declarations/interfaces/IIncomingEvent.md)

### Parameters

#### module

[`FunctionalEventHandler`](../../../declarations/type-aliases/FunctionalEventHandler.md)\<`U`\>

The EventHandler module.

#### options

[`RouteDefinition`](../../../declarations/interfaces/RouteDefinition.md)\<`U`, `unknown`\> & `object`

Optional route definition options.

### Returns

[`RouterBlueprint`](../../../options/RouterBlueprint/interfaces/RouterBlueprint.md)\<[`StoneIncomingEvent`](../../../declarations/interfaces/StoneIncomingEvent.md)\>

The RouterBlueprint.

### Param

The EventHandler module.

### Param

Route definition options.

### Param

Indicates that the handler is a factory function.

### Param

Indicates that the handler is a class.

### Param

The action name for the event handler.

## Call Signature

```ts
function defineRoute<U>(module, options): RouterBlueprint<StoneIncomingEvent>;
```

Utility function to define a route with factory-based handler.

### Type Parameters

#### U

`U` *extends* [`IIncomingEvent`](../../../declarations/interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../../../declarations/interfaces/IIncomingEvent.md)

### Parameters

#### module

[`FactoryEventHandler`](../../../declarations/type-aliases/FactoryEventHandler.md)\<`U`\>

The EventHandler module.

#### options

[`RouteDefinition`](../../../declarations/interfaces/RouteDefinition.md)\<`U`, `unknown`\> & `object`

Route definition options with isFactory set to true.

### Returns

[`RouterBlueprint`](../../../options/RouterBlueprint/interfaces/RouterBlueprint.md)\<[`StoneIncomingEvent`](../../../declarations/interfaces/StoneIncomingEvent.md)\>

The RouterBlueprint.

### Param

The EventHandler module.

### Param

Route definition options.

### Param

Indicates that the handler is a factory function.

### Param

Indicates that the handler is a class.

### Param

The action name for the event handler.

## Call Signature

```ts
function defineRoute<U>(module, options): RouterBlueprint<StoneIncomingEvent>;
```

Utility function to define a route with class-based handler.

### Type Parameters

#### U

`U` *extends* [`IIncomingEvent`](../../../declarations/interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../../../declarations/interfaces/IIncomingEvent.md)

### Parameters

#### module

[`EventHandlerClass`](../../../declarations/type-aliases/EventHandlerClass.md)\<`U`\>

The EventHandler module.

#### options

[`RouteDefinition`](../../../declarations/interfaces/RouteDefinition.md)\<`U`, `unknown`\> & `object`

Route definition options with isClass and action.

### Returns

[`RouterBlueprint`](../../../options/RouterBlueprint/interfaces/RouterBlueprint.md)\<[`StoneIncomingEvent`](../../../declarations/interfaces/StoneIncomingEvent.md)\>

The RouterBlueprint.

### Param

The EventHandler module.

### Param

Route definition options.

### Param

Indicates that the handler is a factory function.

### Param

Indicates that the handler is a class.

### Param

The action name for the event handler.
