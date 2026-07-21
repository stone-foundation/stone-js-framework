# Stone.js · Resources

[![npm](https://img.shields.io/npm/v/@stone-js/resources)](https://www.npmjs.com/package/@stone-js/resources)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

> Framework-agnostic API resources for Stone.js. Shape what your domain exposes — sparse fieldsets, conditional fields, includes and envelopes — decoupled from controllers, the same on backend and frontend.

Part of **[Stone.js](https://stonejs.dev)**, the reference implementation of the
[Continuum Architecture](https://evens-stone.github.io/continuum-manifesto/manifesto): write your
domain once, and the context (runtime, protocol, caller) applies to it at run time.

## Install

```bash
npm i @stone-js/resources
```

## Usage

```ts
import { defineResource, only } from '@stone-js/resources'

// Shape what your domain exposes: hide internals, support sparse fieldsets.
export const TaskResource = defineResource((task) => ({
  id: task.id,
  title: task.title,
  createdAt: task.createdAt
}))

// only(...) / except(...) drive sparse fieldsets from the request.
```

## Documentation

Full documentation: **[stonejs.dev/docs/extensions/resources](https://stonejs.dev/docs/extensions/resources)**.

## License

[MIT](https://opensource.org/licenses/MIT) © Evens Pierre ("Mr. Stone") and the Stone.js contributors.
