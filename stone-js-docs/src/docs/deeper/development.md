---
title: Package development
---

Stone.js is a micro-framework by design, lightweight, composable, and cloud-native. Its true power, however, unfolds through packages. Packages allow you to extend, specialize, or modularize Stone.js capabilities across projects, teams, or entire ecosystems.

In Stone.js, a **package** is simply a module that exposes a set of features through the Continuum Architecture. These features can include services, utilities, decorators, middleware, commands, event handlers, or even entire integrations with third-party tools or platforms.

There are **two kinds of packages** you can build:

* **Standalone Packages**
  These are universal libraries, not bound to Stone.js. They provide general-purpose utilities or logic and can be used in any JavaScript or TypeScript environment. You can still make them Stone-compatible by exposing a blueprint wrapper, more on that later.

* **Stone.js-specific Packages**
  These are deeply integrated into the Stone ecosystem. They speak the language of blueprints, adapters, providers, and the Continuum. Examples include the official `@stone-js/router` or `@stone-js/use-react`.

This documentation will guide you through building both types, from creating a reusable, framework-agnostic module, to turning it into a fully integrated, declarative-first Stone.js package.

Whether you're crafting new utilities, wrapping external services, or formalizing your team’s internal logic into reusable features, you're in the right place.

**By the end of this guide, you'll know how to:**

* Structure and build modern ESM packages.
* Support both JavaScript and TypeScript consumers.
* Create blueprints and service providers.
* Expose your logic using both imperative and declarative APIs.
* Integrate with the Continuum's Setup and Initialization dimensions.
* Package, test, document, and publish your work like a pro.

Welcome to the power of modular, continuum-native package development.

## Authoring a Package

Stone.js encourages you to think modular. Each package is its own universe, encapsulating functionality in a clean, reusable, and portable way, whether it’s a CLI utility, a middleware suite, or a full-blown service layer.

Here’s how to build that universe properly.

### Language and Format

Stone.js is built for the modern JavaScript ecosystem. That means:

* **Pure ESM only**
  All packages must be shipped as [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules). No CommonJS, no `require()`, no `module.exports`. This ensures compatibility across browsers, runtimes, and serverless environments.

* **TypeScript or JavaScript? Both.**
  You’re free to use either language to write your package, but **you must expose typings**. Stone.js is strongly typed under the hood, and consumers of your package (especially TypeScript users) rely on your types to benefit from autocomplete, validation, and context awareness.

