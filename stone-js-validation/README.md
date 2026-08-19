# Stone.js · Validation

[![npm license](https://img.shields.io/npm/l/@stone-js/validation)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/validation)](https://www.npmjs.com/package/@stone-js/validation)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/validation)](https://www.npmjs.com/package/@stone-js/validation)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Release](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](https://github.com/stone-foundation/stone-js-framework/blob/main/SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-framework/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-framework/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-framework/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

> Framework-agnostic input validation for Stone.js. Define a schema once (Zod, Valibot, ArkType — anything Standard Schema) and validate it identically on the backend and the frontend.

Part of **[Stone.js](https://stonejs.dev)**, the reference implementation of the
[Continuum Architecture](https://evens-stone.github.io/continuum-manifesto/manifesto): write your
domain once, and the context (runtime, protocol, caller) applies to it at run time.

## Install

```bash
npm i @stone-js/validation
```

## Enabling it

Like every Stone.js module, it is enabled in one of two ways, and configured afterwards under
`stone.validation`. It registers the validation provider, so the validator is injectable and the route decorators resolve.

```ts
import { Validation } from '@stone-js/validation'
import { StoneApp } from '@stone-js/core'

@Validation()
@StoneApp({ name: 'my-app' })
export class Application {}
```

```ts
import { defineStoneApp } from '@stone-js/core'
import { validationBlueprint } from '@stone-js/validation'

export const Application = defineStoneApp({ name: 'my-app' }, [validationBlueprint])
```

Configure it from a `@Configuration` class or `defineConfig`:

```ts
export const AppConfig = defineConfig((blueprint) => blueprint.set('stone.validation', { /* ... */ }))
```

## Usage

```ts
import { z } from 'zod'
import { validate } from '@stone-js/validation'
import { EventHandler, Post } from '@stone-js/router'

export const NewTask = z.object({ title: z.string().min(1).max(120) })

@EventHandler('/tasks')
export class TaskController {
  // Rejects a malformed body with 422 before the handler runs. Same schema validates the form.
  @Post('/', { middleware: [validate({ body: NewTask })] })
  create (event) { return event.get('body') }
}
```

## Documentation

Full documentation: **[stonejs.dev/docs/extensions/validation](https://stonejs.dev/docs/extensions/validation)**.

## License

[MIT](https://opensource.org/licenses/MIT) © Evens Pierre ("Mr. Stone") and the Stone.js contributors.
