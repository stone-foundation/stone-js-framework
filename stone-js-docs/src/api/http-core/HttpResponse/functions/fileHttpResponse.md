# Function: fileHttpResponse()

```ts
function fileHttpResponse(
   file, 
   statusCode, 
   headers, 
   contentDispositionType, 
   autoEtag, 
   autoLastModified): BinaryFileResponse;
```

Create a 200(OK) file OutgoingHttpResponse.

## Parameters

### file

The file to send as the response.

`string` | `File`

### statusCode

`number` = `HTTP_OK`

The status code of the response.

### headers

[`HeadersType`](../../declarations/type-aliases/HeadersType.md) = `{}`

The headers for the response.

### contentDispositionType

The content disposition type (e.g., "inline" or "attachment").

`null` | `string`

### autoEtag

`boolean` = `false`

Whether to automatically generate an ETag.

### autoLastModified

`boolean` = `true`

Whether to automatically set the Last-Modified header.

## Returns

[`BinaryFileResponse`](../../BinaryFileResponse/classes/BinaryFileResponse.md)

A new instance of BinaryFileResponse.
