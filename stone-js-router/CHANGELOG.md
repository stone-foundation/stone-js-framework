# Changelog

## 0.8.15

### Patch Changes

- @stone-js/core@0.8.15
- @stone-js/pipeline@0.8.15

## 0.8.14

### Patch Changes

- ed1bdb8: fix: an extension point can say which event it reads, and telemetry answers the probe

  **SJ-44, and its family.** `IPolicy.authorize` was a function-typed property with no type parameter, so narrowing it in an implementation was rejected (`TS2416`) and an application had to drop its `implements` clause. Swept every interface an application implements: `IPolicy` and `IAuthorizer` were exposed, `ICommandHandler.match` ignored the event type its own interface already carried, and the page interfaces were safe (their contexts are `any`). All now carry the type they read:

  ```ts
  class PostPolicy implements IPolicy<IncomingHttpEvent> {
    authorize(event: IncomingHttpEvent): boolean {
      return event.getUser<Actor>() !== undefined;
    }
  }
  ```

  A type-level check runs with the authz tests, and removing the parameter now fails the package build.

  **SJ-30.** The API explorer printed the path the spec route was _declared_ with, so behind a router prefix the page asked for `/openapi.json` and got a 404, while writing the prefix into `specPath` made the router apply its own on top (`/v1/v1/openapi.json`). The explorer asks the router for the URL of the named route now. `swaggerUi.specUrl` states it outright for a document hosted elsewhere.

  **A health probe, in `@stone-js/telemetry`.** Telemetry is what you read after the fact; a probe is the question asked in the moment by something that cannot read. Enabling telemetry publishes `/health`: `200` to route traffic here, `503` to stop, and a body naming which dependency said no. Checks are declared like anything else, and resolved through the container so a check can hold the client it is checking:

  ```ts
  @HealthCheck("database")
  export class DatabaseCheck {
    constructor({ db }) {
      this.db = db;
    }
    async check() {
      return await this.db.ping();
    }
  }
  ```

  It never hangs (a check that misses its timeout is a failed check) and never stops at the first failure. `stone.telemetry.health.path` moves it, `false` serves nothing.

  **And the gap the probe found:** a module that stays platform-neutral and returns `OutgoingResponse` had its response handed to the adapter raw, which failed where the adapter writes, with an error about a chunk that names nothing. The kernel translates the agnostic response through the platform's resolver now; a platform subclass still passes through untouched.

  Plus: the i18n boot warning names the cause that actually bites, a configuration replacing the whole `stone.i18n` bucket and dropping what the build injected, and the rule is documented for every plugin-fed bucket.

- Updated dependencies [ed1bdb8]
- Updated dependencies [a67a77b]
  - @stone-js/core@0.8.14
  - @stone-js/pipeline@0.8.14

## 0.8.13

### Patch Changes

- @stone-js/core@0.8.13
- @stone-js/pipeline@0.8.13

## 0.8.12

### Patch Changes

- Updated dependencies [c971168]
  - @stone-js/core@0.8.12
  - @stone-js/pipeline@0.8.12

## 0.8.11

### Patch Changes

- Updated dependencies [13cebd1]
  - @stone-js/core@0.8.11
  - @stone-js/pipeline@0.8.11

## 0.8.10

### Patch Changes

- 18644c8: feat(router): navigation becomes an effect the platform provides, not an assumption

  `Router.navigate()` was the one place the universal router stopped being universal: it reached
  straight for `window.history` and `window.dispatchEvent`, and threw outside a browser. Everything
  around it, matching and generating a path from a route name, is platform-independent already.

  Only that last step is now delegated, to a `RouterNavigator` under `stone.router.navigator`:

  ```ts
  export type RouterNavigator = (context: NavigationContext) => void;
  // NavigationContext: { path, replace, options }
  ```

  The router still does the platform-independent work before calling it, so a navigator receives a
  resolved path and performs one effect. `browserNavigator` is the fallback when none is configured,
  and it is the exact behaviour that was inlined before (push or replace a History entry, then
  announce it so the adapter re-enters the kernel), which means **nothing changes for a web
  application**: a `navigate()` outside a browser still throws the same `RouterError`.

  The fallback lives in `Router.navigate()` and deliberately **not** in the router's blueprint. Pinning
  it there would make "not configured" indistinguishable from "configured to be the browser", and an
  adapter for another platform could never tell whether it was free to install its own: it could not,
  and `navigate()` on a phone threw "browser environment" instead of navigating.

  One ordering nuance for the curious: with a route name and no browser, the missing-route error now
  surfaces before the missing-browser one, because resolving the path no longer waits behind a
  platform check.

  **`ViewEngine` no longer requires a DOM element to mount into.** `mount` and `hydrate` were typed
  `(node, container: Element)`, a DOM type in the middle of the engine-agnostic contract. The host is
  now a third type parameter defaulting to `Element`, so every existing engine and call site is
  unchanged, and an engine on a platform with no element tree (React Native registers a root
  component) can name its own host.

  **`ReactViewEngine` no longer instantiates a `TextEncoder` at import time.** It moved inside the
  streaming helper that uses it. Importing a module should not require a global that only server
  streaming needs, and some client engines do not have it.

  Together these are what a platform outside the browser needs from the shared layers, and they are
  the reason the React Native work needs no fork of the router or of the view contract.

