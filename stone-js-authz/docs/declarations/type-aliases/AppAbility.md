[**Authz**](../../README.md)

***

[Authz](../../README.md) / [declarations](../README.md) / AppAbility

# Type Alias: AppAbility

> **AppAbility** = [`MongoAbility`](../../casl/interfaces/MongoAbility.md)

The application ability: what a given principal can and cannot do.

Backed by CASL's `MongoAbility`, so it supports both RBAC (action + subject type) and ABAC
(conditions on subject instances). The very same ability works on the frontend to show/hide UI.
