# Function: executeHandler()

```ts
function executeHandler(
   event, 
   response, 
   snapshot, 
   handler?, 
error?): Promise<any>;
```

Execute the handler.

This method will try to get data from the snapshot
If the snapshot is not present, it will execute the handler.
If the handler is not present, it will return undefined.

## Parameters

### event

`IncomingBrowserEvent`

### response

[`ReactOutgoingResponse`](../../declarations/type-aliases/ReactOutgoingResponse.md)

The response object.

### snapshot

[`ResponseSnapshotType`](../../declarations/interfaces/ResponseSnapshotType.md)

### handler?

[`IPage`](../../declarations/interfaces/IPage.md)\<`IncomingBrowserEvent`, `unknown`\> | [`IErrorPage`](../../declarations/interfaces/IErrorPage.md)\<`IncomingBrowserEvent`, `unknown`\>

### error?

`any`

## Returns

`Promise`\<`any`\>

The data from the response.
