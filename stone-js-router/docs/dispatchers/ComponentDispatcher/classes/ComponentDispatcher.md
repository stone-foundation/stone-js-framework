# Class: ComponentDispatcher\<IncomingEventType, OutgoingResponseType\>

ComponentDispatcher

A component dispatcher for dispatching component-based event handlers.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../../../declarations/interfaces/IIncomingEvent.md)

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

## Implements

- [`IDispacher`](../../../declarations/interfaces/IDispacher.md)\<`IncomingEventType`, `OutgoingResponseType`\>

## Constructors

### Constructor

```ts
new ComponentDispatcher<IncomingEventType, OutgoingResponseType>(resolver): ComponentDispatcher<IncomingEventType, OutgoingResponseType>;
```

Create a new instance of ClassDispatcher

#### Parameters

##### resolver

[`DependencyResolver`](../../../declarations/interfaces/DependencyResolver.md)

The dependency resolver

#### Returns

`ComponentDispatcher`\<`IncomingEventType`, `OutgoingResponseType`\>

## Methods

### dispatch()

```ts
dispatch(context): Promiseable<OutgoingResponseType>;
```

For the component we don't resolve the handler here.
So Component third party library can handle all the logic.

#### Parameters

##### context

[`DispatcherContext`](../../../declarations/interfaces/DispatcherContext.md)\<`IncomingEventType`, `OutgoingResponseType`\>

The dispatcher context

#### Returns

`Promiseable`\<`OutgoingResponseType`\>

The outgoing response

#### Throws

If the action is not found in the handler

#### Implementation of

[`IDispacher`](../../../declarations/interfaces/IDispacher.md).[`dispatch`](../../../declarations/interfaces/IDispacher.md#dispatch)

***

### getName()

```ts
getName(route): Promise<string>;
```

Get the name of the handler

#### Parameters

##### route

[`Route`](../../../Route/classes/Route.md)\<`IncomingEventType`, `OutgoingResponseType`\>

The route

#### Returns

`Promise`\<`string`\>

The name of the handler

#### Implementation of

[`IDispacher`](../../../declarations/interfaces/IDispacher.md).[`getName`](../../../declarations/interfaces/IDispacher.md#getname)
