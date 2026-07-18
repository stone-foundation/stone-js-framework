# Function: jsonpHttpResponse()

```ts
function jsonpHttpResponse(
   content, 
   statusCode, 
   headers): JsonpResponse;
```

Create a 200(OK) JSONP OutgoingHttpResponse.

## Parameters

### content

`unknown`

The content of the response.

### statusCode

`number` = `HTTP_OK`

The status code of the response.

### headers

[`HeadersType`](../../declarations/type-aliases/HeadersType.md) = `{}`

The headers for the response.

## Returns

[`JsonpResponse`](../../JsonpResponse/classes/JsonpResponse.md)

A new instance of JsonpResponse.
