# Class: ClassDispatcher\<IncomingEventType, OutgoingResponseType\>

ClassDispatcher

A class dispatcher for dispatching class-based event handlers.

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
new ClassDispatcher<IncomingEventType, OutgoingResponseType>(resolver): ClassDispatcher<IncomingEventType, OutgoingResponseType>;
```

Create a new instance of ClassDispatcher

#### Parameters

##### resolver

[`DependencyResolver`](../../../declarations/interfaces/DependencyResolver.md)

The dependency resolver

#### Returns

`ClassDispatcher`\<`IncomingEventType`, `OutgoingResponseType`\>

## Methods

### dispatch()

```ts
dispatch(context): Promise<OutgoingResponseType>;
```

Dispatch the event to the handler

#### Parameters

##### context

[`DispatcherContext`](../../../declarations/interfaces/DispatcherContext.md)\<`IncomingEventType`, `OutgoingResponseType`\>

The dispatcher context

#### Returns

`Promise`\<`OutgoingResponseType`\>

The outgoing response

#### Throws

If the action is not found in the handler

#### Implementation of

[`IDispacher`](../../../declarations/interfaces/IDispacher.md).[`dispatch`](../../../declarations/interfaces/IDispacher.md#dispatch)

***

### getName()

```ts
getName(route): string;
```

Get the name of the handler

#### Parameters

##### route

[`Route`](../../../Route/classes/Route.md)\<`IncomingEventType`, `OutgoingResponseType`\>

The route

#### Returns

`string`

The name of the handler

#### Implementation of

[`IDispacher`](../../../declarations/interfaces/IDispacher.md).[`getName`](../../../declarations/interfaces/IDispacher.md#getname)
