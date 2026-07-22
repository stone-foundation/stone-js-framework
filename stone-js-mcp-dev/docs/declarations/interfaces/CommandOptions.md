[**Mcp Dev**](../../README.md)

***

[Mcp Dev](../../README.md) / [declarations](../README.md) / CommandOptions

# Interface: CommandOptions

CLI command options, structurally compatible with `@stone-js/node-cli-adapter`'s `CommandOptions`.

## Properties

### alias?

> `optional` **alias?**: `string` \| `string`[]

***

### args?

> `optional` **args?**: `string` \| `string`[]

***

### desc?

> `optional` **desc?**: `string`

***

### name

> **name**: `string`

***

### options?

> `optional` **options?**: (`yargs`) => [`IArgv`](IArgv.md)

#### Parameters

##### yargs

[`IArgv`](IArgv.md)

#### Returns

[`IArgv`](IArgv.md)
