# Class: AwsLambdaAdapter

AWS Lambda Adapter for Stone.js.

The `AwsLambdaAdapter` provides seamless integration between Stone.js applications
and the AWS Lambda environment. It processes incoming events from AWS Lambda,
transforms them into `IncomingEvent` instances, and returns a `RawResponse`.

This adapter ensures compatibility with AWS Lambda's execution model and
abstracts the event handling process for Stone.js developers.

## Template

The type of the raw event received from AWS Lambda.

## Template

The type of the response to send back to AWS Lambda.

## Template

The AWS Lambda execution context type.

## Template

The type of the processed incoming event.

## Template

Options used to create an incoming event.

## Template

The type of the outgoing response after processing.

## Template

Context type specific to the adapter.

## Example

```typescript
import { AwsLambdaAdapter } from '@stone-js/aws-lambda-adapter';

const adapter = AwsLambdaAdapter.create({...});

const handler = await adapter.run();

export { handler };
```

## See

 - [Stone.js Documentation](https://stone-js.com/docs)
 - [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)

## Extends

- `Adapter`\<[`AwsLambdaEvent`](../../declarations/type-aliases/AwsLambdaEvent.md), [`RawResponse`](../../declarations/type-aliases/RawResponse.md), [`AwsLambdaContext`](../../declarations/type-aliases/AwsLambdaContext.md), `IncomingEvent`, `IncomingEventOptions`, `OutgoingResponse`, [`AwsLambdaAdapterContext`](../../declarations/interfaces/AwsLambdaAdapterContext.md)\>

## Constructors

### Constructor

```ts
protected new AwsLambdaAdapter(blueprint): AwsLambdaAdapter;
```

Create an Adapter.

#### Parameters

##### blueprint

`IBlueprint`

The blueprint to create the adapter.

#### Returns

`AwsLambdaAdapter`

#### Inherited from

```ts
Adapter<
AwsLambdaEvent,
RawResponse,
AwsLambdaContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse,
AwsLambdaAdapterContext
>.constructor
```

## Methods

### eventListener()

```ts
protected eventListener(rawEvent, executionContext): Promise<RawResponse>;
```

Processes an incoming AWS Lambda event.

This method transforms the raw AWS Lambda event into a Stone.js `IncomingEvent`,
processes it through the pipeline, and generates a `RawResponse` to send back.

#### Parameters

##### rawEvent

[`AwsLambdaEvent`](../../declarations/type-aliases/AwsLambdaEvent.md)

The raw AWS Lambda event to be processed.

##### executionContext

[`AwsLambdaContext`](../../declarations/type-aliases/AwsLambdaContext.md)

The AWS Lambda execution context for the event.

#### Returns

`Promise`\<[`RawResponse`](../../declarations/type-aliases/RawResponse.md)\>

A promise resolving to the processed `RawResponse`.

***

### onStart()

```ts
protected onStart(): Promise<void>;
```

Initializes the adapter and validates its execution context.

Ensures the adapter is running in an AWS Lambda environment. If not, it
throws an error to prevent misuse.

#### Returns

`Promise`\<`void`\>

#### Throws

If executed outside an AWS Lambda context (e.g., browser).

***

### run()

```ts
run<ExecutionResultType>(): Promise<ExecutionResultType>;
```

Executes the adapter and provides an AWS Lambda-compatible handler function.

The `run` method initializes the adapter and returns a handler function
that AWS Lambda can invoke. This handler processes events, manages context,
and returns the appropriate response.

#### Type Parameters

##### ExecutionResultType

`ExecutionResultType` = [`AwsLambdaEventHandlerFunction`](../../declarations/type-aliases/AwsLambdaEventHandlerFunction.md)

The type representing the AWS Lambda event handler function.

#### Returns

`Promise`\<`ExecutionResultType`\>

A promise resolving to the AWS Lambda handler function.

#### Throws

If used outside the AWS Lambda environment.

#### Overrides

```ts
Adapter.run
```

***

### create()

```ts
static create(blueprint): AwsLambdaAdapter;
```

Creates an instance of the `AwsLambdaAdapter`.

#### Parameters

##### blueprint

`IBlueprint`

The application blueprint.

#### Returns

`AwsLambdaAdapter`

A new instance of `AwsLambdaAdapter`.

#### Example

```typescript
const adapter = AwsLambdaAdapter.create(blueprint);
await adapter.run();
```
