[**FetchAdapter**](../../README.md)

***

[FetchAdapter](../../README.md) / [FetchErrorHandler](../README.md) / FetchErrorHandler

# Class: FetchErrorHandler

The default error handler for the Fetch adapter.

It logs the error, derives a status code from the (typed) error, negotiates JSON vs plain text
from the `Accept` header, and fills the raw-response builder — staying fully Web-standard, no
Node-only content-negotiation libraries.

## Implements

- `IAdapterErrorHandler`\<`Request`, `Response`, [`FetchExecutionContext`](../../declarations/type-aliases/FetchExecutionContext.md)\>

## Constructors

### Constructor

> **new FetchErrorHandler**(`options`): `FetchErrorHandler`

#### Parameters

##### options

The auto-wired blueprint.

###### blueprint

`IBlueprint`

#### Returns

`FetchErrorHandler`

## Methods

### handle()

> **handle**(`error`, `context`): `AdapterEventBuilderType`\<`Response`\>

Handle an adapter-level error.

#### Parameters

##### error

`Error`

The error to handle.

##### context

`AdapterErrorContext`\<`Request`, `Response`, [`FetchExecutionContext`](../../declarations/type-aliases/FetchExecutionContext.md)\>

The adapter error context.

#### Returns

`AdapterEventBuilderType`\<`Response`\>

The raw-response builder.

#### Implementation of

`IAdapterErrorHandler.handle`
