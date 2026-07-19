[**Auth**](../../../README.md)

***

[Auth](../../../README.md) / [options/AuthBlueprint](../README.md) / authBlueprint

# Variable: authBlueprint

> `const` **authBlueprint**: [`AuthBlueprint`](../interfaces/AuthBlueprint.md)

Opt-in blueprint: import and register it to enable authentication.

It contributes the auth service provider and a kernel middleware that authenticates every
request from its Bearer token (populating `event.getUser()` when present). Both `stone.providers`
and `stone.kernel.middleware` are arrays, so this merges with the rest of the app. Configure
keys/issuer/audience under `stone.auth`; enforce access per route with `requireAuth()` /
`requireScopes()`.
