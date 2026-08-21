# @stone-js/resources

## 0.8.10

### Patch Changes

- d01d92b: Resources stand alone, and a contract is derived from everything a route declares.

  **Resources no longer depend on a validation module.** Exposing data required enabling
  `@stone-js/validation` and throwing without it — coupling with nothing to show for it. The module now
  carries its own `ContractChecker`, which reads _specifications_ rather than one library's API:
  Standard Schema first (Zod, Valibot, ArkType and others), then `safeParse`, `parse` or `validate`.
  Pass your own `checker` to teach it another dialect. A schema it cannot run raises rather than
  reporting success, and an asynchronous schema says so instead of serialising a promise.

  **The route option is `contract`, not `openapi`.** A route describes itself; OpenAPI is one way of
  rendering that description, and naming the option after a specification put that specification's name
  in the router's vocabulary. `contract: { summary }` states what the derivation cannot know, and
  `contract: false` keeps an endpoint out of the document.

  **Everything a route declares is now discovered, wherever it was written.** The document reads the
  route option _and_ the handler's own decorator — `@Validate`, `@Returns`, `@Protect`, `@Can` — for all
  four concerns. Both modules advertise working without a router, and a contract that only read route
  options documented half of such an application: endpoints listed, payloads missing. The keys are read
  as strings, so `@stone-js/openapi` still depends on none of those packages.

  **A named resource is documented.** Neither call site passed the resource registry, so
  `{ resource: 'task' }` — the recommended style — produced no documented response while an inline
  resource did. Both now hand over `stone.resources.registry`.

  **Fragments are part of the contract, not prose.** They were named in a description, invisible to a
  generated client, a form or a test. They are now an enumerated query parameter, under the name the
  application actually answers to (`stone.resources.params.fragment`), so a document never advertises a
  parameter the app does not have.

  **A declaration that could not be read is reported.** Omitting a contract we cannot build stays the
  rule — a wrong contract is worse than a missing one — but silence meant an endpoint shipped
  undocumented inside a document that looked complete. `stone openapi` prints one line per skipped
  declaration, naming the route and the reason, and the served handler logs the same.

- 35c159b: Resources declare what leaves as a schema, and hold themselves to it.

  A projection written as code answered "what does this endpoint return?" only to someone who read it
  and trusted it: nothing checked it, nothing documented it, and a field added to the model later leaked
  because a mapping was not updated. A resource now declares a **schema**, in whatever dialect the
  application already validates input with, and that one declaration does three jobs — it _is_ the
  projection (what it does not describe is not exposed), it validates the response before it is sent,
  and `@stone-js/openapi` derives the output contract from it.

  - `schema(context)` is the contract. `fragments(context)` names subsets a caller may select through a
    configurable query parameter (`?view=summary` by default), each a documented contract of its own
    rather than an ad-hoc filter.
  - `data(model, context)` is an optional, asynchronous hook resolved from the container: fetch a
    relation, translate a label, compute a total. Whatever it returns is what the schema validates.
  - `item`, `collection` and `response` are asynchronous. The previous synchronous path turned an async
    projection into `{}` without a word.
  - A breach raises `ResourceContractError` naming the field that failed. It fires on a genuine breach,
    never on a difference, since a schema strips what it does not describe. `onViolation: 'warn'` trades
    integrity for availability, explicitly.
  - The context now carries the authenticated principal and the event, so a resource deciding what a
    caller may see no longer has to be told by the handler.

  **Fixes a defect that made route-declared resources unusable with a response decorator.**
  `@JsonHttpResponse(201)` wraps the method itself, so by the time route middleware ran the handler had
  already produced a response; projecting that object produced an empty payload and dropped the status.
  The payload is now shaped in place, and the status, headers and everything else the handler chose are
  left alone.

  Also fixed, all found by consumers rather than by us:

  - `@ValidationSchema` was **invisible to TypeScript**: the barrel exported an interface and a decorator
    of the same name, and TypeScript drops a name two `export *` both provide. The interface is now
    `NativeSchema`, matching the `isNativeSchema` guard that already existed.
  - `@stone-js/auth`'s `AuthorizationError` is now `InsufficientScopeError`. It is thrown for a missing
    scope, and it shared a name with `@stone-js/authz`'s error for a policy denial, so an application
    mapping errors had to map two identical names from two packages.
  - The auth documentation described an `Authenticator` with `authenticate(event)` that was never
    shipped; it now documents `resolveUser`, which is the real extension point, and `event.getUser()`
    rather than `event.get('user')` — the principal travels through a resolver, so the generic accessor
    never reached it. The same mistake was in this module's own code.
  - Two decorator examples showed options that do not exist (`@Validation({ abortEarly })`,
    `@Authz({ abilities })`); they now show `schemas` and `resolveAbility`.

- Updated dependencies [9f074f8]
  - @stone-js/core@0.8.10
  - @stone-js/config@0.8.10

## 0.8.9

### Patch Changes

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

## 0.8.7

## 0.8.6

## 0.8.5

## 0.8.4

## 0.8.3

## 0.8.2

## 0.8.1
