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

## Enabling it

Like every Stone.js module, it is enabled in one of two ways, and configured afterwards under
`stone.auth`. It registers the authentication provider and the kernel middleware that verifies every request.

```ts
import { Auth } from '@stone-js/auth'
import { StoneApp } from '@stone-js/core'

@Auth({ secret: getString('JWT_SECRET'), issuer: 'https://issuer.example', audience: 'my-api' })
@StoneApp({ name: 'my-app' })
export class Application {}
```

```ts
import { defineStoneApp } from '@stone-js/core'
import { authBlueprint } from '@stone-js/auth'

export const Application = defineStoneApp({ name: 'my-app' }, [authBlueprint])
```

Configure it from a `@Configuration` class or `defineConfig`:

```ts
export const AppConfig = defineConfig((blueprint) => blueprint.set('stone.auth', { /* ... */ }))
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

// Enabled with @Auth() (or authBlueprint) on the application; the signing strategy is
// configured from a @Configuration: blueprint.set('stone.auth.secret', getString('JWT_SECRET'))
```

### Mapping the token to your own user

The verified claims describe the token, not your application's principal. `resolveUser` turns one
into the other, and it may be **asynchronous**: resolving a principal usually hits a store, and
that first lookup is often where the account gets provisioned.

```ts
blueprint.set('stone.auth.resolveUser', async (claims) => {
  return await users.findOrCreateBySubject(claims.sub)
})
```

The resolved value is what `event.getUser()` returns for the rest of the request. A synchronous
resolver works exactly the same way; omit the option entirely and the raw claims are used.

## Documentation

Full documentation: **[stonejs.dev/docs/extensions/auth](https://stonejs.dev/docs/extensions/auth)**.

## License

[MIT](https://opensource.org/licenses/MIT) © Evens Pierre ("Mr. Stone") and the Stone.js contributors.
