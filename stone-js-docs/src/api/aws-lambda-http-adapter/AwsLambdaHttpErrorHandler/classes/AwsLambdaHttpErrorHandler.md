# Class: AwsLambdaHttpErrorHandler

Class representing an AwsLambdaHttpErrorHandler.

## Implements

- `IAdapterErrorHandler`\<[`AwsLambdaHttpEvent`](../../declarations/interfaces/AwsLambdaHttpEvent.md), [`RawHttpResponse`](../../declarations/type-aliases/RawHttpResponse.md), [`AwsLambdaContext`](../../declarations/type-aliases/AwsLambdaContext.md)\>

## Constructors

### Constructor

```ts
new AwsLambdaHttpErrorHandler(options): AwsLambdaHttpErrorHandler;
```

Create an NodeHttpErrorHandler.

#### Parameters

##### options

[`AwsLambdaHttpErrorHandlerOptions`](../interfaces/AwsLambdaHttpErrorHandlerOptions.md)

NodeHttpErrorHandler options.

#### Returns

`AwsLambdaHttpErrorHandler`

## Methods

### handle()

```ts
handle(error, context): AdapterEventBuilderType<RawHttpResponseOptions>;
```

Handle an error.

#### Parameters

##### error

`Error`

The error to handle.

##### context

`AdapterErrorContext`\<[`AwsLambdaHttpEvent`](../../declarations/interfaces/AwsLambdaHttpEvent.md), [`RawHttpResponseOptions`](../../declarations/interfaces/RawHttpResponseOptions.md), [`AwsLambdaContext`](../../declarations/type-aliases/AwsLambdaContext.md)\>

The context of the adapter.

#### Returns

`AdapterEventBuilderType`\<[`RawHttpResponseOptions`](../../declarations/interfaces/RawHttpResponseOptions.md)\>

The raw response builder.

#### Implementation of

```ts
IAdapterErrorHandler.handle
```
