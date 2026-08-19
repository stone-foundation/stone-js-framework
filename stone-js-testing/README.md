# Stone.js · Testing

[![npm license](https://img.shields.io/npm/l/@stone-js/testing)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/testing)](https://www.npmjs.com/package/@stone-js/testing)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/testing)](https://www.npmjs.com/package/@stone-js/testing)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Release](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](https://github.com/stone-foundation/stone-js-framework/blob/main/SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-framework/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-framework/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-framework/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

> Testing utilities for Stone.js. Boot a real app in-memory and dispatch synthetic events through the full kernel — no server, no adapter — plus event/response factories. Works with any test runner.

Part of **[Stone.js](https://stonejs.dev)**, the reference implementation of the
[Continuum Architecture](https://evens-stone.github.io/continuum-manifesto/manifesto): write your
domain once, and the context (runtime, protocol, caller) applies to it at run time.

## Install

```bash
npm i @stone-js/testing
```

## Usage

Nothing to list: your application is discovered from `app/**`, the same files the CLI builds.

```ts
import { createTestApp, makeIncomingHttpEvent } from '@stone-js/testing'

const app = await createTestApp()                 // boots the REAL app in-memory, no port
const response = await app.send(makeIncomingHttpEvent({ method: 'GET', url: '/tasks' }))

expect(response.statusCode).toBe(200)             // goes through the full kernel
expect(response.json()).toEqual([{ id: 1 }])      // `content` is the wire payload; this reads it
```

A frontend app answers with a page, read the same way:

```ts
expect(response.html()).toContain('<h1>Tasks</h1>')
```

There is no assertion library here on purpose: query that HTML with whatever you already use
(`happy-dom`, `jsdom`, Testing Library).

### Substituting a dependency

```ts
const app = await createTestApp({ bindings: { clock: { now: () => '2026-01-01T00:00:00.000Z' } } })
```

Bound after your own registrations, in the container the kernel builds for each event, so the code
under test resolves the fake exactly as it resolves the real one.

### Options

| Option | Default | What it does |
|---|---|---|
| `modules` | discovered | Boot exactly these, for a test that runs a slice of the app |
| `appDir` / `pattern` | `app` | Where to discover from, for a non-standard layout |
| `envFile` | `.env.test` | Loaded before booting; `false` loads none. A missing file is not an error |
| `bindings` | — | Container substitutions, by alias |
| `blueprint` | — | A base blueprint to merge in |

### Running through the CLI

`stone test` runs your suite with Vitest, configured from `stone.config.mjs` like everything else,
and does two things a bare runner cannot: it loads `.env.test` **before** the runner starts, so a
value read at module load sees it, and it hands the test process the same file set the build uses, so
`createTestApp()` cannot boot a different application than the one that ships.

```js
// stone.config.mjs
export default defineConfig({
  test: {
    envFile: '.env.test',
    vitest: { environment: 'happy-dom' }   // for component tests
  }
})
```

## Documentation

Full documentation: **[stonejs.dev/docs](https://stonejs.dev/docs)**.

## License

[MIT](https://opensource.org/licenses/MIT) © Evens Pierre ("Mr. Stone") and the Stone.js contributors.
