# Stone.js · Auth

[![npm license](https://img.shields.io/npm/l/@stone-js/auth)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/auth)](https://www.npmjs.com/package/@stone-js/auth)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/auth)](https://www.npmjs.com/package/@stone-js/auth)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Release](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](https://github.com/stone-foundation/stone-js-framework/blob/main/SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-framework/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-framework/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-framework/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

> Framework-agnostic, edge-native authentication for Stone.js. Stateless JWT/OAuth (access, id, refresh) built on jose — sign and verify tokens on Node, browser, Deno, Bun and the edge, with remote JWKS and scopes.

Part of **[Stone.js](https://stonejs.dev)**, the reference implementation of the
[Continuum Architecture](https://evens-stone.github.io/continuum-manifesto/manifesto): write your
domain once, and the context (runtime, protocol, caller) applies to it at run time.

## Install

```bash
npm i @stone-js/auth
```

## Usage

```ts
import { requireAuth, requireScopes } from '@stone-js/auth'
import { EventHandler, Get, Post } from '@stone-js/router'

@EventHandler('/tasks')
export class TaskController {
  @Get('/', { middleware: [requireAuth()] })                   // 401 when anonymous
  list () { /* ... */ }

  @Post('/', { middleware: [requireScopes('tasks:write')] })   // 403 without the scope
  create (event) { /* ... */ }
}

// Enable + configure the signing strategy from a @Configuration:
//   blueprint.set(authBlueprint).set('stone.auth.secret', getString('JWT_SECRET'))
```

## Documentation

Full documentation: **[stonejs.dev/docs/extensions/auth](https://stonejs.dev/docs/extensions/auth)**.

## License

[MIT](https://opensource.org/licenses/MIT) © Evens Pierre ("Mr. Stone") and the Stone.js contributors.
