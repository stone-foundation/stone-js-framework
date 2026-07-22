# Stone.js - Browser Core

[![npm license](https://img.shields.io/npm/l/@stone-js/browser-core)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/browser-core)](https://www.npmjs.com/package/@stone-js/browser-core)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/browser-core)](https://www.npmjs.com/package/@stone-js/browser-core)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Release](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](https://github.com/stone-foundation/stone-js-framework/blob/main/SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-framework/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-framework/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-framework/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

Stone.js Browser core provides essential utilities for browser-based applications, including event handling, response management, and cookie operations.

---

## Overview

The `@stone-js/browser-core` package provides the browser-side runtime abstraction for navigation-based applications built with **Stone.js**. It acts as the **client-side continuation** of `@stone-js/http-core`, enabling the same application logic to run across HTTP and browser environments, such as SSR, SPA, and hybrid apps.

This module enables **context-aware event and response handling** in the browser using a unified model of routing, redirection, and cookie control, without managing DOM or UI behavior directly.

## Key Features

- `IncomingBrowserEvent`: Represents navigation-based client-side events (e.g., route changes, link clicks)
- `OutgoingBrowserResponse`: Produces standardized browser responses (HTML updates, cookie headers, etc.)
- `RedirectBrowserResponse`: Emits client-side redirects with full context
- `CookieCollection`: Unified cookie abstraction across HTTP and browser environments
- Designed for **SPA and SSR continuity**, not tied to any frontend library

> [!IMPORTANT]
> This package does **not** manage DOM events or UI interactions. It strictly handles navigation-level behavior in a runtime-agnostic way.

## Installation

```bash
npm install @stone-js/browser-core
```

> [!IMPORTANT]
> This package is **pure ESM**. Ensure your `package.json` includes `"type": "module"` or configure your bundler appropriately.

## Usage Example

```ts
import { IncomingBrowserEvent, RedirectBrowserResponse } from '@stone-js/browser-core'

const event = new IncomingBrowserEvent({
  url: URL.parse(location)
})

const response = RedirectBrowserResponse.to('/dashboard')
```

## Learn More

This package is part of the Stone.js ecosystem, a modern JavaScript framework built around the Continuum Architecture.

Explore the full documentation: [https://stonejs.dev](https://stonejs.dev)

## API documentation

* [API](https://github.com/stone-foundation/stone-js-browser-core/blob/main/docs)

## Contributing

See [Contributing Guide](https://github.com/stone-foundation/stone-js-browser-core/blob/main/CONTRIBUTING.md)