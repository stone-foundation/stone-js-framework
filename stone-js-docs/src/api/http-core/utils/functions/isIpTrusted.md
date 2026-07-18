# Function: isIpTrusted()

```ts
function isIpTrusted(trusted, untrusted): (ip) => boolean;
```

Check if IP is trusted or not.

## Parameters

### trusted

Array of trusted IPs or wildcard.

`string` | `string`[]

### untrusted

Array of untrusted IPs or wildcard.

`string` | `string`[]

## Returns

A function to verify if a given IP is trusted.

```ts
(ip): boolean;
```

### Parameters

#### ip

`string`

### Returns

`boolean`