- Updated dependencies [9f074f8]
  - @stone-js/core@0.8.10
  - @stone-js/pipeline@0.8.10

## 0.8.9

### Patch Changes

- 0629318: Point every README link at somewhere that exists.

  The per-module repositories were retired when the framework moved to a single one, so 36 links
  across 18 READMEs answered with a 404: the exact links a newcomer clicks first, "Contributing"
  and "API". The contributing guide now points at the monorepo, and the API reference at the
  published one.

  `docs/` was never a durable target either, retired repository or not: it is TypeDoc output, and
  every build begins by deleting it.

- 5e01789: **Breaking (pre-1.0)**: removed `defineI18n`, `defineCache`, `defineQueue`, `defineRealtime`, `defineEventBus` and `defineKeyRouting`

  A module is enabled in exactly two ways, and that is a universal rule of the framework: its **decorator** for the declarative API (`@I18n()`, `@Cache()`, `@Queue()`, `@Realtime()`, `@EventBus()`, `@KeyRouting()`), or its **blueprint** handed to the app manifest for the imperative one, `defineStoneApp(handler, options, [i18nBlueprint])`, which is the exact counterpart of `@StoneApp(options, [i18nBlueprint])`. These six helpers were a third path that enabled nothing: each returned an unwrapped configuration fragment (`{ i18n: … }`), and the pattern every README and docs page showed for them, `defineConfig(defineX({...}))`, **configured nothing at all**. `defineConfig` expects a function or an object carrying `configure`; handed a fragment it falls back to an empty `configure`, silently. That is what made the i18n catalogs never load.

  **Migration**: enable with the decorator or the blueprint, and configure with `blueprint.set`:

  ```ts
  // before (compiled, ran, configured nothing)
  export const AppConfig = defineConfig(defineCache({ default: 'redis', stores: [...] }))

  // after: enable on the manifest, configure with blueprint.set
  export const Application = defineStoneApp(handler, { name: 'my-app' }, [cacheBlueprint])

  export const AppConfig = defineConfig((blueprint) => blueprint.set('stone.cache', {
    default: 'redis',
    stores: [...]
  }))
  ```

  READMEs and documentation pages are updated accordingly. `defineJobHandler` and `defineKeyRoute` are untouched: they declare a module, not a configuration bucket, and keep their imperative role next to `@JobHandler` and `@KeyRoute`.

