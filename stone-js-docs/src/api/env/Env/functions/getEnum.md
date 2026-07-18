# Function: getEnum()

Get the specified env variable value as an enum.

## Param

The environment variable key.

## Param

Array of possible enum values or options.

## Param

Default value if not set.

## Param

Options for retrieving the value.

## Call Signature

```ts
function getEnum(key, enums): undefined | string;
```

Get the specified env variable value as an enum.

### Parameters

#### key

`string`

The environment variable key.

#### enums

Array of possible enum values or options.

[`Options`](../../declarations/interfaces/Options.md) | `string`[]

### Returns

`undefined` \| `string`

The value as an enum.

### Param

The environment variable key.

### Param

Array of possible enum values or options.

### Param

Default value if not set.

### Param

Options for retrieving the value.

## Call Signature

```ts
function getEnum(
   key, 
   enums, 
   defaultValue, 
   options?): string;
```

Get the specified env variable value as an enum.

### Parameters

#### key

`string`

The environment variable key.

#### enums

Array of possible enum values or options.

[`Options`](../../declarations/interfaces/Options.md) | `string`[]

#### defaultValue

`string`

Default value if not set.

#### options?

[`Options`](../../declarations/interfaces/Options.md)

Options for retrieving the value.

### Returns

`string`

The value as an enum.

### Param

The environment variable key.

### Param

Array of possible enum values or options.

### Param

Default value if not set.

### Param

Options for retrieving the value.
