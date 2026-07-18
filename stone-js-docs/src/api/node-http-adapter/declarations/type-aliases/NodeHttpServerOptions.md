# Type Alias: NodeHttpServerOptions

```ts
type NodeHttpServerOptions = ServerOptions<typeof IncomingMessage, typeof ServerResponse>;
```

Represents options for configuring a Node.js HTTP server.

Extends the `ServerOptions` type from Node.js to support strongly typed
`IncomingMessage` and `ServerResponse` instances.
