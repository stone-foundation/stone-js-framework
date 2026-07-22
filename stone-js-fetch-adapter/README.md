# Stone.js · Fetch adapter

[![npm license](https://img.shields.io/npm/l/@stone-js/fetch-adapter)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/fetch-adapter)](https://www.npmjs.com/package/@stone-js/fetch-adapter)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/fetch-adapter)](https://www.npmjs.com/package/@stone-js/fetch-adapter)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Release](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](https://github.com/stone-foundation/stone-js-framework/blob/main/SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-framework/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-framework/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-framework/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

> Web-standard (WinterCG Fetch) adapter for Stone.js. One adapter, every edge/serverless runtime: Cloudflare Workers, Deno, Bun, Vercel Edge, Netlify Edge — build once, deploy anywhere.

Part of **[Stone.js](https://stonejs.dev)**, the reference implementation of the
[Continuum Architecture](https://evens-stone.github.io/continuum-manifesto/manifesto): write your
domain once, and the context (runtime, protocol, caller) applies to it at run time.

## Install

```bash
npm i @stone-js/fetch-adapter
```

## Usage

```ts
import { Fetch } from '@stone-js/fetch-adapter'
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'

// Web-standard (WinterCG Fetch): the same app runs on any edge/serverless runtime.
@Fetch({ default: true })
@Routing()
@StoneApp({ name: 'my-app' })
export class Application {}
```

## Documentation

Full documentation: **[stonejs.dev/docs/adapters/fetch](https://stonejs.dev/docs/adapters/fetch)**.

## License

[MIT](https://opensource.org/licenses/MIT) © Evens Pierre ("Mr. Stone") and the Stone.js contributors.
