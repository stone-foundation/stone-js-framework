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

```ts
import { createTestApp, makeIncomingHttpEvent } from '@stone-js/testing'
import { Application } from '../app/Application'

const client = await createTestApp(Application)   // boots the REAL app in-memory, no port
const response = await client.send(makeIncomingHttpEvent({ method: 'GET', url: '/tasks' }))

expect(response.statusCode).toBe(200)             // goes through the full kernel
```

## Documentation

Full documentation: **[stonejs.dev/docs](https://stonejs.dev/docs)**.

## License

[MIT](https://opensource.org/licenses/MIT) © Evens Pierre ("Mr. Stone") and the Stone.js contributors.
