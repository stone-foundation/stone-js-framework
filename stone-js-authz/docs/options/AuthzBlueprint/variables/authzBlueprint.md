[**Authz**](../../../README.md)

***

[Authz](../../../README.md) / [options/AuthzBlueprint](../README.md) / authzBlueprint

# Variable: authzBlueprint

> `const` **authzBlueprint**: [`AuthzBlueprint`](../interfaces/AuthzBlueprint.md)

Opt-in blueprint: import and register it to enable authorization.

It contributes the authz service provider and a kernel middleware that builds the current
principal's ability and attaches it to every request. Both `stone.providers` and
`stone.kernel.middleware` are arrays, so this merges with the rest of the app. Configure
`stone.authz.resolveAbility` to build abilities from your users; guard routes with
`authorize(action, subject)`.
