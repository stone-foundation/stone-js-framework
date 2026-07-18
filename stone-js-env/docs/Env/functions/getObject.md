# Function: getObject()

Get the specified env variable value as an object.

## Param

**key**

The environment variable key.

## Param

**options**

Options for retrieving the value.

## Call Signature

```ts
function getObject(key): Record<string, any> | undefined;
```

Get the specified env variable value as an object.

### Parameters

#### key

`string`

The environment variable key.

### Returns

`Record`\<`string`, `any`\> \| `undefined`

The value as an object.

## Call Signature

```ts
function getObject(key, options): Record<string, any> | undefined;
```

Get the specified env variable value as an object.

### Parameters

#### key

`string`

The environment variable key.

#### options

  \| [`Options`](../../declarations/interfaces/Options.md)
  \| `Record`\<`string`, `any`\>

Options for retrieving the value.

### Returns

`Record`\<`string`, `any`\> \| `undefined`

The value as an object.
