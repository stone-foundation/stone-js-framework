# Type Alias: ResponseResolver()\<TOutgoingResponse\>

```ts
type ResponseResolver<TOutgoingResponse> = (options) => Promiseable<TOutgoingResponse>;
```

ResponseResolver Type.

Represents a function that resolves an outgoing response based on the provided options.

## Type Parameters

### TOutgoingResponse

`TOutgoingResponse` *extends* [`OutgoingResponse`](../../events/OutgoingResponse/classes/OutgoingResponse.md)

## Parameters

### options

[`ResponseResolverOptions`](ResponseResolverOptions.md)

The outgoing response options.

## Returns

[`Promiseable`](Promiseable.md)\<`TOutgoingResponse`\>

The outgoing response.
