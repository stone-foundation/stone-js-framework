# Function: redirectHttpResponse()

```ts
function redirectHttpResponse(
   url, 
   statusCode, 
   headers): RedirectResponse;
```

Create a 302(Redirect) OutgoingHttpResponse.

## Parameters

### url

The URL to redirect to.

`string` | `URL`

### statusCode

`number` = `302`

The status code of the redirect response.

### headers

[`HeadersType`](../../declarations/type-aliases/HeadersType.md) = `{}`

The headers for the response.

## Returns

[`RedirectResponse`](../../RedirectResponse/classes/RedirectResponse.md)

A new instance of RedirectResponse.
