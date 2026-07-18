# Class: AwsLambdaHttpAdapter

AWS Lambda HTTP Adapter for Stone.js.

The `AwsLambdaHttpAdapter` extends the functionality of the Stone.js `Adapter`
to provide seamless integration with AWS Lambda for HTTP-based events. This adapter
transforms incoming HTTP events from AWS Lambda into `IncomingHttpEvent` instances
and produces a `RawHttpResponse` as output.

This adapter simplifies the process of handling HTTP events within AWS Lambda
while adhering to the Stone.js framework's event-driven architecture.

## Template

The type of the raw HTTP event from AWS Lambda.

## Template

The type of the raw HTTP response to send back.

## Template

The AWS Lambda execution context type.

## Template

The type of the processed incoming HTTP event.

## Template

Options used to create an incoming HTTP event.

## Template

The type of the outgoing HTTP response after processing.

## Template

Context type specific to the HTTP adapter.

## Example

```typescript
import { AwsLambdaHttpAdapter } from '@stone-js/aws-lambda-http-adapter';

const adapter = AwsLambdaHttpAdapter.create({...});

const handler = await adapter.run();

export { handler };
```

## See

 - [Stone.js Documentation](https://stone-js.com/docs)
 - [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/latest/dg/)

## Extends

- `Adapter`\<[`AwsLambdaHttpEvent`](../../declarations/interfaces/AwsLambdaHttpEvent.md), [`RawHttpResponse`](../../declarations/type-aliases/RawHttpResponse.md), [`AwsLambdaContext`](../../declarations/type-aliases/AwsLambdaContext.md), `IncomingHttpEvent`, `IncomingHttpEventOptions`, `OutgoingHttpResponse`, [`AwsLambdaHttpAdapterContext`](../../declarations/interfaces/AwsLambdaHttpAdapterContext.md)\>

## Constructors

### Constructor

```ts
protected new AwsLambdaHttpAdapter(blueprint): AwsLambdaHttpAdapter;
```

Create an Adapter.

#### Parameters

##### blueprint

`IBlueprint`

The blueprint to create the adapter.

#### Returns

`AwsLambdaHttpAdapter`

#### Inherited from

```ts
Adapter<
AwsLambdaHttpEvent,
RawHttpResponse,
AwsLambdaContext,
IncomingHttpEvent,
IncomingHttpEventOptions,
OutgoingHttpResponse,
AwsLambdaHttpAdapterContext
>.constructor
```

## Methods

### eventListener()

```ts
protected eventListener(rawEvent, executionContext): Promise<RawHttpResponseOptions>;
```

Processes an incoming AWS Lambda HTTP event.

Converts a raw AWS Lambda HTTP event into an `IncomingHttpEvent`, processes it through
the Stone.js pipeline, and generates a `RawHttpResponse` to send back.

#### Parameters

##### rawEvent

[`AwsLambdaHttpEvent`](../../declarations/interfaces/AwsLambdaHttpEvent.md)

The raw HTTP event received from AWS Lambda.

##### executionContext

[`AwsLambdaContext`](../../declarations/type-aliases/AwsLambdaContext.md)

The AWS Lambda execution context associated with the event.

#### Returns

`Promise`\<[`RawHttpResponseOptions`](../../declarations/interfaces/RawHttpResponseOptions.md)\>

A promise resolving to the processed `RawHttpResponse`.

***

### onStart()

```ts
protected onStart(): Promise<void>;
```

Initializes the adapter and validates its execution context.

Ensures that the adapter is running in an AWS Lambda environment. Throws an error
if it detects that the adapter is being used in an unsupported environment (e.g., a browser).

#### Returns

`Promise`\<`void`\>

#### Throws

If executed outside an AWS Lambda environment.

***

### run()

```ts
run<ExecutionResultType>(): Promise<ExecutionResultType>;
```

Executes the adapter and provides an AWS Lambda-compatible HTTP handler function.

This method initializes the adapter and returns a handler function that can
process HTTP events in AWS Lambda. It transforms raw events into `IncomingHttpEvent`
instances and produces `RawHttpResponse` objects as output.

#### Type Parameters

##### ExecutionResultType

`ExecutionResultType` = [`AwsLambdaEventHandlerFunction`](../../declarations/type-aliases/AwsLambdaEventHandlerFunction.md)\<[`RawHttpResponseOptions`](../../declarations/interfaces/RawHttpResponseOptions.md)\>

The type representing the AWS Lambda event handler function.

#### Returns

`Promise`\<`ExecutionResultType`\>

A promise resolving to the AWS Lambda HTTP handler function.

#### Throws

If used outside the AWS Lambda environment.

#### Overrides

```ts
Adapter.run
```

***

### create()

```ts
static create(blueprint): AwsLambdaHttpAdapter;
```

Creates an instance of the `AwsLambdaHttpAdapter`.

#### Parameters

##### blueprint

`IBlueprint`

The application blueprint.

#### Returns

`AwsLambdaHttpAdapter`

A new instance of `AwsLambdaHttpAdapter`.

#### Example

```typescript
const adapter = AwsLambdaHttpAdapter.create(blueprint);
await adapter.run();
```