- be13033: feat: a route declares what it accepts and what it exposes, and the modules do the rest

  A route definition is the one place that describes a route, so `validation` and `resource` now live there, next to the path and the handler. Each module reads the part it owns; the router carries them and does nothing with them, which is what keeps it agnostic and what will let `@stone-js/openapi` publish the contract without being told a second time.

  ```ts
  @Post('/users', { validation: CreateUserSchema, resource: userResource })
  create (event: IncomingHttpEvent) {
    const user = event.get<CreateUser>('validatedBody')
    return this.users.add(user)          // returns the domain model, whole
  }
  ```

  One schema means the body, which is what almost every route means. Several sources at once take a
  map: `{ validation: { body: CreateUserSchema, query: ListQuerySchema } }`.

  **Input.** `@stone-js/validation` contributes a route middleware that validates what the route declared before the handler runs, and publishes each **parsed** source in the event's metadata under a predictable name: `validatedBody`, `validatedQuery`, `validatedParams`. A handler reads them with `event.get('validatedBody')`, with nothing to import and no helper to remember, because `get` already falls back to metadata.

  That matters more than it looks: a schema does not only accept or reject, it coerces and strips. `validateEvent` used to compute the parsed value and throw it away, so an application validated `"42"` and then used the string. It now returns it.

  Sources are read whole, since a schema validates the payload rather than one field of it: `event.get('body')` asks for a field _named_ body inside the body, a different question. A `URLSearchParams` query is normalised into a plain object, and any other source name falls back to `event.get`, so a CLI argument set or a message attribute validates just as well.

  **Output.** `@stone-js/resources` contributes a route middleware that applies the declared resource to whatever the handler returned. A service returns its domain model, including the fields it must never expose, and the route decides what leaves. It runs on the raw return value, before any response wrapping, so it knows nothing of HTTP and works in every context. Sparse fieldsets still apply, so `?fields=id,name` narrows the output without the route changing.

  Both accept a name instead of a value, resolved from `stone.validation.schemas` and `stone.resources.registry`, and both **fail loudly on a name nobody registered** rather than silently validating nothing or returning the model unshaped.

  `@stone-js/resources` gains its two activation paths, `@Resources()` and `resourcesBlueprint`, which it needed to contribute its middleware.

  Both middlewares are a no-op on routes that declare nothing, so enabling either costs an application that does not use it one function call per request.

  ## Each module owns its key, so it works with or without a router

  `@Validate(schema)` and `@Returns(resource)` record what a handler accepts and exposes **on the
  handler itself**, under each module's own metadata key. Neither knows anything about the router, so
  both work in a routed application, a single-handler service, a CLI command or the browser. The route
  props stay available as the tidier transport when a router is in play, and win when both are present,
  because a route is then the single description of itself.

  ```ts
  @Validate(CreateUserSchema)   // in
  @Returns(userResource)        // out
  create (event) { return this.users.add(event.get('validatedBody')) }
  ```

  ## Schemas and resources as classes, registered under a name

  ```ts
  @ValidationSchema("createUser")
  export class CreateUserSchema implements IValidationSchema {
    constructor({ i18n }) {
      this.i18n = i18n;
    }
    rules() {
      return {
        body: z.object({
          email: z.string().email(this.i18n.t("validation.email")),
        }),
      };
    }
  }

  @ApiResource("user")
  export class UserResource extends Resource<User> {
    toArray(user) {
      return { id: user.id, name: user.name };
    }
  }
  ```

  `rules()` is deliberately declarative: a contract that describes itself can be read by
  `@stone-js/openapi` to publish the request schema, which a method that merely validated could not.
  There is no `messages()` method, and none is needed: the **class** is resolved by the container, so
  its constructor takes the services and `rules()` builds its schemas with them, i18n included. Zod
  already carries per-field messages; a global failure is an exception.

  A build-phase middleware in each module collects the registered classes into
  `stone.validation.schemas` and `stone.resources.registry`, with the same scan the router uses for its
  route definitions. Routes and handlers then name a schema or a resource instead of importing it, and
  openapi can walk the registries without loading anything. `defineValidationSchema` is the imperative
  counterpart, with the same dependencies.

  Nothing in either module touches HTTP, so the same schema class validates a form on the frontend:
  resolve it from the container and call `rules()`. One schema, both sides.

  ## The schema engine comes from the container too

  An application declares what to make resolvable, and the provider binds it:

  ```ts
  import { z } from "zod";
  blueprint.set("stone.validation.engines", { zod: z });

  @ValidationSchema("createUser")
  export class CreateUserSchema implements IValidationSchema {
    constructor({ zod }: { zod: typeof z }) {
      this.z = zod;
    }
    rules() {
      return { body: this.z.object({ email: this.z.string().email() }) };
    }
  }
  ```

  More elegant than importing the library at every schema, and more testable: a test hands the class a
  fake engine instead of mocking a module. The **application** names the engine and this module never
  imports one, which is what keeps it agnostic. Zod, Valibot and ArkType already arrive through Standard
  Schema, and a native schema needs no engine at all; binding a specific library here would make every
  application depend on it.

- b3efe5f: fix(router): group middleware runs before route middleware

  `mergeDefinitions` assembled a child's middleware as `[child, parent]`, so a route's middleware ran **before** its group's. The documentation has always stated the opposite ("group middleware first, then route middleware"), so this was the code contradicting the contract.

  Measured consequence on a pilot project: an anonymous request with an invalid body answered `422` with field-level details on a group guarded by authentication, instead of `401`. Work was done for an unauthenticated caller, and the response described the expected body shape of a protected surface, a free information leak.

  Now `[parent, child]`, verified across two nesting levels. If you relied on the previous order, move the middleware to the level where you want it to run.

- f6d9fe4: fix(build): published declarations carry explicit `.js` extensions

  Our sources are bundler-style (extensionless relative imports) and `tsc` reproduces what they wrote. In a published ESM package with an `exports` map, a consumer on `moduleResolution: nodenext` cannot resolve those specifiers, so the types of everything they re-export become **invisible**. The reported symptom was misleading: `error TS2305: Module '"@stone-js/use-react"' has no exported member 'useContainer'`, which reads as "the hook does not exist" rather than "the module was not resolved". A pilot project hit it on `@stone-js/use-react` and worked around it with `moduleResolution: "bundler"`, which is right for bundled code but wrong for a pure Node ESM consumer.

  The shared build now rewrites relative specifiers in every emitted declaration (`<file>.js`, or `<dir>/index.js` for a directory), and the generated barrel emits them the same way. `@stone-js/use-view`, which carries its own rollup config, was wired to the same plugin.

  Verified across 635 declaration files: zero extensionless relative imports, and a `moduleResolution: nodenext` consumer importing `useContainer` / `useBlueprint` typechecks clean where it previously reported 138 errors. A `pnpm run check:dts` guard runs in CI right after the build so this cannot regress, including for a package that grows its own build config.

