# Changelog

## 0.8.16

### Patch Changes

- @stone-js/core@0.8.16
- @stone-js/config@0.8.16

## 0.8.15

### Patch Changes

- @stone-js/core@0.8.15
- @stone-js/config@0.8.15

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
  - @stone-js/config@0.8.14

## 0.8.13

### Patch Changes

- @stone-js/core@0.8.13
- @stone-js/config@0.8.13

## 0.8.12

### Patch Changes

- Updated dependencies [c971168]
  - @stone-js/core@0.8.12
  - @stone-js/config@0.8.12

## 0.8.11

### Patch Changes

- Updated dependencies [13cebd1]
  - @stone-js/core@0.8.11
  - @stone-js/config@0.8.11

## 0.8.10

### Patch Changes

- Updated dependencies [9f074f8]
  - @stone-js/core@0.8.10
  - @stone-js/config@0.8.10

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

- 0629318: Point every README link at somewhere that exists.

  The per-module repositories were retired when the framework moved to a single one, so 36 links
  across 18 READMEs answered with a 404: the exact links a newcomer clicks first, "Contributing"
  and "API". The contributing guide now points at the monorepo, and the API reference at the
  published one.

  `docs/` was never a durable target either, retired repository or not: it is TypeDoc output, and
  every build begins by deleting it.

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

All notable changes to the "Stone.js Node Cli Adapter" extension will be documented in this file.

## Unreleased

## [0.2.0](https://github.com/stone-foundation/stone-js-node-cli-adapter/compare/v0.1.0...v0.2.0) (2025-06-16)

### Features

- add browser-safe fallback entry with no-op modules for frontend compatibility ([#41](https://github.com/stone-foundation/stone-js-node-cli-adapter/issues/41)) ([6d3040e](https://github.com/stone-foundation/stone-js-node-cli-adapter/commit/6d3040e36f9971cd50e19a64354fdfc865d34536))

## [0.1.0](https://github.com/stone-foundation/stone-js-node-cli-adapter/compare/v0.0.21...v0.1.0) (2025-06-13)

### Features

- implement error handler and update lifecycle hooks ([4ca37b2](https://github.com/stone-foundation/stone-js-node-cli-adapter/commit/4ca37b2b0c5fee68c5c4db257f745b084b64de79))
- major internal restructuring and cleanup ([#39](https://github.com/stone-foundation/stone-js-node-cli-adapter/issues/39)) ([1828efe](https://github.com/stone-foundation/stone-js-node-cli-adapter/commit/1828efeb9754a95231051030a3437cc1a5b17700))

## [0.0.21](https://github.com/stone-foundation/stone-js-node-cli-adapter/compare/v0.0.2...v0.0.21) (2024-12-07)

### Miscellaneous Chores

- change the way commands are handled ([9cc05f0](https://github.com/stone-foundation/stone-js-node-cli-adapter/commit/9cc05f016f2877068f98d788dc5671f7a043d65c))

## 0.0.2 (2024-12-05)

### Features

- implement node cli adapter ([30743f7](https://github.com/stone-foundation/stone-js-node-cli-adapter/commit/30743f7aaaae46db17826e810be4549d56406b6f))
