# Function: defaultResponseResolver()

```ts
function defaultResponseResolver(options): OutgoingResponse;
```

Default response resolver function.

This function resolves the response for the application, using the options provided.
By default, it creates an `OutgoingResponse` instance with the provided options.

## Parameters

### options

[`ResponseResolverOptions`](../../declarations/type-aliases/ResponseResolverOptions.md)

The options to create the response.

## Returns

[`OutgoingResponse`](../../events/OutgoingResponse/classes/OutgoingResponse.md)

An outgoing response instance.