If you write in JavaScript, use [JSDoc](https://jsdoc.app/) to generate typings. If you write in TypeScript, just emit the `.d.ts` files during build.

Example using JSDoc in JS:

```js
/**
 * @param {number} x
 * @param {number} y
 * @returns {number}
 */
export function add(x, y) {
  return x + y
}
```

### Build and Transpile

Even if you develop in TypeScript, your package must be **transpiled to ESM JavaScript** before publishing.

Key principles:

* Don’t minify. Stone.js handles optimization and minification during deployment.
* Externalize dependencies. Don’t bundle them, let the application resolve them.
* Transpile to ESM. Use `tsc`, `rollup`, `esbuild`, or your tool of choice.
* Optionally bundle your code (e.g. into `dist/index.js`) for convenience, but it’s not required.

Stone.js core packages use [Rollup](https://rollupjs.org/) for bundling and tree-shaking. You’re free to use the same setup for consistency and performance.

### Exporting Modules

Stone.js expects your `package.json` to declare exports cleanly.

Use the modern [Node.js exports field](https://nodejs.org/api/packages.html#exports), not `main`.

```json
{
  "type": "module",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  }
}
```

This makes your package compatible with both JavaScript and TypeScript, and ensures Stone.js can resolve your modules precisely.

### Directory Structure (Recommended)

Stone.js doesn’t force a strict folder structure, but if you want to keep things clean and predictable (which you should), here’s a recommended layout:

```
my-package/
├── src/
│   ├── commands/
│   ├── decorators/
│   ├── middleware/
│   ├── errors/
│   ├── options/
│   ├── events/
│   ├── declarations.ts
│   ├── blueprintUtils.ts
```

What goes where:

* `commands/`: CLI handlers
* `decorators/`: Your custom decorators (for declarative API)
* `middleware/`: Integration or HTTP middleware
* `errors/`: Custom error classes
* `options/`: Configuration types or options interfaces
* `events/`: Custom event types
* `declarations.ts`: All exposed types
* `blueprintUtils.ts`: Utility functions to help with blueprint creation

This structure isn't mandatory, but it’s battle-tested and scales well.

## API Paradigms for Consumers

Stone.js supports both **imperative** and **declarative** programming styles, and your package should too.

Internally, you’re free to build your logic however you want (hint: imperative is required). But when exposing your API to developers, **you must support both paradigms** so users can choose what fits their flow.

::: tabs#declarative-imperative
@tab:active Imperative
### Imperative Usage

This is the *foundational* way Stone.js packages are consumed.

You **must expose a blueprint**, a static object that tells Stone.js what your package provides and how to configure it. Think of it as the package's contract with the framework.

Example:

```ts
export const myLibBlueprint = {
  stone: {
    providers: [
      { module: MyLibProvider, isClass: true }
    ]
  },
  myLib: {
    maxServices: 1
  }
}
```

Then users can activate it like this:

```ts
import { myLibBlueprint } from 'my-lib'

blueprint.set(myLibBlueprint)
```

You can also expose helper functions like `defineMyFeature()` to allow more granular control if needed.

@tab Declarative
### Declarative Usage

This is the sugar on top, a clean and elegant way for developers to enable your package through decorators.

Stone.js uses the Stage 3 [decorators proposal](https://github.com/tc39/proposal-decorators), but also provides utility wrappers to maintain compatibility with existing decorator syntax.

To expose declarative usage:

1. Create a class decorator using `classDecoratorLegacyWrapper`.
2. Inside it, inject your blueprint using `addBlueprint(...)`.

Example:

```ts
import { myLibBlueprint } from './myLibBlueprint'
import { ClassType, classDecoratorLegacyWrapper, addBlueprint } from '@stone-js/core'

export const MyLib = <T extends ClassType = ClassType>(options = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context): undefined => {
    addBlueprint(target, context, myLibBlueprint, { myLib: options } as any)
  })
}
```

Then the user activates it like this:

```ts
import { MyLib } from 'my-lib'
import { StoneApp } from '@stone-js/core'

@StoneApp()
@MyLib({ maxServices: 2 })
export class Application {}
```

This approach makes it easy for users to plug in your package with minimal friction, no manual blueprint juggling required.
:::

::: important
Even in declarative mode, you're still injecting a blueprint under the hood. It's just hidden behind a nice decorator wrapper.
:::

Declarative for elegance, imperative for control, your package should offer both.

## Blueprint & Service Integration

Stone.js uses the **blueprint** as the universal setup interface. It’s how your package introduces itself to the framework, and how users configure it in a predictable, declarative or imperative way.

This section covers all the integration points your package may expose: setup (blueprint), integration (adapters), and initialization (providers).

### Static Blueprint

The **blueprint** is a plain object that describes:

* What your package provides (services, middlewares, options, etc.)
* How it should be configured
* Where it fits within Stone.js (under `stone` namespace or a custom one)

Example:

```ts
export const myLibBlueprint = {
  stone: {
    providers: [
      { module: MyLibProvider, isClass: true }
    ]
  },
  myLib: {
    maxServices: 1
  }
}
```

You can define custom namespaces (`myLib`) for package-specific options, or use the `stone` namespace for framework-native components (services, middleware, etc).

This blueprint is what users will pass into `blueprint.set(...)` or inject via decorators.

::: important
A package without a blueprint is invisible to Stone.js. No blueprint, no setup, no activation.
:::

You can refer to the [blueprint documentation](../architecture/blueprint) for more details on how to structure your blueprint.

### Decorator Wrapper (for Declarative Setup)

As seen earlier, your blueprint decorator is just a convenient way to inject this blueprint into the system.

Recap:

```ts
@StoneApp()
@MyLib({ maxServices: 1 })
export class App {}
```

Behind the scenes:

* Your decorator wraps the blueprint.
* Stone.js merges the options.
* The setup dimension activates your package.

Use this to reduce friction and make your package feel **first-class** to declarative developers.

### Service Providers

Service providers are how your package injects functionality into the **Service Container**, which is part of the Continuum’s **Initialization dimension**.

You must:

1. Create a provider class that registers services into the container.
2. Reference that provider in your blueprint under `stone.providers`.

Example provider:

```ts
export class MyLibProvider {
  constructor(private readonly container: IContainer) {}

  register() {
    this
      .container
      .singleton(MyLibService, () => new MyLibService())
      .alias(MyLibService, 'myLibService')
  }
}
```

Blueprint registration:

```ts
export const myLibBlueprint = {
  stone: {
    providers: [
      { module: MyLibProvider, isClass: true }
    ]
  }
}
```

::: important
Stone.js only supports **imperative** service registration for third-party library, this is by design.
:::

### Blueprint Middleware (Dynamic Logic)

Some things can’t be defined statically, like conditionally injecting middleware based on the active adapter or runtime context.

In these cases, you can provide a **blueprint middleware**.

Blueprint middleware runs after the blueprint is loaded but before the application starts, giving you access to dynamic state (like the current adapter, runtime environment, etc).

Example registration:

```ts
export const myLibBlueprint = {
  stone: {
    providers: [
      { module: MyLibProvider, isClass: true }
    ],
    blueprint: {
      middleware: [
        { module: myLibBlueprintMiddleware }
      ]
    }
  }
}
```

Inside your middleware function:

```ts
const myLibBlueprintMiddleware = async (
  context: BlueprintContext,
  next: NextMiddleware
): Promise<IBlueprint> => {
  const blueprint = await next(context)

  if (blueprint.get('stone.adapter.platform') === 'browser') {
    blueprint.add(
      'stone.adapter.middleware',
      [{ module: MyLibMiddleware, isClass: true }]
    )
  }

  return blueprint
}
```

This gives your package **runtime-aware behavior**, without compromising the static configuration model of Stone.js.

Your package should support static blueprint registration first, and use middleware only when necessary, keep your design predictable, flexible, and easy to inspect.

## Testing

In Stone.js, testing isn’t an afterthought, it’s part of the package’s DNA.

A well-tested package is:

* Easier to trust
* Easier to change
* Easier to adopt

While Stone.js doesn’t enforce a specific coverage percentage, **core packages aim for 100% test coverage**, and you should aim high too, especially on public APIs, side-effect logic, and blueprint integration. While 100% doesn't guarantee quality, it's a good goal to aim for.

### Recommended Stack

Stone.js uses [Vitest](https://vitest.dev/) internally, and so should you, unless you have a strong reason not to. It’s:

* Fast
* TypeScript-native
* Jest-compatible in syntax
* Easily integratable with Vite or standalone

### What to Test

Here’s a quick checklist for a healthy test suite:

| Area                       | What to Cover                                    |
| -------------------------- | ------------------------------------------------ |
| Blueprint                  | Are the right components declared?               |
| Decorators                 | Do they inject blueprints correctly?             |
| Service providers          | Do services register in the container?           |
| Public functions/utilities | Do they return expected results?                 |
| Edge cases                 | Does your package behave correctly when misused? |

Example (using Vitest):

```ts
import { describe, it, expect } from 'vitest'
import { myLibBlueprint } from '../src/myLibBlueprint'

describe('myLibBlueprint', () => {
  it('should define a valid provider', () => {
    expect(myLibBlueprint.stone?.providers?.[0]?.module).toBeDefined()
  })
})
```

You don’t have to test *everything*, but you do have to test *what matters*.

### Directory Structure

Create a `test/` directory at the root of your package:

```
my-package/
├── src/
├── test/
│   ├── blueprint.test.ts
│   ├── service.test.ts
│   └── utils.test.ts
```

Your test files can be suffixed with `.test.ts` or `.spec.ts`, and you can organize them by feature, type, or whatever suits your package.

Stone.js believes in confidence through coverage, when your tests pass, your blueprint becomes bulletproof.

## Documentation

Documentation is your package’s handshake with the outside world.
It’s how users know what it does, how to use it, and why they should care.

In the Stone.js ecosystem, a good package isn’t just one that works, it’s one that’s **well-documented, well-typed, and easy to onboard**.

### What to Document

| Area                  | What to Include                                                             |
| --------------------- | --------------------------------------------------------------------------- |
| Public API            | Every function, class, decorator, or config option exposed by your package. |
| Blueprint structure   | Show how to use `blueprint.set(...)` with your package.                     |
| Decorator usage       | If you offer a decorator, show how to use it in a `@StoneApp()` class.      |
| Service registration  | Document any services added to the container.                               |
| Configuration options | Detail all available options and their effects.                             |

### In-Code Documentation

All public API should be documented inline.

* **JavaScript** users: use [JSDoc](https://jsdoc.app)
* **TypeScript** users: use doc comments and generate `.d.ts` files

Example with JSDoc:

```ts
/**
 * Initializes the cache with optional TTL.
 * @param {Object} options
 * @param {number} options.ttl - Time to live in seconds.
 */
export function initCache(options = {}) { ... }
```

### Project-Level Files

These must be present in every serious package:

| File              | Purpose                                               |
| ----------------- | ----------------------------------------------------- |
| `README.md`       | Your front-facing doc: installation, usage, examples. |
| `CHANGELOG.md`    | Track changes, additions, and breaking changes.       |
| `LICENSE`         | Define legal usage and distribution terms.            |
| `CONTRIBUTING.md` | (Optional) Explain how others can contribute.         |

### Folder Layout for Extended Docs

If your package has a lot to explain (e.g. multiple decorators, services, or runtime options), use a `docs/` folder:

```
my-package/
├── docs/
│   ├── index.md        ← overview or advanced guide
│   ├── api/
│   │   ├── decorators.md
│   │   ├── blueprint.md
│   │   └── config.md
```

You can generate the API docs using:

* [TypeDoc](https://typedoc.org/) for TypeScript
* [JSDoc](https://jsdoc.app/) + static site for JavaScript

### Bonus: Examples

Always include 1–2 **realistic usage examples** in your `README.md`.
Even if your package is simple, showing how it integrates into a `@StoneApp()` setup or with a `blueprint.set(...)` call helps developers understand the context immediately.

Documented code is maintained code.
A well-documented package saves time for everyone, including you.

## Publishing

Once your package is built, tested, and documented, it’s time to get it out into the world.

Publishing a Stone.js-compatible package follows the same principles as any modern JavaScript package, with a few additional best practices to keep things ecosystem-friendly.

### Versioning

Use [Semantic Versioning (semver)](https://semver.org/):

```
MAJOR.MINOR.PATCH
```

* `MAJOR`: breaking changes
* `MINOR`: new features, backwards compatible
* `PATCH`: bug fixes, backwards compatible

Stick to it. Automate it if possible. Respect your users’ time.

### NPM Publishing

If your package is public:

1. Make sure you're logged in:

   ```bash
   npm login
   ```

2. Set the access level (only on first publish):

   ```bash
   npm publish --access public
   ```

3. Publish!

   ```bash
   npm publish
   ```

If you're using `pnpm` or `yarn`, their publish commands work the same way.

### GitHub / GitLab Registry

If you’re publishing a private or internal package, consider using a scoped registry like GitHub Packages:

* Set your package name to `@org/package-name`
* Configure `.npmrc` to authenticate with GitHub Token
* Run `npm publish` as usual

### Peer Dependencies

If your package depends on Stone.js core modules like `@stone-js/core`, or `@stone-js/http-core`, list them as **peer dependencies**:

```json
"peerDependencies": {
  "@stone-js/core": "^1.0.0",
  "@stone-js/http-core": "^1.0.0"
}
```

Don’t install them directly, let the consumer’s app control the version.
Also avoid hard dependencies on things like `react`, `vue`, or `aws-sdk` unless absolutely necessary.

### Distribution Files

Keep it clean:

* Don’t publish your `src/` folder unless it’s needed.
* Only include `dist/`, `types/`, `docs/`, and your core config files.
* Add a `.npmignore` or use `files` in `package.json`.

Example:

```json
"files": [
  "dist/",
  "docs/",
  "README.md",
  "LICENSE"
]
```

### Package Naming

For official or community packages, use a clear and scoped naming convention:

* Official: `@stone-js/<name>`
* Community: `stone-<name>` or `@your-org/stone-<name>`

This makes it clear what your package does and how it fits in.

Publishing is your package’s debut, don’t let it show up to the party in sweatpants.

## Standalone vs Framework-specific Packages

Not all packages need to be tied to Stone.js, but any package can be **Stone-compatible** if you design it right.

This section helps you decide *what kind of package you're building*, and how to support both styles if needed.

### Standalone Packages

Standalone packages are:

* Framework-agnostic
* Usable in Node.js, browser, serverless, or other environments
* Do **not** assume the presence of Stone.js

Examples:

* A utility library (`date-utils`, `http-client`, `cache-layer`)
* A wrapper around a third-party SDK (Stripe, S3, etc.)
* A CLI tool

These packages **do not** depend on `@stone-js/core`, and can be published and used like any regular JavaScript package.

However… if you want them to work smoothly inside a Stone.js application, you can add **Stone.js compatibility** without losing their standalone nature.

### Making Standalone Packages Stone-Compatible

To adapt a universal package to Stone.js:

1. **Create a blueprint wrapper**
   You can define a simple blueprint file that registers your module into the Stone.js context:

   ```ts
   import { MyService } from './core/MyService'

   export const myStandaloneBlueprint = {
     stone: {
       services: [
         { module: MyService, isFactory: true, alias: 'myService' }
       ]
     }
   }
   ```

2. **Expose a decorator (optional)**
   If you want to support declarative activation:

   ```ts
   export const MyStandalone = () => {
    return classDecoratorLegacyWrapper((target, context) => {
       addBlueprint(target, context, myStandaloneBlueprint)
     })
   }
   ```

3. **Avoid hard dependencies** on `@stone-js/core`. Use optional peer dependencies instead if needed.

This pattern keeps your package universal but allows it to “snap into” the Stone.js ecosystem when needed.

### Stone.js-specific Packages

These are packages built specifically for, and only for, Stone.js.

They rely on:

* The blueprint system
* Lifecycle hooks
* Service container
* Event handlers
* Decorators
* Adapter awareness
* And other continuum concepts

Examples:

* `@stone-js/http-core`
* `@stone-js/use-react`
* `@stone-js/aws-lambda-adapter`

These packages **should not** be used outside Stone.js apps, and that’s fine.

They are deeply tied to the framework’s philosophy and internal mechanics, and their purpose is to **extend Stone.js itself**.

If your package registers middleware, providers, lifecycle hooks, or uses the adapter context, it’s Stone-specific.

### Choose What Fits

| Package Type         | Use When...                                                 |
| -------------------- | ----------------------------------------------------------- |
| Standalone           | Logic is reusable in any JS project.                        |
| Stone-specific       | You want tight integration into the Continuum architecture. |
| Hybrid (Recommended) | You want reusability **and** Stone-native integration.      |

You don’t have to choose sides.
You can write portable logic, then expose it with a Stone.js wrapper, just like the `@stone-js/router` package does. 😉

Best of both worlds. 😎

## Best Practices

Whether you’re building a one-off internal package or a reusable library for the entire ecosystem, following best practices ensures that your work is readable, reliable, and respected.

These guidelines apply across the board, to structure, naming, design, and API exposure.

#### Expose Both Paradigms

* Always offer **imperative usage** via a `blueprint`.
* Support **declarative usage** via a decorator when it makes sense.
* Even if your package is simple, offering both improves developer experience.

#### Use Named Exports Only

Stone.js does not support default exports, **anywhere**.

Good:

```ts
export const myLibBlueprint = { ... }
export class MyService { ... }
```

Bad:

```ts
export default { ... } // ❌
```

#### Prefix Your Namespace

If your blueprint adds a custom namespace, use a clear and collision-free key:

```ts
export const myLibBlueprint = {
  myLib: {
    enabled: true,
    retries: 3
  }
}
```

Avoid dumping things into `stone` unless you're contributing to core areas like `services`, `commands`, `adapters`, etc.

#### Keep Dependencies Light

Your package should not pull in heavy dependencies unless absolutely necessary.

* Avoid bloated libraries
* Use peer dependencies for things the user app should own (e.g. `@stone-js/core`, `react`, etc.)
* Don’t hard-couple your logic to external systems if you can avoid it

#### Type Everything

* Public API must be typed
* Prefer TypeScript, or use JSDoc + `.d.ts` for JavaScript
* Export your types explicitly (`types`, `declarations.ts`)

#### Don't Register Anything by Side Effect

Do not auto-register services, middlewares, or logic when your package is imported.

Force users to activate your package via:

* `blueprint.set(...)`
* `@MyLib()` decorator

This ensures predictability and avoids surprise bugs or resource conflicts.

#### Use `undefined`, Never `null`

Stone.js follows a **strict design convention**:
**Missing values are always represented as `undefined`, never `null`.**

You’ll see this consistently in APIs like:

* `blueprint.get(...)`
* `container.make(...)`
* Middleware and lifecycle responses

To stay aligned with the platform’s behavior:

* Do **not** return or assign `null` in your package’s public API
* Use `undefined` to represent absence
* Favor `??` over `||` to provide defaults

```ts
const value = blueprint.get('foo') ?? 'default'
```

Following this pattern ensures your package feels native to Stone.js and avoids ambiguous edge cases.

#### Your Package Should Be Bundleable

Stone.js applications are built as **self-contained artifacts**, they do not rely on `node_modules` at runtime.
To support this architecture, your package must be **easily bundleable** with tools like Rollup or esbuild.

* Avoid dynamic `require()`
* Use ESM imports only
* Keep dependencies minimal and explicit

This ensures your package can be included directly in the final application artifact, making it lightweight and deployment-friendly.

#### Treat Your Package Like a Product

* Add a `README.md` with clear usage instructions.
* Use a `CHANGELOG.md` to track updates.
* Document options, decorators, services, and gotchas.
* Add tests, even a few is better than none.
* Respect semver. Break things on purpose, not by accident.

#### Avoid “Magic”

Keep your logic introspectable and traceable.

Avoid things like:

* Auto-imports
* Runtime dependency injection without clear registration
* Hidden side effects

Stone.js is designed to be **explicit**, not magical.

#### Reuse Core Patterns

When in doubt, look at existing Stone.js packages.
Patterns are consistent for a reason, decorators, blueprint structure, service providers, etc. are all repeatable.

Stay aligned with those patterns and your package will *just work*.

Stone.js is built on clarity, predictability, and composability, your package should reflect the same values.

## Examples & Boilerplate

The fastest way to learn is to build, but the second fastest is to clone.

Here are two types of examples you can follow to kickstart your own package development:

### Minimal Package Template

If you're starting from scratch, here's the bare minimum you need:

```
my-stone-package/
├── src/
│   ├── MyService.ts
│   └── myStoneBlueprint.ts
├── test/
│   ├── MyService.test.ts
│   └── myStoneBlueprint.test.ts
├── README.md
├── package.json
├── tsconfig.json
```

With a simple `myStoneBlueprint.ts` file like:

```ts
export const myStoneBlueprint = {
  stone: {
    services: [
      { module: MyService, isFactory: true, alias: 'myService' }
    ]
  }
}
```

Consumers can activate it via:

```ts
import { myStoneBlueprint } from 'my-stone-package'

blueprint.set(myStoneBlueprint)
```

Or you can go declarative:

```ts
@StoneApp()
@MyPackage()
export class App {}
```

### Axios Integration Example (Real-World)

Here’s how to wrap `axios` as a service in a Stone.js package.

```ts
import axios, { AxiosInstance } from 'axios'
import { IBlueprint, IContainer, IServiceProvider } from '@stone-js/core'

export class AxiosServiceProvider implements IServiceProvider {
  constructor(private readonly container: IContainer) {}

  register(): void {
    this.container.instanceIf('axios', this.createAxios())
  }

  private createAxios(): AxiosInstance {
    const blueprint = this.container.make<IBlueprint>('blueprint')
    const baseURL = blueprint.get<string>('app.api.baseURL', 'http://localhost:8080')
    return axios.create({ baseURL })
  }
}
```

Then your blueprint:

```ts
export const axiosBlueprint = {
  stone: {
    providers: [
      { module: AxiosServiceProvider, isClass: true }
    ]
  }
}
```

And usage in the app:

```ts
import { axiosBlueprint } from '@your-org/stone-axios'

blueprint.set(axiosBlueprint)
```

Use Axios in the app services:

```ts
import { AxiosInstance } from 'axios'
import { IContainer, defineService } from '@stone-js/core'

export const MyService = (container: IContainer) => {
  const axios = container.make<AxiosInstance>('axios')

  return {
    fetchData: async (url: string) => {
      const response = await axios.get(url)
      return response.data
    }
  }
}

export const MyServiceBlueprint = defineService(
  MyService,
  true,
  { alias: 'myService' }
)
```

That’s it, you now have an `axios` instance injected into the Stone.js service container, fully configurable via `blueprint.set('app.api.baseURL', ...)`.

This structure can be reused for any third-party SDK or integration. It’s clean, clear, and continuum-aligned.

### Bonus: Template Repo

If you want to get going fast, you can fork this starter (create this in your GitHub org or community):

```
stone-js/stone-package-template
```

Features:

* Rollup + TypeScript
* Vitest setup
* Blueprint + decorator
* Typed services
* README + LICENSE + CHANGELOG
* Basic usage examples

Use it as your official starting point for internal and community packages.

## Summary

Let’s recap what makes a proper Stone.js package:

* **ESM-only**: your package must be modern and portable.
* **Typed**: always expose typings, even if you write in JS.
* **Blueprint-powered**: everything flows through blueprints, they are the universal interface.
* **Declarative + Imperative**: give users the power to choose.
* **Minimal and modular**: register only what’s needed, expose only what matters.
* **Tested and documented**: it’s not done until it’s trusted.

Stone.js is built for clarity, composability, and cloud-native architecture, and your packages should be too.

Welcome to the ecosystem. Build wisely.

