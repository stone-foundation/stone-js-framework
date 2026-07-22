# Stone.js - HTTP Core

[![npm license](https://img.shields.io/npm/l/@stone-js/http-core)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/http-core)](https://www.npmjs.com/package/@stone-js/http-core)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/http-core)](https://www.npmjs.com/package/@stone-js/http-core)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Release](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](https://github.com/stone-foundation/stone-js-framework/blob/main/SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-framework/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-framework/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-framework/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

Stone.js HTTP Core offers a simple, consistent API for handling HTTP requests and responses across any JavaScript runtime.

---

## Overview

The `@stone-js/http-core` package defines the foundational HTTP abstractions used throughout the Stone.js ecosystem. It introduces the `IncomingHttpEvent` and `OutgoingHttpResponse` classes, enabling context-aware handling of HTTP requests and responses in a runtime-agnostic way.

This module provides a normalized API for HTTP operations that works across adapters (Node.js, Lambda, etc.), serving as the bridge between the external runtime and the internal application logic.

## Key Features

- `IncomingHttpEvent`: A wrapper for incoming HTTP requests with support for headers, query, body, method, and cookies
- `OutgoingHttpResponse`: A consistent abstraction for building and sending structured HTTP responses
- First-class cookie handling with `Cookie` (secure, signed, or plain)
- Support for headers, status codes, redirection, and JSON responses
- Shared interfaces for request and response resolution across runtimes

All components are designed to be used within the **Continuum Architecture** of Stone.js, making them predictable, extensible, and runtime-neutral.

## Installation

```bash
npm install @stone-js/http-core
```

> \[!IMPORTANT]
> This package is **pure ESM**. Ensure your `package.json` includes `"type": "module"` or configure your bundler appropriately.

## Usage Example

```ts
import { IncomingHttpEvent, OutgoingHttpResponse } from '@stone-js/http-core'

// Simulate incoming request
const event = new IncomingHttpEvent({
  method: 'GET',
  url: URL.parse('https://example.com/api/resource'),
  headers: { 'x-custom-header': 'value' },
  body: {},
  queryString: 'param1=value1&param2=value2',
})

// Build response
const response = OutgoingHttpResponse.create({ content: { message: 'Hello from Stone.js' } })
response.setStatus(204)
response.setHeader('Content-Type', 'application/json')
```

## Learn More

This package is part of the Stone.js ecosystem, a modern JavaScript framework built around the Continuum Architecture.

Explore the full documentation: [https://stonejs.dev](https://stonejs.dev)

## API documentation

* [API](https://github.com/stone-foundation/stone-js-http-core/blob/main/docs)

## Contributing

See [Contributing Guide](https://github.com/stone-foundation/stone-js-http-core/blob/main/CONTRIBUTING.md)
