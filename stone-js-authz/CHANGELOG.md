# @stone-js/authz

## 1.0.0

### Minor Changes

- 0edcba4: Add `@stone-js/authz`: framework-agnostic, isomorphic authorization built on CASL. RBAC + ABAC with the exact same rules on the backend and the frontend — define abilities once, guard routes and shape the UI. Ships the `Authorizer` service (deny-all by default), an `AbilityMiddleware` (builds and attaches the current principal's ability), an `authorize(action, subject)` route guard, curated CASL re-exports (`defineAbility`, `createMongoAbility`, …), `authzBlueprint` and `AuthzServiceProvider`. Composes with `@stone-js/auth` via `event.getUser()`.

### Patch Changes

- Updated dependencies [3308197]
  - @stone-js/core@1.0.0
  - @stone-js/http-core@1.0.0
