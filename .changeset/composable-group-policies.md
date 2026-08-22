---
"@stone-js/router": patch
"@stone-js/authz": patch
---

feat: a group's policy holds for every child, and authz composes

A policy on a group used to be replaced by the child's own, silently: the router's default merge is child-wins, which is right for most module props (a child's `contract` is its contract) and wrong for a gate. Now:

```ts
@EventHandler('/', { authz: 'policy.parent' })
export class AdminController {
  @Get('/name', { authz: 'platform.operate' })
  name () { }        // enforced: policy.parent, then platform.operate
}
```

Both gates hold, parent first, because the group encloses its routes, the same order group middleware runs in. `authz` also accepts an array outright (`authz: ['a', 'b']`), so a route composes its own chain: a conjunction where the first denial answers, names itself, and later gates never run, since a child policy has no business running for a caller the group already refused.

The router learned this without learning authz: a module declares its own prop composable through its blueprint (`stone.router.composableProps`), and the router flattens parent and child values in order for the declared keys only. Everything undeclared keeps child-wins, unchanged.
