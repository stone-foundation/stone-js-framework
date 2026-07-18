# Interface: NodeHttpAdapterContext

Extends the `AdapterContext` interface to provide additional properties for the Node.js HTTP adapter.

This context includes the raw HTTP response (`ServerResponse`) in addition to the standard
Stone.js adapter context properties.

## Extends

- `AdapterContext`\<`IncomingMessage`, `ServerResponse`, [`NodeHttpServer`](../type-aliases/NodeHttpServer.md), `IncomingHttpEvent`, `IncomingHttpEventOptions`, `OutgoingHttpResponse`\>

## Properties

### executionContext

```ts
readonly executionContext: NodeHttpServer;
```

The executionContext of type ExecutionContextType.

#### Inherited from

```ts
AdapterContext.executionContext
```

***

### incomingEvent?

```ts
optional incomingEvent?: IncomingHttpEvent;
```

The incomingEvent associated with the executionContext.

#### Inherited from

```ts
AdapterContext.incomingEvent
```

***

### incomingEventBuilder

```ts
readonly incomingEventBuilder: IAdapterEventBuilder<IncomingHttpEventOptions, IncomingHttpEvent>;
```

The incomingEventBuilder.

#### Inherited from

```ts
AdapterContext.incomingEventBuilder
```

***

### outgoingResponse?

```ts
optional outgoingResponse?: OutgoingHttpResponse;
```

The outgoingResponse associated with the executionContext.

#### Inherited from

```ts
AdapterContext.outgoingResponse
```

***

### rawEvent

```ts
readonly rawEvent: IncomingMessage;
```

The rawEvent of type RawEventType.

#### Inherited from

```ts
AdapterContext.rawEvent
```

***

### rawResponse

```ts
rawResponse: ServerResponse;
```

The raw HTTP response object associated with the current request.

#### Overrides

```ts
AdapterContext.rawResponse
```

***

### rawResponseBuilder

```ts
readonly rawResponseBuilder: IAdapterEventBuilder<RawResponseOptions, IRawResponseWrapper<ServerResponse<IncomingMessage>>>;
```

The rawResponseBuilder.

#### Inherited from

```ts
AdapterContext.rawResponseBuilder
```
