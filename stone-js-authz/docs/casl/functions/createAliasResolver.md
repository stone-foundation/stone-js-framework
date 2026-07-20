[**Authz**](../../README.md)

***

[Authz](../../README.md) / [casl](../README.md) / createAliasResolver

# Function: createAliasResolver()

> **createAliasResolver**(`aliasMap`, `options?`): (`action`) => `string`[]

Curated re-exports of the CASL essentials, so applications get one import surface from
`@stone-js/authz` and can define abilities without depending on CASL directly. Full CASL power
(conditions, field-level rules, subject detection) remains available.

## Parameters

### aliasMap

`AliasesMap`

### options?

`AliasResolverOptions`

## Returns

(`action`) => `string`[]
