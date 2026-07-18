# Interface: AwsLambdaHttpAdapterContext

Represents the context for the AWS Lambda HTTP Adapter.

This interface extends `AdapterContext` and includes additional properties specific
to HTTP events in AWS Lambda.

## Extends

- `AdapterContext`\<[`AwsLambdaHttpEvent`](AwsLambdaHttpEvent.md), [`RawHttpResponse`](../type-aliases/RawHttpResponse.md), [`AwsLambdaContext`](../type-aliases/AwsLambdaContext.md), `IncomingHttpEvent`, `IncomingHttpEventOptions`, `OutgoingHttpResponse`\>

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
readonly rawEvent: AwsLambdaHttpEvent;
```

The rawEvent of type RawEventType.

#### Inherited from

```ts
AdapterContext.rawEvent
```

***

### rawResponse

```ts
rawResponse: RawHttpResponseOptions;
```

The raw HTTP response associated with the current context.

#### Overrides

```ts
AdapterContext.rawResponse
```

***

### rawResponseBuilder

```ts
readonly rawResponseBuilder: IAdapterEventBuilder<RawResponseOptions, IRawResponseWrapper<RawHttpResponseOptions>>;
```

The rawResponseBuilder.

#### Inherited from

```ts
AdapterContext.rawResponseBuilder
```
