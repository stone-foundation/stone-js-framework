[**FetchAdapter**](../../../README.md)

***

[FetchAdapter](../../../README.md) / [options/FetchAdapterBlueprint](../README.md) / FetchAdapterAdapterConfig

# Interface: FetchAdapterAdapterConfig

Adapter configuration for the Fetch adapter.

## Extends

- `AdapterConfig`\<`Request`, `Response`, [`FetchExecutionContext`](../../../declarations/type-aliases/FetchExecutionContext.md), `IncomingHttpEvent`, `IncomingHttpEventOptions`, `OutgoingHttpResponse`\>

## Properties

### alias?

> `optional` **alias?**: `string`

The alias name for the adapter.
This is a unique identifier used to reference the adapter.
Optional property.

#### Inherited from

`AdapterConfig.alias`

***

### current?

> `optional` **current?**: `boolean`

The current status identifier for the adapter.
Used to indicate if this adapter instance is active or currently in use.
Optional property.

#### Inherited from

`AdapterConfig.current`

***

### default?

> `optional` **default?**: `boolean`

Defines whether this adapter is the default adapter used by the application.
Optional property.

#### Inherited from

`AdapterConfig.default`

***

### errorHandlers

> **errorHandlers**: `Record`\<`string`, `MetaAdapterErrorHandler`\<`RawEventType`, `RawResponseType`, `ExecutionContextType`\>\>

Error handlers used to manage and report errors that occur within the adapter.
These handlers can be used to customize error handling behavior and logging.

#### Inherited from

`AdapterConfig.errorHandlers`

***

### eventHandlerResolver

> **eventHandlerResolver**: `AdapterEventHandlerResolver`\<`IncomingHttpEvent`, `OutgoingHttpResponse`\>

The event handler resolver used to create instances of the event handler.

#### Inherited from

`AdapterConfig.eventHandlerResolver`

***

### middleware

> **middleware**: `AdapterMixedPipeType`\<`AdapterContext`\<`Request`, `Response`, [`FetchExecutionContext`](../../../declarations/type-aliases/FetchExecutionContext.md), `IncomingHttpEvent`, `IncomingHttpEventOptions`, `OutgoingHttpResponse`\>, `Response`\>[]

The middleware used for processing incoming or outgoing data in the adapter.
Middleware can modify or handle events at different stages of the adapter's lifecycle.

#### Inherited from

`AdapterConfig.middleware`

***

### platform

> **platform**: `string`

The platform identifier for the adapter.
This is used to categorize the adapter based on the environment or technology it supports.

#### Inherited from

`AdapterConfig.platform`

***

### resolver

> **resolver**: `AdapterResolver`

The class type resolver used to create instances of the adapter.

#### Inherited from

`AdapterConfig.resolver`

***

### variant

> **variant**: `"server"` \| `"browser"` \| `"console"`

The class type of the adapter.
This is used to identify the category of the adapter.

#### Inherited from

`AdapterConfig.variant`
