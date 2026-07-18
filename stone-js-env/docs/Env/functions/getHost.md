# Function: getHost()

Get the specified env variable value as a host (IP or URL).

## Param

**key**

The environment variable key.

## Param

**options**

Options for retrieving the value.

## Call Signature

```ts
function getHost(key): string | undefined;
```

Get the specified env variable value as a host (IP or URL).

### Parameters

#### key

`string`

The environment variable key.

### Returns

`string` \| `undefined`

The value as a host.

## Call Signature

```ts
function getHost(key, options): string;
```

Get the specified env variable value as a host (IP or URL).

### Parameters

#### key

`string`

The environment variable key.

#### options

`string` \| [`Options`](../../declarations/interfaces/Options.md)

Options for retrieving the value.

### Returns

`string`

The value as a host.
