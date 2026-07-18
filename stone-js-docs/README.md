# Stone.js - Documentation

![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![Build Status](https://github.com/stone-foundation/stone-js-docs/actions/workflows/main.yml/badge.svg)](https://github.com/stone-foundation/stone-js-docs/actions/workflows/main.yml)
[![Deploy Status](https://github.com/stone-foundation/stone-js-docs/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-docs/actions/workflows/release.yml)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-docs/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

Welcome to the official documentation source for [Stone.js](https://stonejs.dev), the universal JavaScript/TypeScript framework built on the **Continuum Architecture**.

This repository powers the [documentation site](https://stonejs.dev), built with [VuePress](https://vuepress.vuejs.org/), and serves as the single source of truth for all developer guides, API references, core concepts, and advanced features of Stone.js.

---

## What Is Stone.js?

Stone.js is a **next-generation framework** that lets you build:

- Backend apps (microservices, CLI, serverless)
- Frontend apps (SPA, SSR, Vue/React)
- Fullstack cloud-native applications

All using **one architecture**, **one mental model**, and **one toolchain**.

At the heart of Stone.js is the **Continuum Architecture**, where Context defines everything, and the same knowledge applies across dimensions, backend, frontend, serverless, browser, anywhere.

## Project Structure

This documentation is organized using the [Stone.js Documentation Master Plan](https://github.com/stone-foundation/stone-js-docs), which defines a consistent structure for all pages.

```txt
src/
├── .vuepress/             # VuePress config, theme, plugins
├── api/                   # API reference pages
├── packages/              # Package documentation
├── docs/                  # Documentation source files
  ├── getting-started/     # Getting started guides
  ├── architecture/        # Core architecture concepts
  ├── essentials/          # Essential features and concepts
  ├── router/              # Router documentation
  ├── react/               # React integration
  ├── deeper/              # Advanced topics and patterns
└── README.md              # Home page
````

You’ll find every page follows a shared structure:

* Introduction
* Where it fits in the Continuum Architecture
* Feature shape (class/function/factory)
* Dimension-specific behavior
* Declarative & imperative registration
* Best practices
* Summary

## Getting Started

To preview the documentation locally:

```bash
pnpm install
pnpm run docs:dev
```

To build the static site:

```bash
pnpm run docs:build
```

Output will be in `src/.vuepress/dist`.

## Contributing

We love documentation contributions.

Whether it’s:

* Fixing typos
* Clarifying a tricky sentence
* Adding new sections
* Writing a full feature page

Please read our [Contributing Guide](./CONTRIBUTING.md) before submitting your changes.

All pull requests should follow the [Documentation Master Plan](https://github.com/stone-foundation/stone-js-docs) and use [Conventional Commit messages](https://www.conventionalcommits.org/).

## Code of Conduct

We follow the [Contributor Covenant](./CODE_OF_CONDUCT.md).
Please be kind and respectful in all interactions.

## Built With

* [VuePress](https://vuepress.vuejs.org/)
* [pnpm](https://pnpm.io/)
* [Release Please](https://github.com/googleapis/release-please-action)

## Custom Domain

The documentation is hosted on GitHub Pages at
🔗 **[https://stonejs.dev](https://stonejs.dev)**
with automatic HTTPS via GitHub's free SSL.

## About the Continuum Architecture

Stone.js is more than a framework, it’s a new way to build software systems.

At the core of Stone.js is a radical but practical idea:

> **“Context defines everything.”**

You can learn more in the [Core Concepts → Continuum Architecture](./src/docs/architecture/continuum.md) section.

## Questions or Feedback?

If something is unclear, wrong, or could be better, [open an issue](https://github.com/stone-foundation/stone-js-docs/issues) or start a discussion.

We're all about continuous improvement, in code and in documentation.

**Stone.js: Write once, deploy everywhere.**
One continuum. One architecture. One tool to rule them all.
