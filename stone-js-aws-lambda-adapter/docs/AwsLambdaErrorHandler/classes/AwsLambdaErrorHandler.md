# Class: AwsLambdaErrorHandler

Class representing an AwsLambdaErrorHandler.

## Implements

- `IAdapterErrorHandler`\<[`AwsLambdaEvent`](../../declarations/type-aliases/AwsLambdaEvent.md), [`RawResponse`](../../declarations/type-aliases/RawResponse.md), [`AwsLambdaContext`](../../declarations/type-aliases/AwsLambdaContext.md)\>

## Constructors

### Constructor

```ts
new AwsLambdaErrorHandler(options): AwsLambdaErrorHandler;
```

Create an AwsLambdaErrorHandler.

#### Parameters

##### options

[`AwsLambdaErrorHandlerOptions`](../interfaces/AwsLambdaErrorHandlerOptions.md)

AwsLambdaErrorHandler options.

#### Returns

`AwsLambdaErrorHandler`

## Methods

### handle()

```ts
handle(error, context): AdapterEventBuilderType<RawResponse>;
```

Handle an error.

#### Parameters

##### error

`Error`

The error to handle.

##### context

`AdapterErrorContext`\<[`AwsLambdaEvent`](../../declarations/type-aliases/AwsLambdaEvent.md), [`RawResponse`](../../declarations/type-aliases/RawResponse.md), [`AwsLambdaContext`](../../declarations/type-aliases/AwsLambdaContext.md)\>

The context of the adapter.

#### Returns

`AdapterEventBuilderType`\<[`RawResponse`](../../declarations/type-aliases/RawResponse.md)\>

The raw response builder.

#### Implementation of

```ts
IAdapterErrorHandler.handle
```
