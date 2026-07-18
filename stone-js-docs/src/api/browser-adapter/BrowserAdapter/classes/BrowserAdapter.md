# Class: BrowserAdapter

Browser Adapter for Stone.js.

The `BrowserAdapter` provides seamless integration between Stone.js applications
and the Browser environment. It processes incoming events from Browser,
transforms them into `IncomingBrowserEvent` instances, and returns a `BrowserResponse`.

This adapter ensures compatibility with Browser's execution model and
abstracts the event handling process for Stone.js developers.

## Template

The type of the raw event received from Browser.

## Template

The type of the response to send back to Browser.

## Template

The Browser execution context type.

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
import { BrowserAdapter } from '@stone-js/browser-adapter';

const adapter = BrowserAdapter.create({...});

await adapter.run();
```

## See

[Stone.js Documentation](https://stone-js.com/docs)

## Extends

- `Adapter`\<[`BrowserEvent`](../../declarations/type-aliases/BrowserEvent.md), [`BrowserResponse`](../../declarations/type-aliases/BrowserResponse.md), [`BrowserContext`](../../declarations/type-aliases/BrowserContext.md), `IncomingBrowserEvent`, `IncomingBrowserEventOptions`, `OutgoingBrowserResponse`, [`BrowserAdapterContext`](../../declarations/type-aliases/BrowserAdapterContext.md)\>

## Constructors

### Constructor

```ts
protected new BrowserAdapter(blueprint): BrowserAdapter;
```

Create an Adapter.

#### Parameters

##### blueprint

`IBlueprint`

The blueprint to create the adapter.

#### Returns

`BrowserAdapter`

#### Inherited from

```ts
Adapter<
BrowserEvent,
BrowserResponse,
BrowserContext,
IncomingBrowserEvent,
IncomingBrowserEventOptions,
OutgoingBrowserResponse,
BrowserAdapterContext
>.constructor
```

## Methods

### eventListener()

```ts
protected eventListener(
   eventHandler, 
   rawEvent, 
executionContext): Promise<unknown>;
```

Processes an incoming Browser event.

This method transforms the raw Browser event into a Stone.js `IncomingBrowserEvent`,
processes it through the pipeline, and generates a `RawResponse` to send back.

#### Parameters

##### eventHandler

`AdapterEventHandlerType`\<`IncomingBrowserEvent`, `OutgoingBrowserResponse`\>

##### rawEvent

[`BrowserEvent`](../../declarations/type-aliases/BrowserEvent.md)

The raw Browser event to be processed.

##### executionContext

`Window` & *typeof* `globalThis`

The Browser execution context for the event.

#### Returns

`Promise`\<`unknown`\>

A promise resolving to the processed `RawResponse`.

***

### onStart()

```ts
protected onStart(): Promise<void>;
```

Initializes the adapter and validates its execution context.

Ensures the adapter is running in a Browser environment. If not, it
throws an error to prevent misuse.

#### Returns

`Promise`\<`void`\>

#### Throws

If executed outside a Browser context (e.g., node).

***

### run()

```ts
run<ExecutionResultType>(): Promise<ExecutionResultType>;
```

Executes the adapter and provides an Browser-compatible handler function.

The `run` method initializes the adapter and listens for incoming Browser events.
It processes these events, generates a response, and sends it back to the Browser.

#### Type Parameters

##### ExecutionResultType

`ExecutionResultType` = `undefined`

#### Returns

`Promise`\<`ExecutionResultType`\>

#### Throws

If used outside the Browser environment.

#### Overrides

```ts
Adapter.run
```

***

### create()

```ts
static create(blueprint): BrowserAdapter;
```

Creates an instance of the `BrowserAdapter`.

#### Parameters

##### blueprint

`IBlueprint`

The application blueprint.

#### Returns

`BrowserAdapter`

A new instance of `BrowserAdapter`.

#### Example

```typescript
const adapter = BrowserAdapter.create(blueprint);
await adapter.run();
```