- e507985: fix(core): the error-handler contract accepts what the kernel consumes

  `IErrorHandler.handle` required a fully built response type, while the intended usage (and the framework's own `RouterErrorHandler`) returns plain response options that the kernel hands to its `responseResolver`. The framework cast itself and every consumer had to reproduce that cast.

  `FunctionalErrorHandler` now returns `UResponse | ResponseResolverOptions`, a pure widening, so existing handlers keep compiling. `RouterErrorHandler` drops its internal cast accordingly.

- Updated dependencies [0629318]
- Updated dependencies [8b2bd5d]
- Updated dependencies [6584764]
- Updated dependencies [caf14e3]
- Updated dependencies [f6d9fe4]
- Updated dependencies [e507985]
- Updated dependencies [2ed390b]
  - @stone-js/core@0.8.9
  - @stone-js/pipeline@0.8.9

## 0.8.8

### Patch Changes

- @stone-js/core@0.8.8
- @stone-js/pipeline@0.8.8

## 0.8.7

### Patch Changes

- @stone-js/core@0.8.7
- @stone-js/pipeline@0.8.7

## 0.8.6

### Patch Changes

- @stone-js/core@0.8.6
- @stone-js/pipeline@0.8.6

## 0.8.5

### Patch Changes

- @stone-js/core@0.8.5
- @stone-js/pipeline@0.8.5

## 0.8.4

### Patch Changes

- @stone-js/core@0.8.4
- @stone-js/pipeline@0.8.4

## 0.8.3

### Patch Changes

- @stone-js/core@0.8.3
- @stone-js/pipeline@0.8.3

## 0.8.2

### Patch Changes

- Updated dependencies [d7f213c]
  - @stone-js/core@0.8.2
  - @stone-js/pipeline@0.8.2

## 0.8.1

### Patch Changes

- Updated dependencies
  - @stone-js/core@0.8.1
  - @stone-js/pipeline@0.8.1

All notable changes to the "Stone.js Router" extension will be documented in this file.

## Unreleased

### Features

- add the light key-router: `@KeyRouting()` / `@KeyHandler()` / `@OnKey()`, `keyRoutingBlueprint`, `defineKeyRouting` / `defineKeyRoute`. Routes events by a configurable key instead of a path, installs itself as the kernel event handler (mutually exclusive with `@Routing()`), and is tree-shaken away when unused.
- absorb the former `@stone-js/key-router` package (now deleted): `KeyRouter`, `createKeyDecorator`, `collectKeyHandlers`, `defineKeyHandler` and `KeyRouterError` ship here now. Consuming modules (`@stone-js/queue`, `@stone-js/event-bus`, `@stone-js/realtime`) import them from `@stone-js/router`.

## [0.2.1](https://github.com/stone-foundation/stone-js-router/compare/v0.2.0...v0.2.1) (2026-06-12)

### Bug Fixes

- removed Lookbehind regular expression syntax to ensure compatibility with older systems ([#18](https://github.com/stone-foundation/stone-js-router/issues/18)) ([d6dd196](https://github.com/stone-foundation/stone-js-router/commit/d6dd1960d269dfbfe56c225b6e77656247f5433c))

## [0.2.0](https://github.com/stone-foundation/stone-js-router/compare/v0.1.0...v0.2.0) (2026-03-29)

### Features

- add a protocol strategy to support global protocol forcing ([#15](https://github.com/stone-foundation/stone-js-router/issues/15)) ([4014499](https://github.com/stone-foundation/stone-js-router/commit/4014499c1383e4247d912d8538e077403ca458b1))

## [0.1.0](https://github.com/stone-foundation/stone-js-router/compare/v0.0.3...v0.1.0) (2025-06-12)

### Features

- major internal restructuring and cleanup ([#3](https://github.com/stone-foundation/stone-js-router/issues/3)) ([8fbaeca](https://github.com/stone-foundation/stone-js-router/commit/8fbaeca87265f49c925a5a96af252f17c80da8b5))

## [0.0.3](https://github.com/stone-foundation/stone-js-router/compare/v0.0.2...v0.0.3) (2025-01-21)

### Features

- add component route runner ([dcb1dec](https://github.com/stone-foundation/stone-js-router/commit/dcb1dec66c9e996e5c030f78d90c59b8a8a33287))

## 0.0.2 (2025-01-10)

### Features

- implement router ([f8abb83](https://github.com/stone-foundation/stone-js-router/commit/f8abb83c37fe480e42cabc3da7fe0734d13cab4c))
