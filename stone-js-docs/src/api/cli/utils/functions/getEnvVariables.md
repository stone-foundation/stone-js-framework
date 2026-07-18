# Function: getEnvVariables()

```ts
function getEnvVariables(options): undefined | Record<string, string>;
```

Get the env variables in .env file using the Dotenv package.

## Parameters

### options

`Partial`\<[`DotenvOptions`](../../options/DotenvConfig/interfaces/DotenvOptions.md)\>

The options for loading environment variables.

## Returns

`undefined` \| `Record`\<`string`, `string`\>

The parsed environment variables.
