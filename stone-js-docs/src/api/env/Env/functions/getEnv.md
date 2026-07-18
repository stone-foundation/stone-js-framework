# Function: getEnv()

```ts
function getEnv(key): undefined | string;
```

Get system env variables.
For Node.js environment get variables from process.env at runtime.
For Browser environment get variables from .env at buildtime.

## Parameters

### key

`string`

The environment variable key.

## Returns

`undefined` \| `string`

The value of the environment variable.
