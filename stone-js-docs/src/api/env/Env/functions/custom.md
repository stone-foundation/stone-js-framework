# Function: custom()

```ts
function custom<T>(
   key, 
   validator, 
   options?): T;
```

Get the specified env variable value with custom validator.

## Type Parameters

### T

`T` = `any`

## Parameters

### key

`string`

The environment variable key.

### validator

(`key`, `value`, `options`) => `T`

The custom validation function.

### options?

Options for retrieving the value.

[`Options`](../../declarations/interfaces/Options.md) | `T`

## Returns

`T`

The validated value of the environment variable.
