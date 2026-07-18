# Function: defineEventHandler()

Utility function to define an event handler.

## Param

The EventHandler module.

## Param

Optional handler definition options.

## Param

Indicates that the handler is a factory function.

## Param

Indicates that the handler is a class.

## Param

The action name for the event handler.

## Call Signature

```ts
function defineEventHandler<U>(module): MetaEventHandler<U>;
```

Utility function to define a function-based event handler.

### Type Parameters

#### U

`U` *extends* [`IIncomingEvent`](../../../declarations/interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../../../declarations/interfaces/IIncomingEvent.md)

### Parameters

#### module

[`FunctionalEventHandler`](../../../declarations/type-aliases/FunctionalEventHandler.md)\<`U`\>

The EventHandler module.

### Returns

[`MetaEventHandler`](../../../declarations/interfaces/MetaEventHandler.md)\<`U`\>

The MetaEventHandler.

### Param

The EventHandler module.

### Param

Optional handler definition options.

### Param

Indicates that the handler is a factory function.

### Param

Indicates that the handler is a class.

### Param

The action name for the event handler.

## Call Signature

```ts
function defineEventHandler<U>(module, options): MetaEventHandler<U>;
```

Utility function to define a factory-based event handler.

### Type Parameters

#### U

`U` *extends* [`IIncomingEvent`](../../../declarations/interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../../../declarations/interfaces/IIncomingEvent.md)

### Parameters

#### module

[`FactoryEventHandler`](../../../declarations/type-aliases/FactoryEventHandler.md)\<`U`\>

The EventHandler module.

#### options

Options to specify the handler type.

##### action?

`string`

##### isClass?

`undefined`

##### isFactory

`true`

Indicates that the handler is a factory function.

### Returns

[`MetaEventHandler`](../../../declarations/interfaces/MetaEventHandler.md)\<`U`\>

The MetaEventHandler.

### Param

The EventHandler module.

### Param

Optional handler definition options.

### Param

Indicates that the handler is a factory function.

### Param

Indicates that the handler is a class.

### Param

The action name for the event handler.

## Call Signature

```ts
function defineEventHandler<U>(module, options): MetaEventHandler<U>;
```

Utility function to define a class-based event handler.

### Type Parameters

#### U

`U` *extends* [`IIncomingEvent`](../../../declarations/interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../../../declarations/interfaces/IIncomingEvent.md)

### Parameters

#### module

[`EventHandlerClass`](../../../declarations/type-aliases/EventHandlerClass.md)\<`U`\>

The EventHandler module.

#### options

Options to specify the handler type.

##### action

`string`

The action name for the event handler.

##### isClass

`true`

Indicates that the handler is a class.

##### isFactory?

`undefined`

### Returns

[`MetaEventHandler`](../../../declarations/interfaces/MetaEventHandler.md)\<`U`\>

The MetaEventHandler.

### Param

The EventHandler module.

### Param

Optional handler definition options.

### Param

Indicates that the handler is a factory function.

### Param

Indicates that the handler is a class.

### Param

The action name for the event handler.
