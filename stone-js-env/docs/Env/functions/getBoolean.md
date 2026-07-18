# Function: getBoolean()

Get the specified env variable value as a boolean.

## Param

**key**

The environment variable key.

## Param

**options**

Options for retrieving the value.

## Call Signature

```ts
function getBoolean(key): boolean | undefined;
```

Get the specified env variable value as a boolean.

### Parameters

#### key

`string`

The environment variable key.

### Returns

`boolean` \| `undefined`

The value as a boolean.

## Call Signature

```ts
function getBoolean(key, options): boolean;
```

Get the specified env variable value as a boolean.

### Parameters

#### key

`string`

The environment variable key.

#### options

`boolean` \| [`Options`](../../declarations/interfaces/Options.md)

Options for retrieving the value.

### Returns

`boolean`

The value as a boolean.
