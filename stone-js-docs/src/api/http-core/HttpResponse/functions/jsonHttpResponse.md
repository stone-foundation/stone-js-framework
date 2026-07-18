# Function: jsonHttpResponse()

```ts
function jsonHttpResponse(
   content, 
   statusCode, 
   headers): JsonResponse;
```

Create a 200(OK) JSON OutgoingHttpResponse.

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

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md)

A new instance of JsonResponse.
