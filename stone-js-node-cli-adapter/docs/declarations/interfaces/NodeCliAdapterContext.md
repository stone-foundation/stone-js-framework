# Interface: NodeCliAdapterContext

Represents the context for the Node Cli Adapter.

This interface extends `AdapterContext` and includes additional properties
specific to generic Node Cli events.

## Extends

- `AdapterContext`\<[`NodeCliEvent`](NodeCliEvent.md), [`RawResponse`](../type-aliases/RawResponse.md), [`NodeCliExecutionContext`](../type-aliases/NodeCliExecutionContext.md), `IncomingEvent`, `IncomingEventOptions`, `OutgoingResponse`\>

## Properties

### executionContext

```ts
readonly executionContext: CommandBuilder;
```

The executionContext of type ExecutionContextType.

#### Inherited from

```ts
AdapterContext.executionContext
```

***

### incomingEvent?

```ts
optional incomingEvent?: IncomingEvent;
```

The incomingEvent associated with the executionContext.

#### Inherited from

```ts
AdapterContext.incomingEvent
```

***

### incomingEventBuilder

```ts
readonly incomingEventBuilder: IAdapterEventBuilder<IncomingEventOptions, IncomingEvent>;
```

The incomingEventBuilder.

#### Inherited from

```ts
AdapterContext.incomingEventBuilder
```

***

### outgoingResponse?

```ts
optional outgoingResponse?: OutgoingResponse;
```

The outgoingResponse associated with the executionContext.

#### Inherited from

```ts
AdapterContext.outgoingResponse
```

***

### rawEvent

```ts
readonly rawEvent: NodeCliEvent;
```

The rawEvent of type RawEventType.

#### Inherited from

```ts
AdapterContext.rawEvent
```

***

### rawResponse

```ts
rawResponse: number;
```

The raw response associated with the current context.

#### Overrides

```ts
AdapterContext.rawResponse
```

***

### rawResponseBuilder

```ts
readonly rawResponseBuilder: IAdapterEventBuilder<RawResponseOptions, IRawResponseWrapper<number>>;
```

The rawResponseBuilder.

#### Inherited from

```ts
AdapterContext.rawResponseBuilder
```
