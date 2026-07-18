# Function: unauthorizedHttpResponse()

```ts
function unauthorizedHttpResponse(content, headers): OutgoingHttpResponse;
```

Create a 401(Unauthorized) OutgoingHttpResponse.

## Parameters

### content

`unknown`

The content of the response.

### headers

[`HeadersType`](../../declarations/type-aliases/HeadersType.md) = `{}`

The headers for the response.

## Returns

[`OutgoingHttpResponse`](../../OutgoingHttpResponse/classes/OutgoingHttpResponse.md)

A new instance of OutgoingHttpResponse.
