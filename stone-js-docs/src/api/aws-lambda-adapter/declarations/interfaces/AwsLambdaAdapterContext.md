# Interface: AwsLambdaAdapterContext

Represents the context for the AWS Lambda Adapter.

This interface extends `AdapterContext` and includes additional properties
specific to generic AWS Lambda events.

## Extends

- `AdapterContext`\<[`AwsLambdaEvent`](../type-aliases/AwsLambdaEvent.md), [`RawResponse`](../type-aliases/RawResponse.md), [`AwsLambdaContext`](../type-aliases/AwsLambdaContext.md), `IncomingEvent`, `IncomingEventOptions`, `OutgoingResponse`\>

## Properties

### rawResponse

```ts
rawResponse: RawResponse;
```

The raw response associated with the current context.

#### Overrides

```ts
AdapterContext.rawResponse
```
