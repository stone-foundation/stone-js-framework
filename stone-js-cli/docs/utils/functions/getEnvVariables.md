# Function: getEnvVariables()

```ts
function getEnvVariables(options): Record<string, string> | undefined;
```

Get the env variables in .env file using the Dotenv package.

## Parameters

### options

`Partial`\<[`DotenvOptions`](../../options/DotenvConfig/interfaces/DotenvOptions.md)\>

The options for loading environment variables.

## Returns

`Record`\<`string`, `string`\> \| `undefined`

The parsed environment variables.
