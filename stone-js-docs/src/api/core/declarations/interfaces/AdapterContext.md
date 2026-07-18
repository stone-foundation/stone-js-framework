# Interface: AdapterContext\<RawEventType, RawResponseType, ExecutionContextType, IncomingEventType, IncomingEventOptionsType, OutgoingResponseType\>

Class representing an AdapterContext.

## Type Parameters

### RawEventType

`RawEventType`

### RawResponseType

`RawResponseType`

### ExecutionContextType

`ExecutionContextType`

### IncomingEventType

`IncomingEventType` *extends* [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md) = [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md)

### IncomingEventOptionsType

`IncomingEventOptionsType` *extends* [`IncomingEventOptions`](../../events/IncomingEvent/interfaces/IncomingEventOptions.md) = [`IncomingEventOptions`](../../events/IncomingEvent/interfaces/IncomingEventOptions.md)

### OutgoingResponseType

`OutgoingResponseType` *extends* [`OutgoingResponse`](../../events/OutgoingResponse/classes/OutgoingResponse.md) = [`OutgoingResponse`](../../events/OutgoingResponse/classes/OutgoingResponse.md)

## Properties

### executionContext

```ts
readonly executionContext: ExecutionContextType;
```

The executionContext of type ExecutionContextType.

***

### incomingEvent?

```ts
optional incomingEvent: IncomingEventType;
```

The incomingEvent associated with the executionContext.

***

### incomingEventBuilder

```ts
readonly incomingEventBuilder: IAdapterEventBuilder<IncomingEventOptionsType, IncomingEventType>;
```

The incomingEventBuilder.

***

### outgoingResponse?

```ts
optional outgoingResponse: OutgoingResponseType;
```

The outgoingResponse associated with the executionContext.

***

### rawEvent

```ts
readonly rawEvent: RawEventType;
```

The rawEvent of type RawEventType.

***

### rawResponse?

```ts
optional rawResponse: RawResponseType;
```

The rawResponse of type RawResponseType.

***

### rawResponseBuilder

```ts
readonly rawResponseBuilder: IAdapterEventBuilder<RawResponseOptions, IRawResponseWrapper<RawResponseType>>;
```

The rawResponseBuilder.
