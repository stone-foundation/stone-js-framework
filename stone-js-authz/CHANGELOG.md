# @stone-js/authz

## 0.8.12

### Patch Changes

- 03bf130: fix: a documented endpoint keeps its payload, and a translated app answers in the caller's language

  Found by reading a deployed contract and by building a bundle, not by reading code.

  - **The response of a documented endpoint was empty.** Writing `200: { description: '…' }` in a route's `contract` replaced the derived success response instead of describing it, so every endpoint whose author had documented it carefully lost its schema: 27 of 29 in a live API. Statuses merge per status and per field now; a _different_ success status still replaces the derived one, because an operation answering both `200` and `204` describes an endpoint that cannot exist.
  - **A request schema that normalises before it judges took the whole document down.** Requests are described as `input` and responses as `output`: a transform has no output shape, and asking for one threw out of the entire generation, so the contract endpoint answered 500 because one body trimmed a string. A schema that still cannot be described is now left out alone, and reported.
  - `$schema` no longer leaks into a document that declares OpenAPI 3.0, and an unnamed route no longer publishes `operationId: ""`.
  - **Translations discovered at build time now say which locales exist.** Content negotiation is skipped entirely when `stone.i18n.locales` is empty, so a caller asking for French got the fallback language, and under lazy loading (the default) that is how an application answers raw keys: only the resolved locale is fetched, and the resolved locale was never the caller's. The generated module declares the locales the scan found, so `Accept-Language` works with no configuration at all.
  - **`stone test` runs the framework inside the runner's module graph.** Discovery imports your modules at run time, and an installed package doing that sits outside the transform, so `import('app/Handler.ts')` reached Node directly and died on `Unknown file extension ".ts"`.
  - The three discovery middlewares are gone: `@ApiResource`, `@ValidationSchema` and `@Policy` carry their own registration, so nothing needs to read the metadata back out.
  - `ResourceContext<EventType, PrincipalType>` takes the event and the principal, `unknown` by default.

- Updated dependencies [047d9b0]
- Updated dependencies [c971168]
  - @stone-js/http-core@0.8.12
  - @stone-js/core@0.8.12
  - @stone-js/config@0.8.12

## 0.8.11

### Patch Changes

- Updated dependencies [13cebd1]
  - @stone-js/http-core@0.8.11
  - @stone-js/core@0.8.11
  - @stone-js/config@0.8.11

## 0.8.10

### Patch Changes

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
  - @stone-js/http-core@0.8.10
  - @stone-js/config@0.8.10

## 0.8.9

### Patch Changes

- fac1e2f: feat: a route declares who may call it, and what they may do

  The last two of the four route props, on the same shape as `validation` and `resource`. A route, or a handler, states its requirement; the module enforces it; and because it is **declared rather than wired**, `@stone-js/openapi` can publish the endpoint as protected. A guard buried in a middleware list protects the endpoint but tells nothing else about it, so the contract stays silent and a caller reads its 401 as a bug.

  ```ts
  @Get('/me', { auth: true })                                    // authenticated
  @Post('/tasks', { auth: 'tasks:write' })                       // and holding a scope
  @Delete('/posts/:id', { authz: { action: 'delete', subject: 'Post' } })
  @Patch('/posts/:id', { authz: 'post.update' })                 // a registered policy
  ```

  Neither module knows anything about the router. `@Protect()` and `@Can()` record the requirement on the handler under each module's own key, so it holds in a routed application, a single-handler service, a CLI command or the browser; the route props stay the tidier transport when a router is in play, and win when both are present.

  ## Policies, for what an ability cannot express

  An ability answers what a _role_ may do. A policy answers what _this caller_ may do to _this record_, which needs the record:

  ```ts
  @Policy("post.update")
  export class UpdatePostPolicy implements IPolicy {
    constructor({ posts }: { posts: PostService }) {
      this.posts = posts;
    }

    async authorize(event: IncomingEvent): Promise<boolean> {
      const post = await this.posts.find(event.get("id"));
      return post.authorId === event.getMetadataValue<JwtClaims>("auth")?.sub;
    }
  }
  ```

  Resolved through the container, so it gets its services, and collected into `stone.authz.policies` by the same scan the router uses. `definePolicy` is the imperative counterpart.

  **A missing policy denies.** Naming one that is not registered throws rather than passing through, because a gap in the rules must never read as permission. The same applies when no ability was attached at all.

  ## Ordering

  Authentication (priority 3), then authorization (4), then validation (5): who the caller is, then whether they may, then what they sent. There is no point parsing a payload for a caller who is not allowed to send one.

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

