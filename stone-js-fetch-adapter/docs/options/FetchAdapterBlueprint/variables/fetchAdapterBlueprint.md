[**FetchAdapter**](../../../README.md)

***

[FetchAdapter](../../../README.md) / [options/FetchAdapterBlueprint](../README.md) / fetchAdapterBlueprint

# Variable: fetchAdapterBlueprint

> `const` **fetchAdapterBlueprint**: [`FetchAdapterBlueprint`](../interfaces/FetchAdapterBlueprint.md)

Default blueprint for the Fetch adapter.

Registers the Web-standard adapter (incoming-event + server-response middleware, resolver,
error handler) and its kernel response resolver. Not `default` — opt in with `@Fetch({ default:
true })` or by making it the only adapter.
