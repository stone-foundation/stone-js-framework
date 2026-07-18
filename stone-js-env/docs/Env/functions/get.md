# Function: get()

Get the specified env variable value.

## Param

**key**

The environment variable key.

## Param

**options**

Options for retrieving the value.

## Call Signature

```ts
function get<T>(key): T | undefined;
```

Get the specified env variable value.

### Type Parameters

#### T

`T`

### Parameters

#### key

`string`

The environment variable key.

### Returns

`T` \| `undefined`

The value of the environment variable.

## Call Signature

```ts
function get<T>(key, options): T;
```

Get the specified env variable value.

### Type Parameters

#### T

`T`

### Parameters

#### key

`string`

The environment variable key.

#### options

`any`

Options for retrieving the value.

### Returns

`T`

The value of the environment variable.
