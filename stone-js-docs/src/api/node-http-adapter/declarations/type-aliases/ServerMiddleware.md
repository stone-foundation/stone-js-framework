# Type Alias: ServerMiddleware()

```ts
type ServerMiddleware = (req, res, next) => void;
```

Represents a platform server middleware function that processes HTTP requests and responses.

Middleware functions are called with the HTTP request, response objects, and a `next` function
to pass control to the next middleware in the stack. Middleware can modify the request and
response objects, or handle them completely.

## Parameters

### req

`IncomingMessage` & `Record`\<`string`, `any`\>

The HTTP request object, extended with custom properties.

### res

`ServerResponse` & `Record`\<`string`, `any`\>

The HTTP response object, extended with custom properties.

### next

(`err?`) => `void`

A callback to pass control to the next middleware. If called with an error, it invokes the error-handling middleware.

## Returns

`void`
