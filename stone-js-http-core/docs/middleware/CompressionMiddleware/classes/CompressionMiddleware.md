# Class: CompressionMiddleware

Kernel Middleware to compress response content based on the Accept-Encoding header.

## Constructors

### Constructor

```ts
new CompressionMiddleware(): CompressionMiddleware;
```

#### Returns

`CompressionMiddleware`

## Methods

### handle()

```ts
handle(event, next): Promise<OutgoingHttpResponse>;
```

Compress the response content based on the Accept-Encoding header.

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
