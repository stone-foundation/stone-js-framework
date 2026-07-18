# Function: getJson()

Get the specified env variable value as JSON.

## Param

**key**

The environment variable key.

## Param

**options**

Options for retrieving the value.

## Call Signature

```ts
function getJson<R>(key): R;
```

Get the specified env variable value as JSON.

### Type Parameters

#### R

`R` = `unknown`

### Parameters

#### key

`string`

The environment variable key.

### Returns

`R`

The value as a JSON object.

## Call Signature

```ts
function getJson<R>(key, options): R;
```

Get the specified env variable value as JSON.

### Type Parameters

#### R

`R` = `unknown`

### Parameters

#### key

`string`

The environment variable key.

#### options

[`Options`](../../declarations/interfaces/Options.md) \| `R`

Options for retrieving the value.

### Returns

`R`

The value as a JSON object.
