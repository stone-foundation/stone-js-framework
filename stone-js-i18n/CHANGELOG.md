# @stone-js/i18n

## 0.8.16

### Patch Changes

- 324b985: feat(router): read a route parameter from any layer, in one call

  A kernel or group middleware runs before routing, so reading a parameter took a three-line dance everywhere: find the route, bind it, read it. Even on the router layer, parameters are only bound after the route middleware have run. The router does the dance itself now:

  ```ts
  // A group middleware guarding /orgs/:orgCode, before any routing has happened:
  const orgCode = await router.findParam(event, "orgCode", "");

  // Or the bound route itself, for reading several things:
  const route = await router.getBoundRoute(event);
  ```

  Three properties make it safe to call from anywhere. It is a **peek, not a dispatch**: nothing is emitted, `currentRoute` is untouched, and the router's own resolution later proceeds as if nobody had looked. The match is **remembered per event**, so a guard reading `orgCode` and a locale middleware reading `lang` pay for one match, not two. And `findParam` answers the **fallback when no route matches**, because deciding that a request is a 404 is the router's job at dispatch, not the caller's at peek (`getBoundRoute` throws, since asking for a route that does not exist is a different question).

  Named in the `find*` family on purpose: `findParam` takes an event and may match, where the existing `getParam` reads the already-dispatched current route.

  `@stone-js/i18n` dogfoods it: the locale middleware asks the router the one question when the router offers it, and keeps the old dance for older routers.

  - @stone-js/cli@0.8.16
  - @stone-js/core@0.8.16
  - @stone-js/config@0.8.16

## 0.8.15

### Patch Changes

- 97226e1: feat: an injected i18n speaks the caller's language, and telemetry says which build is answering

  **The request locale reaches every reader.** `SetLocaleMiddleware` put a bound translator on the event and left the instance alone, so code that never sees the event translated in the configured locale whatever the caller asked for: a service written `constructor ({ i18n })`, the `i18next` binding, the helpers. The middleware now moves the request's own instance to the resolved locale as well.

  That is sound because Stone.js builds the kernel and its container per event, so the instance being moved belongs to one request. Verified on a real server: `fr`, then `en`, then `fr`, each answered in its own language with no crosstalk. The event still carries the bound clone, for code that prefers to depend on nothing ambient.

  One coupling was removed on the way: the resolution chain ended on the instance's current locale, which would have made one caller's language the next caller's default wherever an instance outlives a single event, a browser application above all. `I18nManager.configuredLocale` is now that last resort: the locale the application was configured with, which never moves.

  **`/version`, next to `/health`.** A probe is asked by a platform that cannot read and needs a verdict; this is asked by a person mid-investigation and the answer is a fact:

  ```
  curl https://api.example/version
  {"name":"my-api","env":"production","platform":"aws_lambda_http","release":"2026.08.21-3"}
  ```

  `platform` earns its place: one artefact can carry several adapters, each claiming the runtime it detects, so which one won is not knowable from the outside. The release is declared through the blueprint (`stone.telemetry.version.release`), never guessed from the environment. `path: false` serves nothing, and like the probe it stays out of the published contract.

  - @stone-js/core@0.8.15
  - @stone-js/config@0.8.15
  - @stone-js/cli@0.8.15

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
- Updated dependencies [311d395]
  - @stone-js/core@0.8.14
  - @stone-js/cli@0.8.14
  - @stone-js/config@0.8.14

## 0.8.13

### Patch Changes

- 8ead718: fix: a resource can type who is asking, and a translation module says when it has nothing

  **The type parameters on `ResourceContext` were unusable, and my advice about them was wrong.** Two TypeScript rules met: a property-typed function is contravariant on its parameters, so narrowing the context in a subclass was rejected (`TS2416`), and TypeScript separately refuses a method where the base declared a property, so writing `async data (model, context) {}` was rejected too (`TS2425`) even though that is the form every example uses. Method bivariance, which I pointed at, applies to methods and `data` was not one.

  So `Resource` and `IResource` now carry `EventType` and `PrincipalType` (`unknown` by default), and the two optional hooks are declared as methods on an interface merged with the class. A resource types who is asking:

  ```ts
  class AccountResource extends Resource<
    Account,
    ResourceOutput,
    IncomingHttpEvent,
    Actor
  > {
    async data(
      account: Account,
      context: ResourceContext<IncomingHttpEvent, Actor>
    ) {
      return { ...account, actorId: context.principal?.actorId }; // typed, no cast
    }
  }
  ```

  Both forms compile, with `strictFunctionTypes` and `exactOptionalPropertyTypes` on, and a type-level check runs with the tests so it stays that way.

  **A translation module with no catalogs now says so.** It never failed: `t('SOME_KEY')` answered `SOME_KEY`, which reads like a missing entry rather than a missing module, passed every in-process test, passed the build, and reached production in the user's language. The build reports what the scan found (`i18n: 2 catalog(s), 2 locale(s) (en, fr)`) or that it found none, and the runtime warns at boot when nothing was registered, naming the three things that cause it.

  - @stone-js/core@0.8.13
  - @stone-js/config@0.8.13
  - @stone-js/cli@0.8.13

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

