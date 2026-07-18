# Interface: IDispacher\<IncomingEventType, OutgoingResponseType\>

Defines the structure for route dispatchers.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](IIncomingEvent.md)

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

## Properties

### dispatch()

```ts
dispatch: (context) => Promiseable<OutgoingResponseType>;
```

#### Parameters

##### context

[`DispatcherContext`](DispatcherContext.md)\<`IncomingEventType`, `OutgoingResponseType`\>

#### Returns

`Promiseable`\<`OutgoingResponseType`\>

***

### getName()

```ts
getName: (route) => Promiseable<string>;
```

#### Parameters

##### route

[`Route`](../../Route/classes/Route.md)\<`IncomingEventType`, `OutgoingResponseType`\>

#### Returns

`Promiseable`\<`string`\>
