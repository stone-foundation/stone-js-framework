# Function: isIpTrusted()

```ts
function isIpTrusted(trusted, untrusted?): (ip) => boolean;
```

Check if IP is trusted or not.

## Parameters

### trusted

`string` \| `string`[]

Array of trusted IPs or wildcard.

### untrusted?

`string` \| `string`[]

Array of untrusted IPs or wildcard.

## Returns

A function to verify if a given IP is trusted.

(`ip`) => `boolean`
