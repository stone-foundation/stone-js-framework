# Function: getEnum()

Get the specified env variable value as an enum.

## Param

**key**

The environment variable key.

## Param

**enums**

Array of possible enum values or options.

## Param

**defaultValue**

Default value if not set.

## Param

**options**

Options for retrieving the value.

## Call Signature

```ts
function getEnum(key, enums): string | undefined;
```

Get the specified env variable value as an enum.

### Parameters

#### key

`string`

The environment variable key.

#### enums

[`Options`](../../declarations/interfaces/Options.md) \| `string`[]

Array of possible enum values or options.

### Returns

`string` \| `undefined`

The value as an enum.

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

[`Options`](../../declarations/interfaces/Options.md) \| `string`[]

Array of possible enum values or options.

#### defaultValue

`string`

Default value if not set.

#### options?

[`Options`](../../declarations/interfaces/Options.md)

Options for retrieving the value.

### Returns

`string`

The value as an enum.
