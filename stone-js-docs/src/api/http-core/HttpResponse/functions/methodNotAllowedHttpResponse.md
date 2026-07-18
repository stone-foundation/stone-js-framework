# Function: methodNotAllowedHttpResponse()

```ts
function methodNotAllowedHttpResponse(content, headers): OutgoingHttpResponse;
```

Create a 405(Method Not Allowed) OutgoingHttpResponse.

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
