---
'@stone-js/starters': patch
---

Every starter tests its application instead of mocking the framework.

The test each starter shipped began by stubbing out the framework's own decorators "to lighten the
test environment". It was the first test a new user read, it taught them to mock `@StoneApp`, and it
could pass while nothing worked. Each starter now boots its real application with `createTestApp()`
and asks it a real question, through `stone test`.

One config file, too: `vitest.config.ts` is gone from all thirteen, since the CLI supplies the
runner's defaults and `stone.config.mjs` is where a project overrides them. The coverage threshold
those configs carried is gone with them — a scaffolded project failing `npm test` because the user's
own new code is not fully covered is hostile; the framework holds itself to that gauge, not its users.

The Node console adapter is removed where it declared nothing: both `basic-react` starters, both
`full-react` ones and `basic-service-declarative` registered a CLI adapter with no command to expose,
which put backend code in a frontend project's dependencies for no benefit. The `full-service`
starters keep it, because they declare real commands. `continuum-showcase` remains the place where one
domain over several contexts is demonstrated.

`drizzle-orm` moves to `^0.45.2` in both `full-service` starters, for the identifier-escaping advisory
(GHSA: quoted identifiers were not escaped before being wrapped, so untrusted input reaching
`sql.identifier()` or `.as()` could break out of the quotes).
