# Stone.js - Filesystem

[![npm](https://img.shields.io/npm/l/@stone-js/filesystem)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@stone-js/filesystem)](https://www.npmjs.com/package/@stone-js/filesystem)
[![npm](https://img.shields.io/npm/dm/@stone-js/filesystem)](https://www.npmjs.com/package/@stone-js/filesystem)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![Build Status](https://github.com/stone-foundation/stone-js-filesystem/actions/workflows/main.yml/badge.svg)](https://github.com/stone-foundation/stone-js-filesystem/actions/workflows/main.yml)
[![Publish Package to npmjs](https://github.com/stone-foundation/stone-js-filesystem/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-filesystem/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-filesystem&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-filesystem)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-filesystem&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-filesystem)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](./SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-filesystem/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-filesystem/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-filesystem/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

A robust, strongly typed ESM utility for safe, contextual file and path management in Stone.js applications.

---

## Overview

The `@stone-js/filesystem` package is a **pure ESM, strongly typed utility library** that provides safe and contextual file management capabilities for Stone.js applications. It wraps native Node.js APIs with consistent, expressive, and domain-oriented abstractions to handle files, paths, temporary directories, and project-specific structure resolution.

This package is part of the **Stone.js ecosystem**, designed to support the **Continuum Architecture** by exposing a normalized, context-aware interface to filesystem operations across platforms and runtimes.

## Key Features

- File inspection, creation, editing, and movement via the `File` and `UploadedFile` classes
- Utility functions to resolve:
  - `basePath`, `appPath`, `distPath`, `tmpPath`, etc.
- Helpers for hashing, MIME detection, and dynamic imports
- Consistent error handling with `FilesystemError`
- Immutable, encapsulated methods for safety and predictability
- Ideal for use in CLI tools, server runtimes, and adapter layers

## Installation

```bash
npm install @stone-js/filesystem
```

> [!IMPORTANT]
> This package is **pure ESM**. Ensure your `package.json` includes `"type": "module"` or configure your bundler appropriately.

## Usage

```ts
import { File, basePath, getFileHash } from '@stone-js/filesystem'

const file = File.create(basePath('config', 'app.json'))

if (file.isReadable()) {
  console.log(file.getContent())
}
```

For more examples and a complete guide to path resolution, file mutation, and upload handling, visit the official documentation:

**[https://stonejs.dev/docs](https://stonejs.dev/docs)**

## Learn More

This package is part of the Stone.js ecosystem, a modern JavaScript framework built around the Continuum Architecture.

Explore the full documentation: [https://stonejs.dev](https://stonejs.dev)

## API documentation

* [API](https://github.com/stone-foundation/stone-js-filesystem/blob/main/docs)

## Contributing

See [Contributing Guide](https://github.com/stone-foundation/stone-js-filesystem/blob/main/CONTRIBUTING.md)
