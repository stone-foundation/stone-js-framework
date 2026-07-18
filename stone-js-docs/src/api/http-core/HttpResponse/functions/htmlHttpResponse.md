# Function: htmlHttpResponse()

```ts
function htmlHttpResponse(
   content, 
   statusCode, 
   headers): OutgoingHttpResponse;
```

Create a 200(OK) HTML OutgoingHttpResponse.

## Parameters

### content

`string`

The content of the response.

### statusCode

`number` = `HTTP_OK`

The status code of the response.

### headers

[`HeadersType`](../../declarations/type-aliases/HeadersType.md) = `{}`

The headers for the response.

## Returns

[`OutgoingHttpResponse`](../../OutgoingHttpResponse/classes/OutgoingHttpResponse.md)

A new instance of OutgoingHttpResponse.
