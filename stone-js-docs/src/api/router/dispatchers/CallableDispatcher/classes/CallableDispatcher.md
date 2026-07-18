# Class: CallableDispatcher\<IncomingEventType, OutgoingResponseType\>

CallableDispatcher

A callable dispatcher for dispatching function-based event handlers.

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
new CallableDispatcher<IncomingEventType, OutgoingResponseType>(resolver): CallableDispatcher<IncomingEventType, OutgoingResponseType>;
```

Create a new instance of CallableDispatcher

#### Parameters

##### resolver

[`DependencyResolver`](../../../declarations/interfaces/DependencyResolver.md)

The dependency resolver

#### Returns

`CallableDispatcher`\<`IncomingEventType`, `OutgoingResponseType`\>

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
getName(_route): string;
```

Get the name of the handler

#### Parameters

##### \_route

[`Route`](../../../Route/classes/Route.md)\<`IncomingEventType`, `OutgoingResponseType`\>

The route

#### Returns

`string`

The name of the handler

#### Implementation of

[`IDispacher`](../../../declarations/interfaces/IDispacher.md).[`getName`](../../../declarations/interfaces/IDispacher.md#getname)
