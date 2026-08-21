# @stone-js/telemetry

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
