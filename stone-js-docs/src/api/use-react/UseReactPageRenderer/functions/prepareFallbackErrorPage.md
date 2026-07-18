# Function: prepareFallbackErrorPage()

```ts
function prepareFallbackErrorPage(
   event, 
   response, 
   container, 
snapshot): Promise<void>;
```

Prepare the fallback error page to render.

We prepare a fallback error page if no event nor error handler is provided.

## Parameters

### event

`IncomingBrowserEvent`

The incoming event.

### response

[`ReactOutgoingResponse`](../../declarations/type-aliases/ReactOutgoingResponse.md)

The outgoing response.

### container

`Container`

The service container.

### snapshot

[`ResponseSnapshotType`](../../declarations/interfaces/ResponseSnapshotType.md)

The response snapshot.

## Returns

`Promise`\<`void`\>
