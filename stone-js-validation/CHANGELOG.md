# @stone-js/validation

## 0.8.9

### Patch Changes

- 617bfc6: feat: `@Auth()`, `@Authz()`, `@Telemetry()` and `@Validation()`, so every module has its two activation paths

  A Stone.js module is enabled in exactly two ways, and every module must expose both: its **decorator** for the declarative API, or its **blueprint** handed to the application manifest for the imperative one. An audit of every package found 27 modules exposing both and four exposing only the blueprint. These are those four.

  ```ts
  @Auth({ secret: getString("JWT_SECRET") })
  @StoneApp({ name: "my-app" })
  export class Application {}

  // or, imperatively
  export const Application = defineStoneApp({ name: "my-app" }, [
    authBlueprint,
  ]);
  ```

  Each decorator clones its blueprint and overrides only its options bucket, the way `@I18n()` and `@Cors()` do: the blueprint stays the single source of truth for what the module declares, so the two paths cannot drift apart, and each decorated application gets its own copy instead of sharing the exported constant.

  **Breaking (pre-1.0), `@stone-js/telemetry`**: the service class `Telemetry` is renamed **`TelemetryManager`**, freeing the bare name for the decorator, exactly as `CacheManager`, `RealtimeManager` and `I18nManager` do. Rollup was already dropping one of the two `Telemetry` exports as a conflicting re-export. Update `Telemetry` to `TelemetryManager` where you import the service; the container aliases `telemetry` and `Telemetry` are unchanged, so `constructor ({ telemetry })` keeps working.

  **The documented activation was also wrong.** Three places taught `blueprint.set(authBlueprint)` from inside a `@Configuration`, which merges a fragment into the store rather than registering a module: the `@stone-js/auth` README, the website Auth page, and the `stateless-auth` blog starter. All three now enable the module on the application and keep the configuration for what it is for. The four READMEs and the Auth, Authorization and Validation pages document both paths; `authz` and `validation` documented no activation at all, and `telemetry` already documented a `@Telemetry()` decorator that did not exist.

  The two remaining blueprints without a decorator are deliberate: `stoneCliBlueprint` is the CLI's own application, and `testAdapterBlueprint` is consumed by `createTestApp()`. Neither is ever declared on an application class.

  **Also fixed, `@stone-js/node-cli-adapter`**: `@NodeConsole()` merged its options **into** the exported `nodeConsoleAdapterBlueprint` and handed that very object to every decorated class, so a second application built alongside the first inherited its options and the constant stayed dirty for the rest of the process. It now clones before merging, as every other adapter decorator already did.

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

- f6d9fe4: fix(build): published declarations carry explicit `.js` extensions

  Our sources are bundler-style (extensionless relative imports) and `tsc` reproduces what they wrote. In a published ESM package with an `exports` map, a consumer on `moduleResolution: nodenext` cannot resolve those specifiers, so the types of everything they re-export become **invisible**. The reported symptom was misleading: `error TS2305: Module '"@stone-js/use-react"' has no exported member 'useContainer'`, which reads as "the hook does not exist" rather than "the module was not resolved". A pilot project hit it on `@stone-js/use-react` and worked around it with `moduleResolution: "bundler"`, which is right for bundled code but wrong for a pure Node ESM consumer.

  The shared build now rewrites relative specifiers in every emitted declaration (`<file>.js`, or `<dir>/index.js` for a directory), and the generated barrel emits them the same way. `@stone-js/use-view`, which carries its own rollup config, was wired to the same plugin.

  Verified across 635 declaration files: zero extensionless relative imports, and a `moduleResolution: nodenext` consumer importing `useContainer` / `useBlueprint` typechecks clean where it previously reported 138 errors. A `pnpm run check:dts` guard runs in CI right after the build so this cannot regress, including for a package that grows its own build config.

- Updated dependencies [0629318]
- Updated dependencies [8b2bd5d]
- Updated dependencies [6584764]
- Updated dependencies [caf14e3]
- Updated dependencies [f6d9fe4]
- Updated dependencies [e507985]
- Updated dependencies [2ed390b]
  - @stone-js/config@0.8.9
  - @stone-js/core@0.8.9

## 0.8.8

### Patch Changes

- @stone-js/core@0.8.8

## 0.8.7

### Patch Changes

- @stone-js/core@0.8.7

## 0.8.6

### Patch Changes

- @stone-js/core@0.8.6

## 0.8.5

### Patch Changes

- @stone-js/core@0.8.5

## 0.8.4

### Patch Changes

- @stone-js/core@0.8.4

## 0.8.3

### Patch Changes

- @stone-js/core@0.8.3

## 0.8.2

### Patch Changes

- Updated dependencies [d7f213c]
  - @stone-js/core@0.8.2

## 0.8.1

### Patch Changes

- Updated dependencies
  - @stone-js/core@0.8.1
