# Function: getViteConfig()

```ts
function getViteConfig(command, mode): Promise<UserConfig>;
```

Gets the Vite configuration.

## Parameters

### command

The command to run.

`"build"` | `"serve"`

### mode

The mode to run.

`"production"` | `"development"`

## Returns

`Promise`\<`UserConfig`\>

The Vite configuration.
