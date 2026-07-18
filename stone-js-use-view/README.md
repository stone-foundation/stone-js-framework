# Stone.js - Use View

[![npm](https://img.shields.io/npm/l/@stone-js/use-view)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@stone-js/use-view)](https://www.npmjs.com/package/@stone-js/use-view)
[![npm](https://img.shields.io/npm/dm/@stone-js/use-view)](https://www.npmjs.com/package/@stone-js/use-view)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![Build Status](https://github.com/stone-foundation/stone-js-use-view/actions/workflows/main.yml/badge.svg)](https://github.com/stone-foundation/stone-js-use-view/actions/workflows/main.yml)
[![Publish Package to npmjs](https://github.com/stone-foundation/stone-js-use-view/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-use-view/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-use-view&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-use-view)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-use-view&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-use-view)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](./SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-use-view/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-use-view/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-use-view/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

The framework-agnostic view engine layer for Stone.js: page/head contracts, rendering modes, XSS-safe SSR snapshots, server data-fetching, and the `ViewEngine` interface shared by every view integration.

---

## Overview

**Stone.js Use View** is the shared foundation beneath every Stone.js view integration — [`@stone-js/use-react`](https://www.npmjs.com/package/@stone-js/use-react) today, `@stone-js/use-vue` and a React Native binding next. It contains **no React and no DOM code**: a concrete engine plugs in through the `ViewEngine` interface, while the universal rendering concerns (head/SEO, SSR/SSG/streaming, hydration snapshots, server data loading) live here, once, for all engines.

> Write your view logic once; the view engine applies it to any rendering mode.

## Why Stone.js Use View?

- **Engine-agnostic** — the same contracts describe a React element, a Vue vnode, or any node type.
- **Universal rendering** — one model for CSR, SSR, SSG and streaming SSR.
- **Secure by default** — SSR state snapshots are serialized XSS-safe; head attributes are escaped.
- **SEO-first** — a fluent head manager for title, Open Graph, Twitter cards, canonical, robots and JSON-LD.
- **No duplication** — engines implement a thin adapter; everything universal is shared.

## Key Features

- **Head/meta management** — `createHead()` / `defineHead()` fluent builder (title templates, OG, Twitter, JSON-LD, robots, canonical, hierarchical merge) and `serializeHead()` for SSR/SSG.
- **XSS-safe snapshots** — `serializeSnapshot()` / `renderSnapshotScript()` / `parseSnapshot()`.
- **Server data-fetching** — `defineServerLoader()` and a `ServerLoaderContext` (token/cookies aware) with graceful fallback to client rendering.
- **Rendering modes** — `RenderingMode` (`csr` | `ssr` | `ssg`) and a `ViewEngine` contract with `renderToString` and `renderToStream`.
- **Contracts** — `IView`, `ViewRenderContext`, `HeadContext`, `MetaView`, `Laziable`.

## Installation

```bash
npm install @stone-js/use-view
```

## Usage Example

```ts
import { createHead, serializeSnapshot } from '@stone-js/use-view'

const head = createHead()
  .title('Home')
  .titleTemplate('%s — Stone.js')
  .description('Universal rendering, done right.')
  .og({ type: 'website', image: 'https://stonejs.dev/og.png' })
  .jsonLd({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Stone.js' })
  .toContext()

const snapshot = serializeSnapshot({ user }) // XSS-safe, embed in <script type="application/json">
```

## Learn More

This package is part of the Stone.js ecosystem, a modern JavaScript framework built around the Continuum Architecture.

Explore the full documentation: [https://stonejs.dev](https://stonejs.dev)

## API documentation

- [API](https://github.com/stone-foundation/stone-js-use-view/blob/main/docs/modules.md)

## Contributing

See [Contributing Guide](https://github.com/stone-foundation/stone-js-use-view/blob/main/CONTRIBUTING.md).