- c971168: fix: authentication reads the header, and a contract describes the API

  Six defects reported from a pilot application, each reproduced before it was touched.

  - `@stone-js/auth` read the bearer token with `event.get('Authorization')`, and that accessor deliberately refuses to read headers, because it also reads the query string and the body. So the real header was ignored, every request stayed anonymous, and `?Authorization=` would have been read in its place. It reads `getHeader` now.
  - `@stone-js/openapi` documented every endpoint under `/`: a route's `path` is the pathname of the event it is answering, and no event is bound while generating a document. It reads the declared template, translates `:id` into `{id}`, declares the parameters the template requires, and publishes both paths for an optional segment.
  - A Zod 4 schema converted to `{}`, an empty JSON Schema meaning "anything", so every documented body and response was silently unconstrained. A schema that can describe itself is now asked to.
  - An explicit `contract:` block replaced everything derived, so documenting one `404` deleted the derived success response. It merges instead, per status, and a declared success status replaces the derived one rather than joining it.
  - The derived success status was always `200`, even for a handler answering `201`. The response decorators now record the status they build, so the document cannot contradict the code it came from.
  - `@stone-js/resources`: every `@ApiResource` the container resolved crashed on `checker`, an optional dependency read straight off the container, which resolves any name it is asked for and throws when nothing is bound.
  - `@stone-js/core`: `@Middleware` could only ever declare kernel middleware, so a middleware that reads the matched route could be registered from a blueprint but not from the decorator. `layer: 'app' | 'kernel' | 'router'` closes that, `global` keeps working.

  Packaging: `@stone-js/i18n`, `@stone-js/mcp-dev`, `@stone-js/openapi` and `@stone-js/use-react-native` published types referencing `@stone-js/cli` while declaring it as a dev dependency only. It is an optional peer now, so an application is never asked to resolve a package nobody told it about.

- Updated dependencies [03bf130]
- Updated dependencies [c971168]
- Updated dependencies [4c50bc6]
  - @stone-js/cli@0.8.12
  - @stone-js/core@0.8.12
  - @stone-js/config@0.8.12

## 0.8.11

### Patch Changes

- 13cebd1: fix: authentication reads the header, and a contract describes the API

  Six defects reported from a pilot application, each reproduced before it was touched.

  - `@stone-js/auth` read the bearer token with `event.get('Authorization')`, and that accessor deliberately refuses to read headers, because it also reads the query string and the body. So the real header was ignored, every request stayed anonymous, and `?Authorization=` would have been read in its place. It reads `getHeader` now.
  - `@stone-js/openapi` documented every endpoint under `/`: a route's `path` is the pathname of the event it is answering, and no event is bound while generating a document. It reads the declared template, translates `:id` into `{id}`, declares the parameters the template requires, and publishes both paths for an optional segment.
  - A Zod 4 schema converted to `{}`, an empty JSON Schema meaning "anything", so every documented body and response was silently unconstrained. A schema that can describe itself is now asked to.
  - An explicit `contract:` block replaced everything derived, so documenting one `404` deleted the derived success response. It merges instead, per status, and a declared success status replaces the derived one rather than joining it.
  - The derived success status was always `200`, even for a handler answering `201`. The response decorators now record the status they build, so the document cannot contradict the code it came from.
  - `@stone-js/resources`: every `@ApiResource` the container resolved crashed on `checker`, an optional dependency read straight off the container, which resolves any name it is asked for and throws when nothing is bound.
  - `@stone-js/core`: `@Middleware` could only ever declare kernel middleware, so a middleware that reads the matched route could be registered from a blueprint but not from the decorator. `layer: 'app' | 'kernel' | 'router'` closes that, `global` keeps working.

  Packaging: `@stone-js/i18n`, `@stone-js/mcp-dev`, `@stone-js/openapi` and `@stone-js/use-react-native` published types referencing `@stone-js/cli` while declaring it as a dev dependency only. It is an optional peer now, so an application is never asked to resolve a package nobody told it about.

