# Function: prepareErrorPage()

```ts
function prepareErrorPage(
   event, 
   response, 
   container, 
snapshot): Promise<void>;
```

Prepare the error page to render.

Error pages are prepared sepatately because their handler
is different from the normal page handler.
Their handler takes an error as the first argument and the event as the second.

## Parameters

### event

`IncomingBrowserEvent`

The incoming HTTP event.

### response

[`ReactOutgoingResponse`](../../declarations/type-aliases/ReactOutgoingResponse.md)

The outgoing HTTP response.

### container

`Container`

The service container.

### snapshot

[`ResponseSnapshotType`](../../declarations/interfaces/ResponseSnapshotType.md)

The response snapshot.

## Returns

`Promise`\<`void`\>
