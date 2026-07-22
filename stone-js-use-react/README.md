# Stone.js - Use React

[![npm license](https://img.shields.io/npm/l/@stone-js/use-react)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/use-react)](https://www.npmjs.com/package/@stone-js/use-react)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/use-react)](https://www.npmjs.com/package/@stone-js/use-react)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Release](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](https://github.com/stone-foundation/stone-js-framework/blob/main/SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-framework/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-framework/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-framework/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

React integration for Stone.js, universal rendering, SSR hydration, layouts, pages, snapshots, head management, and more.

---

## Overview

**`@stone-js/use-react`** connects the Stone.js Continuum Architecture to the React ecosystem.

It provides:

- Universal rendering for **SSR** and **SPA**
- Powerful `Page` and `Layout` components with optional decorators
- A smart `Snapshot` system to sync server/client state seamlessly
- Dynamic `<StoneLink>`, `<StoneClient>`, and `<StoneServer>` rendering
- Integration hooks for popular tools and design systems

Use it to build fully reactive apps that run everywhere, Node.js, the browser, or serverless platforms, without giving up fine-grained control over context and rendering strategy.

## Installation

```bash
npm install @stone-js/use-react
```

> [!IMPORTANT]
> This package is **pure ESM**. Make sure your `package.json` includes `"type": "module"` or configure your bundler accordingly.

## Usage

This package is designed to be used inside a Stone.js app and integrates deeply with its lifecycle, adapter system, and blueprint configuration.

You can define Pages and Layouts:

```ts
import { Page } from '@stone-js/use-react'

@Page('/about')
export class AboutPage {
  render() {
    return <div>About Stone.js</div>
  }
}
```

You can hydrate data with snapshots:

```ts
import { Stone } from '@stone-js/core'
import { Snapshot } from '@stone-js/use-react'

@Stone({ alias: 'userService' })
export class UserService {
  @Snapshot()
  showProfile() {
    return { name: 'John Doe' }
  }
}
```

You can render elements conditionally:

```tsx
<StoneClient>Visible on client</StoneClient>
<StoneServer>Visible on server</StoneServer>
```

And much more.

## Learn More

This package is part of the Stone.js ecosystem, a modern JavaScript framework built around the Continuum Architecture.

Explore the full documentation: [https://stonejs.dev](https://stonejs.dev)

## API documentation

* [API](https://github.com/stone-foundation/stone-js-use-react/blob/main/docs)

## Contributing

See [Contributing Guide](https://github.com/stone-foundation/stone-js-use-react/blob/main/CONTRIBUTING.md)