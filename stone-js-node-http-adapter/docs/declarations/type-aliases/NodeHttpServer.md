# Type Alias: NodeHttpServer

```ts
type NodeHttpServer = 
  | HttpsServer<typeof IncomingMessage, typeof ServerResponse>
| Server<typeof IncomingMessage, typeof ServerResponse>;
```

Represents a Node.js HTTP or HTTPS server.

Combines both HTTP and HTTPS server types to allow flexibility in choosing the server type.
