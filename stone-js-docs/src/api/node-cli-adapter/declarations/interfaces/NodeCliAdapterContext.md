# Interface: NodeCliAdapterContext

Represents the context for the Node Cli Adapter.

This interface extends `AdapterContext` and includes additional properties
specific to generic Node Cli events.

## Extends

- `AdapterContext`\<[`NodeCliEvent`](NodeCliEvent.md), [`RawResponse`](../type-aliases/RawResponse.md), [`NodeCliExecutionContext`](../type-aliases/NodeCliExecutionContext.md), `IncomingEvent`, `IncomingEventOptions`, `OutgoingResponse`\>

## Properties

### rawResponse

```ts
rawResponse: number;
```

The raw response associated with the current context.

#### Overrides

```ts
AdapterContext.rawResponse
```
