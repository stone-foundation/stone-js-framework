# Function: getHostname()

```ts
function getHostname(
   ip, 
   headers, 
   options): undefined | string;
```

Get hostname.

## Parameters

### ip

`string`

The IP address of the request.

### headers

`IncomingHttpHeaders`

The headers from the incoming request.

### options

Options for trusted IPs, fallback, etc.

#### trusted

(`string` \| `RegExp`)[]

#### trustedIp

`string`[]

#### untrustedIp

`string`[]

## Returns

`undefined` \| `string`

The hostname from the request.
