# Function: getString()

Get the specified env variable value as a string.

## Param

**key**

The environment variable key.

## Param

**options**

Options for retrieving the value.

## Call Signature

```ts
function getString(key): string | undefined;
```

Get the specified env variable value as a string.

### Parameters

#### key

`string`

The environment variable key.

### Returns

`string` \| `undefined`

The value as a string.

## Call Signature

```ts
function getString(key, options): string;
```

Get the specified env variable value as a string.

### Parameters

#### key

`string`

The environment variable key.

#### options

`string` \| [`Options`](../../declarations/interfaces/Options.md)

Options for retrieving the value.

### Returns

`string`

The value as a string.
