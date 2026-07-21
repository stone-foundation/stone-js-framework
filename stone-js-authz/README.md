# Stone.js · Authorization

[![npm](https://img.shields.io/npm/v/@stone-js/authz)](https://www.npmjs.com/package/@stone-js/authz)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

> Framework-agnostic, isomorphic authorization for Stone.js built on CASL. RBAC + ABAC with the same rules on the backend and the frontend — define abilities once, guard routes and shape the UI.

Part of **[Stone.js](https://stonejs.dev)**, the reference implementation of the
[Continuum Architecture](https://evens-stone.github.io/continuum-manifesto/manifesto): write your
domain once, and the context (runtime, protocol, caller) applies to it at run time.

## Install

```bash
npm i @stone-js/authz
```

## Usage

```ts
import { authorize } from '@stone-js/authz'
import { EventHandler, Patch } from '@stone-js/router'

@EventHandler('/posts')
export class PostController {
  // CASL-backed guard: 403 unless the principal may 'update' this 'Post'.
  @Patch('/:id', { middleware: [authorize('update', 'Post')] })
  update (event) { /* ... */ }
}

// The same ability rules run on the backend and in the frontend (isomorphic).
```

## Documentation

Full documentation: **[stonejs.dev/docs/extensions/authorization](https://stonejs.dev/docs/extensions/authorization)**.

## License

[MIT](https://opensource.org/licenses/MIT) © Evens Pierre ("Mr. Stone") and the Stone.js contributors.
