# Stone.js - CLI

[![npm](https://img.shields.io/npm/l/@stone-js/cli)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@stone-js/cli)](https://www.npmjs.com/package/@stone-js/cli)
[![npm](https://img.shields.io/npm/dm/@stone-js/cli)](https://www.npmjs.com/package/@stone-js/cli)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![Build Status](https://github.com/stone-foundation/stone-js-cli/actions/workflows/main.yml/badge.svg)](https://github.com/stone-foundation/stone-js-cli/actions/workflows/main.yml)
[![Publish Package to npmjs](https://github.com/stone-foundation/stone-js-cli/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-cli/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-cli&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-cli)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-cli&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-cli)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](./SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-cli/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-cli/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-cli/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

The official CLI tool for building, running, and managing Stone.js applications.

---

## Overview

**Stone CLI** is the primary interface for creating and managing Stone.js projects.  
It provides a powerful set of built-in commands to bootstrap apps, serve them locally, build for production, and more.

Whether you're developing a backend microservice, a frontend SPA, a fullstack SSR app, or a CLI tool powered by Stone.js, the CLI helps you get started quickly and stay productive.

## Key Features

- Create and scaffold new Stone.js apps interactively
- Run development servers with hot reload
- Build production bundles and preview them
- Export third-party toolchain configs (e.g., Rollup, Vite)
- Type checking and cache clearing
- Discover and run custom commands defined in your app or installed libraries

## Installation

```bash
npm install -g @stone-js/cli
```

You can also use it locally via `npx`:

```bash
npx stone
```

Once installed, try:

```bash
stone --help
```

## Learn More

This package is part of the Stone.js ecosystem, a modern JavaScript framework built around the Continuum Architecture.

Explore the full documentation: [https://stonejs.dev](https://stonejs.dev)

## API documentation

* [API](https://github.com/stone-foundation/stone-js-cli/blob/main/docs)

## Contributing

See [Contributing Guide](https://github.com/stone-foundation/stone-js-cli/blob/main/CONTRIBUTING.md)