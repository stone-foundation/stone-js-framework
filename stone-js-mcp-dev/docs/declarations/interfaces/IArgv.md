[**Mcp Dev**](../../README.md)

***

[Mcp Dev](../../README.md) / [declarations](../README.md) / IArgv

# Interface: IArgv

Minimal yargs builder surface used to declare the command's options. Re-declared locally so the
package stays decoupled from `@stone-js/node-cli-adapter` (the CLI adapter passes the real
yargs builder at run time; this only shapes the callback).

## Properties

### option

> **option**: (`name`, `options`) => `IArgv`

#### Parameters

##### name

`string`

##### options

###### alias?

`string`

###### default?

`unknown`

###### desc?

`string`

###### type?

`string`

#### Returns

`IArgv`

***

### positional

> **positional**: (`name`, `options`) => `IArgv`

#### Parameters

##### name

`string`

##### options

`Record`\<`string`, `unknown`\>

#### Returns

`IArgv`
