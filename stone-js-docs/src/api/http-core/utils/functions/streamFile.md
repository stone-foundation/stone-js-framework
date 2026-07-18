# Function: streamFile()

```ts
function streamFile(
   message, 
   response, 
   fileResponse, 
options): Promise<void>;
```

Stream files from the file system as an HTTP response.

Only for node http server.

## Parameters

### message

`IncomingMessage`

The incoming message.

### response

`OutgoingMessage`

The outgoing response.

### fileResponse

`File`

The binary file response to be streamed.

### options

[`StreamFileOptions`](../../declarations/type-aliases/StreamFileOptions.md)

The options for streaming.

## Returns

`Promise`\<`void`\>

A promise that resolves when the file streaming is complete.
