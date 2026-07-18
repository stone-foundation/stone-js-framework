# Stone.js - Create Stone App

[![npm](https://img.shields.io/npm/l/@stone-js/create)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@stone-js/create)](https://www.npmjs.com/package/@stone-js/create)
[![npm](https://img.shields.io/npm/dm/@stone-js/create)](https://www.npmjs.com/package/@stone-js/create)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![Build Status](https://github.com/stone-foundation/stone-js/actions/workflows/main.yml/badge.svg)](https://github.com/stone-foundation/stone-js/actions/workflows/main.yml)
[![Publish Package to npmjs](https://github.com/stone-foundation/stone-js/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](./SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

Scaffold a new Stone.js app in seconds using your terminal.

---

## Overview

**Create Stone App** is the official scaffolding tool for Stone.js, designed to get your project up and running in just a few commands.

It powers the command:

```bash
npm create @stone-js
```

Under the hood, it clones a project starter, asks you a few questions, and sets up your application based on your choices.

## Usage

To create a new Stone.js project:

```bash
npm create @stone-js
```

Or with a custom project name:

```bash
npm create @stone-js my-app
```

The tool will guide you through an interactive setup and generate a ready-to-run Stone.js application.

You can then:

```bash
cd my-app
npm install
npm run dev
```

## What You Get

Depending on your choices, the tool can scaffold:

* Backend, frontend, or fullstack apps
* React or Vue view layer
* SPA or SSR rendering strategy
* Basic, standard, or full application layout
* Local development support with `stone serve`
* Production-ready structure with `stone build` and `stone preview`

## Learn More

This package is part of the Stone.js ecosystem, a modern JavaScript framework built around the Continuum Architecture.

Explore the full documentation: [https://stonejs.dev](https://stonejs.dev)

## API documentation

- [API](https://github.com/stone-foundation/stone-js/blob/main/docs/modules.md)

## Contributing

See [Contributing Guide](https://github.com/stone-foundation/stone-js/blob/main/CONTRIBUTING.md).
