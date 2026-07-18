# Function: defineEventHandler()

Utility function to define an event handler.

## Param

The EventHandler module.

## Param

The options for the EventHandler.

## Call Signature

```ts
function defineEventHandler<U, V>(module): Partial<StoneBlueprint<U>>;
```

Utility function to define a function-based event handler.

### Type Parameters

#### U

`U` *extends* [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md) = [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md)

#### V

`V` = [`OutgoingResponse`](../../../events/OutgoingResponse/classes/OutgoingResponse.md)

### Parameters

#### module

[`FunctionalEventHandler`](../../../declarations/type-aliases/FunctionalEventHandler.md)\<`U`, `V`\>

The EventHandler module.

### Returns

`Partial`\<[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\<`U`\>\>

The StoneBlueprint.

### Param

The EventHandler module.

### Param

The options for the EventHandler.

## Call Signature

```ts
function defineEventHandler<U, V>(module, options): Partial<StoneBlueprint<U>>;
```

Utility function to define a factory-based event handler.

### Type Parameters

#### U

`U` *extends* [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md) = [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md)

#### V

`V` = [`OutgoingResponse`](../../../events/OutgoingResponse/classes/OutgoingResponse.md)

### Parameters

#### module

[`FactoryEventHandler`](../../../declarations/type-aliases/FactoryEventHandler.md)\<`U`, `V`\>

The EventHandler module.

#### options

The options for the EventHandler.

##### isFactory

`true`

### Returns

`Partial`\<[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\<`U`\>\>

The StoneBlueprint.

### Param

The EventHandler module.

### Param

The options for the EventHandler.

## Call Signature

```ts
function defineEventHandler<U, V>(module, options): Partial<StoneBlueprint<U>>;
```

Utility function to define a factory-based event handler.

### Type Parameters

#### U

`U` *extends* [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md) = [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md)

#### V

`V` = [`OutgoingResponse`](../../../events/OutgoingResponse/classes/OutgoingResponse.md)

### Parameters

#### module

[`EventHandlerClass`](../../../declarations/type-aliases/EventHandlerClass.md)\<`U`, `V`\>

The EventHandler module.

#### options

The options for the EventHandler.

##### isClass

`true`

### Returns

`Partial`\<[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\<`U`\>\>

The StoneBlueprint.

### Param

The EventHandler module.

### Param

The options for the EventHandler.
