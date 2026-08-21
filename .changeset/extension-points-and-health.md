---
"@stone-js/authz": patch
"@stone-js/router": patch
"@stone-js/node-cli-adapter": patch
"@stone-js/openapi": patch
"@stone-js/telemetry": patch
"@stone-js/core": patch
"@stone-js/i18n": patch
---

fix: an extension point can say which event it reads, and telemetry answers the probe

**SJ-44, and its family.** `IPolicy.authorize` was a function-typed property with no type parameter, so narrowing it in an implementation was rejected (`TS2416`) and an application had to drop its `implements` clause. Swept every interface an application implements: `IPolicy` and `IAuthorizer` were exposed, `ICommandHandler.match` ignored the event type its own interface already carried, and the page interfaces were safe (their contexts are `any`). All now carry the type they read:

```ts
class PostPolicy implements IPolicy<IncomingHttpEvent> {
  authorize (event: IncomingHttpEvent): boolean { return event.getUser<Actor>() !== undefined }
}
```

A type-level check runs with the authz tests, and removing the parameter now fails the package build.

**SJ-30.** The API explorer printed the path the spec route was *declared* with, so behind a router prefix the page asked for `/openapi.json` and got a 404, while writing the prefix into `specPath` made the router apply its own on top (`/v1/v1/openapi.json`). The explorer asks the router for the URL of the named route now. `swaggerUi.specUrl` states it outright for a document hosted elsewhere.

**A health probe, in `@stone-js/telemetry`.** Telemetry is what you read after the fact; a probe is the question asked in the moment by something that cannot read. Enabling telemetry publishes `/health`: `200` to route traffic here, `503` to stop, and a body naming which dependency said no. Checks are declared like anything else, and resolved through the container so a check can hold the client it is checking:

```ts
@HealthCheck('database')
export class DatabaseCheck {
  constructor ({ db }) { this.db = db }
  async check () { return await this.db.ping() }
}
```

It never hangs (a check that misses its timeout is a failed check) and never stops at the first failure. `stone.telemetry.health.path` moves it, `false` serves nothing.

**And the gap the probe found:** a module that stays platform-neutral and returns `OutgoingResponse` had its response handed to the adapter raw, which failed where the adapter writes, with an error about a chunk that names nothing. The kernel translates the agnostic response through the platform's resolver now; a platform subclass still passes through untouched.

Plus: the i18n boot warning names the cause that actually bites, a configuration replacing the whole `stone.i18n` bucket and dropping what the build injected, and the rule is documented for every plugin-fed bucket.
