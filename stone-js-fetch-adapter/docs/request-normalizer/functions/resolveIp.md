[**FetchAdapter**](../../README.md)

***

[FetchAdapter](../../README.md) / [request-normalizer](../README.md) / resolveIp

# Function: resolveIp()

> **resolveIp**(`headers`): `string`

Resolves the best-effort client IP from forwarding headers.

## Parameters

### headers

`Record`\<`string`, `string`\>

The normalized headers.

## Returns

`string`

The client IP, or an empty string when unknown.