- Updated dependencies [b2ff332]
- Updated dependencies [13cebd1]
- Updated dependencies [b568e53]
  - @stone-js/cli@0.8.11
  - @stone-js/core@0.8.11
  - @stone-js/config@0.8.11

## 0.8.10

### Patch Changes

- Updated dependencies [9f074f8]
  - @stone-js/core@0.8.10
  - @stone-js/config@0.8.10

## 0.8.9

### Patch Changes

- 5e01789: fix(i18n): the zero-config path actually works, and `@I18n()` enables it in one line

  Verified end to end on a real app (`@I18n()` + `app/i18n/<locale>/translation.json`, nothing else): the catalogs are discovered, the locale is resolved from the request, and translations render. Three defects stood between the module and that promise, each of which alone made every translation return its key, which reads exactly like a missing catalogue.

  - **The CLI plugin was never discovered.** Auto-discovery reads the default export of the bundle named by `stone.cliPlugin`, and `multi-entry` re-exports named exports only, so the plugin's `export default` silently vanished from `dist/cli.js`. The shared build gained a `multiEntry` opt-out, which the CLI-plugin build now uses.
  - **The generated module configured nothing.** It emitted `defineConfig(defineI18n({...}))`, but `defineI18n` returns an unwrapped `{ i18n }` fragment while `defineConfig` expects a function or an object carrying `configure`, so `configure` resolved to a no-op. It now emits a plain `stone`-wrapped blueprint, which the module scan applies directly. The README and docs page taught the same broken pattern and are corrected.
  - **Lazy catalogs broke the server build.** Lazy loaders are dynamic imports, and a server artefact is a single file, so Rollup failed with "when building multiple chunks, the output.dir option must be used". Server outputs now set `inlineDynamicImports`, which fixes any dynamic import in an app, not only i18n.

  **New `@I18n()` decorator**, matching every other module (`@Cache`, `@Realtime`, `@Queue`). The service class is renamed `I18nManager` to free the bare name, exactly as `CacheManager` and `RealtimeManager` do: update `I18n` to `I18nManager` where you import the service (the container aliases `i18n` / `I18n` are unchanged, so `constructor ({ i18n })` keeps working).

- 5e01789: feat(i18n): catalogues are found at any depth, and overlapping ones merge

  Discovery scanned `app/i18n` and nothing else, which forced every translation of
  an application into one flat directory. A catalogue is now **any directory named
  `i18n` under `app`**, found at any depth, so translations can live next to the
  code that owns them:

  ```
  app/i18n/fr/common.json                     shared across the app
  app/modules/billing/i18n/fr/invoice.json    owned by the billing module
  app/modules/crm/contacts/i18n/fr/contact.json
  ```

  Which makes overlapping catalogues the normal case, and revealed a silent data
  loss: `loadTranslations` did `resources[locale][namespace] = ...`, so a shared
  `fr/common.json` and a module's own `fr/common.json` left only the last one
  standing. Catalogues sharing a locale and a namespace now **deep-merge**, applied
  in sorted path order, so the deeper catalogue wins a conflicting key and the
  result is identical on every machine and every build. The lazy path already
  merged through i18next but applied its bundles inside `Promise.all`, letting
  import timing decide the winner; imports stay parallel, the merge is ordered.

  Four plugin options cover what the convention cannot express, none of them needed
  by a conventional project:

  | Option    | Default  | What it does                                                       |
  | --------- | -------- | ------------------------------------------------------------------ |
  | `root`    | `'app'`  | The directory walked for catalogues                                |
  | `dirname` | `'i18n'` | The directory name that marks a catalogue, for example `'locales'` |
  | `dir`     | --       | Scan exactly this one directory, no walk                           |
  | `pattern` | --       | Take the files from a glob, when nothing above fits                |

  ```ts
  i18nCliPlugin({ root: "src", dirname: "locales" });
  i18nCliPlugin({ pattern: "packages/*/translations/*/*.json" });
  ```

  `node_modules` and dotted directories are excluded from the walk and from
  `pattern`, because a dependency's translations are not your application's.

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

- 0fdf8c8: New module: `@stone-js/i18n` — framework-agnostic, cloud-native internationalization for Stone.js,
  powered by i18next with native `Intl` formatting. Zero-config: drop translations in
  `app/i18n/<locale>/<namespace>.json` and they load automatically. The request locale is resolved
  per request (custom `x-locale`/`x-lang`/`x-language` headers → query → cookie → standard
  `Accept-Language` negotiation), and a concurrency-safe, request-bound translator is exposed on the
  event. Isomorphic: the same service (translation, ICU pluralization, number/date/relative/list
  formatting) runs on the backend and the frontend.
  - @stone-js/core@0.8.6
