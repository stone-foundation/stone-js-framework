# Function: getViteConfig()

```ts
function getViteConfig(command, mode): Promise<UserConfig>;
```

Gets the Vite configuration.

## Parameters

### command

`"build"` \| `"serve"`

The command to run.

### mode

`"production"` \| `"development"`

The mode to run.

## Returns

`Promise`\<`UserConfig`\>

The Vite configuration.
