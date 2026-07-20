[**Testing**](../../../README.md)

***

[Testing](../../../README.md) / [options/TestAdapterBlueprint](../README.md) / testAdapterBlueprint

# Variable: testAdapterBlueprint

> `const` **testAdapterBlueprint**: `Partial`\<`StoneBlueprint`\>

Blueprint that installs the in-memory test adapter.

It registers the adapter in `stone.adapters` with `current: true` (so it wins over any real
platform adapter a full app declares, once the core selects the current adapter) AND sets
`stone.adapter` directly (so a minimal app — no `@StoneApp` blueprint pipeline — still resolves
an adapter). Either way, `createTestApp` boots without binding a port.
