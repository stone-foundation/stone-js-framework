# Interface: AwsLambdaHttpAdapterAdapterConfig

Configuration interface for the AWS Lambda Http Adapter.

Extends the `AdapterConfig` interface from the Stone.js framework and provides
customizable options specific to the AWS Lambda platform. This includes
alias, resolver, middleware, hooks, and various adapter state flags.

## Extends

- `AdapterConfig`\<[`AwsLambdaHttpEvent`](../../../declarations/interfaces/AwsLambdaHttpEvent.md), [`RawHttpResponse`](../../../declarations/type-aliases/RawHttpResponse.md), [`AwsLambdaContext`](../../../declarations/type-aliases/AwsLambdaContext.md), `IncomingHttpEvent`, `IncomingHttpEventOptions`, `OutgoingHttpResponse`\>
