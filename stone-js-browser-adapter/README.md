# Stone.js - Browser Adapter

[![npm](https://img.shields.io/npm/l/@stone-js/browser-adapter)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@stone-js/browser-adapter)](https://www.npmjs.com/package/@stone-js/browser-adapter)
[![npm](https://img.shields.io/npm/dm/@stone-js/browser-adapter)](https://www.npmjs.com/package/@stone-js/browser-adapter)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![Build Status](https://github.com/stone-foundation/stone-js-browser-adapter/actions/workflows/main.yml/badge.svg)](https://github.com/stone-foundation/stone-js-browser-adapter/actions/workflows/main.yml)
[![Publish Package to npmjs](https://github.com/stone-foundation/stone-js-browser-adapter/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-browser-adapter/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-browser-adapter&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-browser-adapter)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-browser-adapter&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-browser-adapter)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](./SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-browser-adapter/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-browser-adapter/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-browser-adapter/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

The **Browser Adapter** enables Stone.js to run directly in the browser, as a single-page or client-side rendered application, using the same universal interface and system design as backend deployments.

---

## Introduction

In the Continuum Architecture, adapters are responsible for translating external context into internal system events. The browser adapter fulfills this role on the client-side by transforming browser-level navigation (like popstate or route events) into `IncomingEvent` objects that can be processed by your application.

This allows you to:

* Run your full Stone.js system in the browser
* Use the same handler and `IncomingEvent` logic as the backend
* Handle routing, redirection, cookies, and more, entirely in the browser

> This adapter is runtime-focused. It does not manage DOM events or UI logic, it is designed for **SPA or SSR client runtime integration**, not for UI frameworks.

## Installation

```bash
npm install @stone-js/browser-adapter
```

> This package is **pure ESM**. Make sure your project is ESM-compatible (`"type": "module"` in `package.json`) or configure your bundler accordingly.

## Usage

You can activate the adapter either declaratively or imperatively.

### Declarative API

```ts
import { Browser } from '@stone-js/browser-adapter'
import { StoneApp, IncomingEvent, IEventHandler } from '@stone-js/core'

@Browser()
@StoneApp()
export class Application implements IEventHandler<IncomingEvent> {
  handle(event: IncomingEvent): { message: string } {
    const name = event.get<string>('name', 'World')
    return { message: `Hello ${name}!` }
  }
}
```

### Imperative API

```ts
import { defineStoneApp, IncomingEvent } from '@stone-js/core'
import { browserAdapterBlueprint } from '@stone-js/browser-adapter'

export const handler = (event: IncomingEvent) => {
  const name = event.get<string>('name', 'World')
  return { message: `Hello ${name}!` }
}

export const App = defineStoneApp(handler, {}, [browserAdapterBlueprint])
```

## What It Enables

* **SPA Runtime Support**
  Run your Stone.js app fully in the browser as a SPA. Routing and navigation are handled as synthetic events, passed into the system like any external request.

* **Route-First Event Handling**
  Unlike backend adapters that respond to raw HTTP requests, the browser adapter listens to high-level route events (`@stonejs/router.navigate`, `popstate`, etc.) and converts them into `IncomingEvent` objects.

* **Unified Cookie API**
  You can use the same cookie methods (`getCookie()`, `setCookie()`, etc.) on both client and server, without needing browser-specific abstractions.

## Configuration Options

The browser adapter supports a single configuration option:

| Option   | Type       | Default                                    | Description                                       |
| -------- | ---------- | ------------------------------------------ | ------------------------------------------------- |
| `events` | `string[]` | `['popstate', '@stonejs/router.navigate']` | DOM or synthetic events to listen for as triggers |

### Declarative Configuration

```ts
@Browser({ events: ['popstate'] })
export class App { /* ... */ }
```

### Imperative Configuration

To configure adapter options imperatively, use the `afterConfigure` hook:

```ts
import { defineConfig, IBlueprint } from '@stone-js/core'
import { BROWSER_PLATFORM } from '@stone-js/browser-adapter'

export const AppConfig = defineConfig({
  afterConfigure(blueprint: IBlueprint) {
    if (blueprint.is('stone.adapter.platform', BROWSER_PLATFORM)) {
      blueprint.add('stone.adapter.events', ['popstate'])
    }
  }
})
```

> Adapter selection happens at runtime. Always set configuration in `afterConfigure()` to ensure it's applied after the adapter has been resolved.

## Summary

The `@stone-js/browser-adapter` enables Stone.js to operate in the browser with full support for routing, SPA-style execution, and context-aware event handling. It brings the same system architecture and behavior from your backend directly to the frontend, without code duplication or runtime hacks.

This adapter is a cornerstone for universal applications built with Stone.js.

## API documentation

* [API](https://github.com/stone-foundation/stone-js-browser-adapter/blob/main/docs)

## Contributing

We welcome contributions! See the [Contributing Guide](https://github.com/stone-foundation/stone-js-browser-adapter/blob/main/CONTRIBUTING.md) for details.
