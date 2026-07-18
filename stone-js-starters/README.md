# Stone.js - Starters

[![License: MIT](https://img.shields.io/npm/l/@stone-js/starters)](https://opensource.org/licenses/MIT)
[![Maintenance](https://img.shields.io/maintenance/yes/2026)](https://stonejs.dev)
[![Used by Stone CLI](https://img.shields.io/badge/Used%20by-Stone%20CLI-blue)](https://github.com/stone-foundation/stone-js-cli)

This repository contains official **starter templates** for Stone.js applications.

--- 

## Overview

It is used internally by the Stone CLI to generate scaffolded projects for both **microservices** and **frontend React apps**, with three predefined levels of complexity: **basic**, **standard**, and **full**.

## Available Starters

Each starter reflects a different level of complexity and domain (microservice or React), with both declarative and imperative styles available. You can pick the one that matches your architecture preferences and scale needs.

### Microservice Starters

| Name                           | Description                                                        |
| ------------------------------ | ------------------------------------------------------------------ |
| `basic-service-declarative`    | Minimal Stone.js microservice using class and decorators           |
| `basic-service-imperative`     | Minimal functional microservice with handler and blueprint         |
| `standard-service-declarative` | Adds routing, DI, and hooks with a clean declarative structure     |
| `standard-service-imperative`  | Functional routing setup with middleware and service container     |
| `full-service-declarative`     | Production-grade setup: lifecycle hooks, DI, error handling, tests |
| `full-service-imperative`      | Complete functional microservice with config, tests, and events    |

### React App Starters

| Name                         | Description                                                              |
| ---------------------------- | ------------------------------------------------------------------------ |
| `basic-react-declarative`    | Minimal React + Stone.js (SPA/SSR-ready) using class-based API           |
| `basic-react-imperative`     | Minimal React app using functional API and manual config                 |
| `standard-react-declarative` | Adds layout, routing, and lifecycle via decorators                       |
| `standard-react-imperative`  | Function-based setup with routing, layout system, and render control     |
| `full-react-declarative`     | Enterprise-ready app with head config, hydration, and complete structure |
| `full-react-imperative`      | Full functional React app with SSR, hooks, tests, and platform config    |

You can combine complexity level (`basic`, `standard`, `full`), domain (`react`, `service`), and style (`declarative`, `imperative`) to find the right starter, for example: `standard-react-imperative`.


## How It's Used

These starters are **not meant to be installed manually**.

Instead, the `@stone-js/cli` automatically pulls from this repository during:

```bash
npm create @stone-js
````

or

```bash
stone init
```

The CLI fetches the appropriate template based on user choices and sets up a ready-to-run project in seconds.

## Starter Structure

Each starter is a self-contained folder containing:

* `app/`, `asset/`, `public/`, `tests/` depending on the type
* Minimal `stone.config.mjs` or framework config
* Preset integration (e.g. adapters, blueprint, lifecycle)
* Preconfigured TypeScript + Vitest (for standard/full)
* Working example of event handler or route

## Maintaining the Starters

To update or add a new starter:

1. Fork or clone this repository.
2. Add or modify the corresponding folder (e.g., `react-full`, `micro-basic`).
3. Keep external dependencies minimal.
4. Test the template using the CLI locally.
5. Submit a PR following the [Contributing Guide](./CONTRIBUTING.md).

> The Stone CLI will always fetch the latest `main` branch when scaffolding.

## Why Three Levels?

Stone.js follows a **progressive complexity** approach.
These templates help developers grow their app without needing to eject or reconfigure from scratch.

* **Basic**: Hello world in 10 seconds.
* **Standard**: Real-world app features with good defaults.
* **Full**: Production-grade architecture with opinions.

## Learn More

This package is part of the Stone.js ecosystem, a modern JavaScript framework built around the Continuum Architecture.

Explore the full documentation: [https://stonejs.dev](https://stonejs.dev)

## Contributing

See [Contributing Guide](https://github.com/stone-foundation/stone-js-starters/blob/main/CONTRIBUTING.md)