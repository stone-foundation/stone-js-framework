# Interface: AwsLambdaAdapterContext

Represents the context for the AWS Lambda Adapter.

This interface extends `AdapterContext` and includes additional properties
specific to generic AWS Lambda events.

## Extends

- `AdapterContext`\<[`AwsLambdaEvent`](../type-aliases/AwsLambdaEvent.md), [`RawResponse`](../type-aliases/RawResponse.md), [`AwsLambdaContext`](../type-aliases/AwsLambdaContext.md), `IncomingEvent`, `IncomingEventOptions`, `OutgoingResponse`\>

## Properties

### executionContext

```ts
readonly executionContext: ExecutionContextType;
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
readonly rawEvent: RawEventType;
```

The rawEvent of type RawEventType.

#### Inherited from

```ts
AdapterContext.rawEvent
```

***

### rawResponse

```ts
rawResponse: RawResponse;
```

The raw response associated with the current context.

#### Overrides

```ts
AdapterContext.rawResponse
```

***

### rawResponseBuilder

```ts
readonly rawResponseBuilder: IAdapterEventBuilder<RawResponseOptions, IRawResponseWrapper<RawResponse>>;
```

The rawResponseBuilder.

#### Inherited from

```ts
AdapterContext.rawResponseBuilder
```
