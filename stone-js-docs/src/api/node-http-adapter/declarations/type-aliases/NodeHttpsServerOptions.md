# Type Alias: NodeHttpsServerOptions

```ts
type NodeHttpsServerOptions = HttpsServerOptions<typeof IncomingMessage, typeof ServerResponse>;
```

Represents options for configuring a Node.js HTTPS server.

Extends the `HttpsServerOptions` type from Node.js to support strongly typed
`IncomingMessage` and `ServerResponse` instances.
