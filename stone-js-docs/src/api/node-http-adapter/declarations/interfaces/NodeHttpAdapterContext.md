# Interface: NodeHttpAdapterContext

Extends the `AdapterContext` interface to provide additional properties for the Node.js HTTP adapter.

This context includes the raw HTTP response (`ServerResponse`) in addition to the standard
Stone.js adapter context properties.

## Extends

- `AdapterContext`\<`IncomingMessage`, `ServerResponse`, [`NodeHttpServer`](../type-aliases/NodeHttpServer.md), `IncomingHttpEvent`, `IncomingHttpEventOptions`, `OutgoingHttpResponse`\>

## Properties

### rawResponse

```ts
rawResponse: ServerResponse;
```

The raw HTTP response object associated with the current request.

#### Overrides

```ts
AdapterContext.rawResponse
```
