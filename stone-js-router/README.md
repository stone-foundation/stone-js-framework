# Stone.js - Router

[![npm](https://img.shields.io/npm/l/@stone-js/router)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@stone-js/router)](https://www.npmjs.com/package/@stone-js/router)
[![npm](https://img.shields.io/npm/dm/@stone-js/router)](https://www.npmjs.com/package/@stone-js/router)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![Build Status](https://github.com/stone-foundation/stone-js-router/actions/workflows/main.yml/badge.svg)](https://github.com/stone-foundation/stone-js-router/actions/workflows/main.yml)
[![Publish Package to npmjs](https://github.com/stone-foundation/stone-js-router/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-router/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-router&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-router)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-router&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-router)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](./SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-router/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-router/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-router/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

Stone.js router for both Node.js and browser environments, designed for serverless applications.

---

## Overview

**Stone Router** is a high-performance, universal router designed to work seamlessly across **Node.js** and **browser environments**. As a core part of the [Stone.js](https://stonejs.dev) framework, it enables robust, declarative, and composable route handling for **serverless**, **SSR**, and **SPA** applications.

## Key Features

- **Universal**: Works on both backend and frontend (Node.js, browsers, SSR apps).
- **Composable**: Supports route builders, chaining, and nested route structures.
- **Context-Aware**: Routes are designed to respond to the execution context.
- **Type-Safe & Declarative**: Built with TypeScript-first principles.
- **Fast & Lightweight**: Optimized for high-performance and minimal overhead.
- **Model Binding**: Automatically inject models and bindings into routes.
- **Flexible Middleware System**: Apply middleware globally or per route.
- **Regex and Dynamic Params**: Advanced matching for custom use cases.
- **Error Handling & Fallbacks**: Integrated with the event lifecycle.
- **Smart Defaults**: Supports defaults, route rules, redirect handling, etc.

## Installation

```bash
npm install @stone-js/router
```

> [!IMPORTANT]
> This package is **pure ESM**. Ensure your `package.json` includes `"type": "module"` or configure your bundler appropriately.

## Usage

Stone Router exposes a functional/declarative API that allows defining, composing, and dispatching routes easily. 
It is designed to be used in both server and client contexts, making it ideal for modern web applications that require a unified routing solution.
It fully integrates with the **event system** of Stone.js through `IncomingEvent` and `OutgoingResponse`.

```ts
import { IncomingEvent } from '@stone-js/core'
import { defineRoutes } from '@stone-js/router'

export const routes = defineRoutes([
  {
    method: 'GET',
    path: '/users/:id',
    handler: async (event: IncomingEvent) => {
      return { body: `User ID: ${event.get('id') }` }
    }
  }
])
```

## Learn More

This package is part of the Stone.js ecosystem, a modern JavaScript framework built around the Continuum Architecture.

Explore the full documentation: [https://stonejs.dev](https://stonejs.dev)

## API documentation

* [API](https://github.com/stone-foundation/stone-js-router/blob/main/docs)

## Contributing

See [Contributing Guide](https://github.com/stone-foundation/stone-js-router/blob/main/CONTRIBUTING.md)