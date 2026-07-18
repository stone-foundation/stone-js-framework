# Class: NodeCliAdapter

Node Cli Adapter for Stone.js.

The `NodeCliAdapter` provides seamless integration between Stone.js applications
and the Node Cli environment. It processes incoming events from Node Cli,
transforms them into `IncomingEvent` instances, and returns a `RawResponse`.

This adapter ensures compatibility with Node Cli's execution model and
abstracts the event handling process for Stone.js developers.

## Template

The type of the raw event received from Node Cli.

## Template

The type of the response to send back to Node Cli.

## Template

The Node Cli execution context type.

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
import { NodeCliAdapter } from '@stone-js/node-cli-adapter';

const adapter = NodeCliAdapter.create({...});

const handler = await adapter.run();

export { handler };
```

## See

[Stone.js Documentation](https://stone-js.com/docs)

## Extends

- `Adapter`\<[`NodeCliEvent`](../../declarations/interfaces/NodeCliEvent.md), [`RawResponse`](../../declarations/type-aliases/RawResponse.md), [`NodeCliExecutionContext`](../../declarations/type-aliases/NodeCliExecutionContext.md), `IncomingEvent`, `IncomingEventOptions`, `OutgoingResponse`, [`NodeCliAdapterContext`](../../declarations/interfaces/NodeCliAdapterContext.md)\>

## Constructors

### Constructor

```ts
protected new NodeCliAdapter(blueprint): NodeCliAdapter;
```

Create an Adapter.

#### Parameters

##### blueprint

`IBlueprint`

The blueprint to create the adapter.

#### Returns

`NodeCliAdapter`

#### Inherited from

```ts
Adapter<
NodeCliEvent,
RawResponse,
NodeCliExecutionContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse,
NodeCliAdapterContext
>.constructor
```

## Methods

### eventListener()

```ts
protected eventListener(rawEvent, executionContext): Promise<number>;
```

Processes an incoming Node Cli event.

This method transforms the raw Node Cli event into a Stone.js `IncomingEvent`,
processes it through the pipeline, and generates a `RawResponse` to send back.

#### Parameters

##### rawEvent

[`NodeCliEvent`](../../declarations/interfaces/NodeCliEvent.md)

The raw Node Cli event to be processed.

##### executionContext

[`CommandBuilder`](../../declarations/type-aliases/CommandBuilder.md)

The Node Cli execution context for the event.

#### Returns

`Promise`\<`number`\>

A promise resolving to the processed `RawResponse`.

***

### onStart()

```ts
protected onStart(): Promise<void>;
```

Initializes the adapter and validates its execution context.

Ensures the adapter is running in an Node Cli environment. If not, it
throws an error to prevent misuse.

#### Returns

`Promise`\<`void`\>

#### Throws

If executed outside an Node Cli context (e.g., browser).

***

### run()

```ts
run<ExecutionResultType>(): Promise<ExecutionResultType>;
```

Executes the adapter and provides an Node Cli-compatible handler function.

The `run` method processes events, manages context, and returns the appropriate response.

#### Type Parameters

##### ExecutionResultType

`ExecutionResultType` = `number`

The type representing the Node Cli event handler function.

#### Returns

`Promise`\<`ExecutionResultType`\>

A promise resolving to the Node Cli handler function.

#### Throws

If used outside the Node Cli environment.

#### Overrides

```ts
Adapter.run
```

***

### create()

```ts
static create(blueprint): NodeCliAdapter;
```

Creates an instance of the `NodeCliAdapter`.

#### Parameters

##### blueprint

`IBlueprint`

The application blueprint.

#### Returns

`NodeCliAdapter`

A new instance of `NodeCliAdapter`.

#### Example

```typescript
const adapter = NodeCliAdapter.create(blueprint);
await adapter.run();
```
