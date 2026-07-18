# Interface: AwsLambdaAdapterAdapterConfig

Configuration interface for the AWS Lambda Adapter.

Extends the `AdapterConfig` interface from the Stone.js framework and provides
customizable options specific to the AWS Lambda platform. This includes
alias, resolver, middleware, hooks, and various adapter state flags.

## Extends

- `AdapterConfig`\<[`AwsLambdaEvent`](../../../declarations/type-aliases/AwsLambdaEvent.md), [`RawResponse`](../../../declarations/type-aliases/RawResponse.md), [`AwsLambdaContext`](../../../declarations/type-aliases/AwsLambdaContext.md), `IncomingEvent`, `IncomingEventOptions`, `OutgoingResponse`\>
