# Class: StaticFileMiddleware

Kernel Middleware for serving static files from a directory.
If a static file is found, it serves the file; otherwise, the request is passed to the next middleware.

## Constructors

### Constructor

```ts
new StaticFileMiddleware(container): StaticFileMiddleware;
```

Create a new StaticFileMiddleware instance.

#### Parameters

##### container

The service container to inject dependencies.

###### blueprint

`IBlueprint`

###### logger

`ILogger`

#### Returns

`StaticFileMiddleware`

## Methods

### handle()

```ts
handle(event, next): Promise<OutgoingHttpResponse>;
```

Handle incoming HTTP events and serve static files if applicable.

#### Parameters

##### event

[`IncomingHttpEvent`](../../../IncomingHttpEvent/classes/IncomingHttpEvent.md)

The incoming HTTP event.

##### next

`NextMiddleware`\<[`IncomingHttpEvent`](../../../IncomingHttpEvent/classes/IncomingHttpEvent.md), [`OutgoingHttpResponse`](../../../OutgoingHttpResponse/classes/OutgoingHttpResponse.md)\>

The next middleware in the pipeline.

#### Returns

`Promise`\<[`OutgoingHttpResponse`](../../../OutgoingHttpResponse/classes/OutgoingHttpResponse.md)\>

The outgoing HTTP response.

#### Throws

If access to the file is forbidden.
