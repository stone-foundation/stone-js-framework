# Function: getEmail()

Get the specified env variable value as an email.

## Param

**key**

The environment variable key.

## Param

**options**

Options for retrieving the value.

## Call Signature

```ts
function getEmail(key): string | undefined;
```

Get the specified env variable value as an email.

### Parameters

#### key

`string`

The environment variable key.

### Returns

`string` \| `undefined`

The value as an email.

## Call Signature

```ts
function getEmail(key, options): string;
```

Get the specified env variable value as an email.

### Parameters

#### key

`string`

The environment variable key.

#### options

`string` \| [`Options`](../../declarations/interfaces/Options.md)

Options for retrieving the value.

### Returns

`string`

The value as an email.
