# Class: HandleCorsMiddleware

Kernel Middleware for adding Cross-Origin Resource Sharing (CORS) headers to HTTP responses.
It allows controlling how clients from different origins can access the server's resources.

## Template

Represents the type of the incoming HTTP event.

## Template

Represents the type of the outgoing HTTP response.

## Author

Mr. Stone <evensstone@gmail.com>

## Constructors

### Constructor

```ts
new HandleCorsMiddleware(blueprint): HandleCorsMiddleware;
```

Construct an instance of HandleCorsMiddleware.

#### Parameters

##### blueprint

The configuration blueprint used for managing CORS settings.

###### blueprint

`IBlueprint`

#### Returns

`HandleCorsMiddleware`

## Methods

### handle()

```ts
handle(event, next): Promise<OutgoingHttpResponse>;
```

Handle CORS by modifying the response headers based on the configuration.

#### Parameters

##### event

[`IncomingHttpEvent`](../../../IncomingHttpEvent/classes/IncomingHttpEvent.md)

The incoming HTTP event.

##### next

`NextMiddleware`\<[`IncomingHttpEvent`](../../../IncomingHttpEvent/classes/IncomingHttpEvent.md), [`OutgoingHttpResponse`](../../../OutgoingHttpResponse/classes/OutgoingHttpResponse.md)\>

The next middleware function to continue processing the event.

#### Returns

`Promise`\<[`OutgoingHttpResponse`](../../../OutgoingHttpResponse/classes/OutgoingHttpResponse.md)\>

The outgoing HTTP response with CORS headers.