- 97a6730: Clear the quality findings this cycle's work raised.

  Two are worth naming because they were real, not stylistic. An authorization failure built its message
  with `String(subject)`, so refusing a class or an instance said `Not allowed to read [object Object]`
  — an error that names nothing. And two regular expressions could be made super-linear by their own
  input: a trailing-slash strip in the test-module scan, and the declaration-rewriting pattern in the
  shared build, both rewritten so no input can force them to backtrack.

  The rest is shape: the SSG segment parser split into three named readers instead of one function
  holding every case, a nested ternary unfolded in the OpenAPI plugin, a duplicated directory walk
  shared in the build config, an escaped pattern read as `String.raw`, and a rejection path turned into
  a single exit so the error is raised where its message lives.

  `CORSHeadersMiddleware` and `MetaCORSHeadersMiddleware` are **removed**. They were deprecated with a
  documented replacement (`@Cors()` or `corsBlueprint`, the two ways a module is enabled), nothing in
  the framework used them, and a deprecated third activation path is worth deleting rather than keeping
  around to trip over.

- f6d9fe4: fix(build): published declarations carry explicit `.js` extensions

  Our sources are bundler-style (extensionless relative imports) and `tsc` reproduces what they wrote. In a published ESM package with an `exports` map, a consumer on `moduleResolution: nodenext` cannot resolve those specifiers, so the types of everything they re-export become **invisible**. The reported symptom was misleading: `error TS2305: Module '"@stone-js/use-react"' has no exported member 'useContainer'`, which reads as "the hook does not exist" rather than "the module was not resolved". A pilot project hit it on `@stone-js/use-react` and worked around it with `moduleResolution: "bundler"`, which is right for bundled code but wrong for a pure Node ESM consumer.

  The shared build now rewrites relative specifiers in every emitted declaration (`<file>.js`, or `<dir>/index.js` for a directory), and the generated barrel emits them the same way. `@stone-js/use-view`, which carries its own rollup config, was wired to the same plugin.

  Verified across 635 declaration files: zero extensionless relative imports, and a `moduleResolution: nodenext` consumer importing `useContainer` / `useBlueprint` typechecks clean where it previously reported 138 errors. A `pnpm run check:dts` guard runs in CI right after the build so this cannot regress, including for a package that grows its own build config.

- Updated dependencies [97a6730]
- Updated dependencies [0629318]
- Updated dependencies [8b2bd5d]
- Updated dependencies [6584764]
- Updated dependencies [caf14e3]
- Updated dependencies [f6d9fe4]
- Updated dependencies [e507985]
- Updated dependencies [2ed390b]
  - @stone-js/http-core@0.8.9
  - @stone-js/config@0.8.9
  - @stone-js/core@0.8.9

## 0.8.8

### Patch Changes

- @stone-js/core@0.8.8
- @stone-js/http-core@0.8.8

## 0.8.7

### Patch Changes

- @stone-js/core@0.8.7
- @stone-js/http-core@0.8.7

## 0.8.6

### Patch Changes

- @stone-js/core@0.8.6
- @stone-js/http-core@0.8.6

## 0.8.5

### Patch Changes

- @stone-js/core@0.8.5
- @stone-js/http-core@0.8.5

## 0.8.4

### Patch Changes

- @stone-js/core@0.8.4
- @stone-js/http-core@0.8.4

## 0.8.3

### Patch Changes

- @stone-js/core@0.8.3
- @stone-js/http-core@0.8.3

## 0.8.2

### Patch Changes

- Updated dependencies [d7f213c]
  - @stone-js/core@0.8.2
  - @stone-js/http-core@0.8.2

## 0.8.1

### Patch Changes

- Updated dependencies
  - @stone-js/core@0.8.1
  - @stone-js/http-core@0.8.1
