# Function: getArray()

Get the specified env variable value as an array.

## Param

**key**

The environment variable key.

## Param

**options**

Options for retrieving the value.

## Call Signature

```ts
function getArray(key): string[] | undefined;
```

Get the specified env variable value as an array.

### Parameters

#### key

`string`

The environment variable key.

### Returns

`string`[] \| `undefined`

The value as an array of strings.

## Call Signature

```ts
function getArray(key, options): string[];
```

Get the specified env variable value as an array.

### Parameters

#### key

`string`

The environment variable key.

#### options

[`Options`](../../declarations/interfaces/Options.md) \| `string`[]

Options for retrieving the value.

### Returns

`string`[]

The value as an array of strings.
