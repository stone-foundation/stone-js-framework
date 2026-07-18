# Stone.js

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)
[![Changesets](https://img.shields.io/badge/versioned%20with-changesets-blue.svg)](https://github.com/changesets/changesets)

> **Build once, deploy anywhere.** A universal, cloud-native micro-kernel framework — one codebase for backend **and** frontend, running on Node, serverless (FaaS), the browser, the CLI and the edge.

Stone.js is the reference implementation of the [**Continuum Architecture**](https://evens-stone.github.io/continuum-manifesto/manifesto): an application is not an object but an *act* — `Application = Domain × Context → Resolution`. You write your **domain** once; Stone.js **is the context** that applies to it at runtime.

This repository is the **monorepo** for the whole framework: every `@stone-js/*` package lives here and is released together (lockstep).

---

## The four dimensions

| Dimension | Incarnation | Role |
|---|---|---|
| **Setup** | Blueprint (`@stone-js/config` + core BlueprintBuilder) | A single configuration manifest, built once before any event, by decorator introspection or imperative meta-modules. |
| **Integration** | Adapters (one package per platform) | Capture raw *causes*, normalise them into *intentions* (`IncomingEvent`), turn responses back into native *effects*. |
| **Initialization** | Kernel (`@stone-js/core`) | Applies the container (per-event execution context) + the domain to the intention; middleware, hooks, error handlers. |
| **Functional** | Your code | Handlers and services — no imposed structure. |

## Packages

### Primitives
| Package | Description |
|---|---|
| [`@stone-js/pipeline`](./stone-js-pipeline) | Chain-of-responsibility pipeline (middleware engine). |
| [`@stone-js/service-container`](./stone-js-service-container) | Dependency-injection container. |
| [`@stone-js/config`](./stone-js-config) | Blueprint store + zero-dep utils (`cloneValue`, `deepMerge`, `getPath`). |

### Kernel
| Package | Description |
|---|---|
| [`@stone-js/core`](./stone-js-core) | The platform-agnostic micro-kernel. |

### Cross-cutting layers
| Package | Description |
|---|---|
| [`@stone-js/http-core`](./stone-js-http-core) | Runtime-agnostic HTTP primitives. |
| [`@stone-js/router`](./stone-js-router) | Universal router (Node + browser), serverless-oriented. |
| [`@stone-js/env`](./stone-js-env) | Environment variable access. |
| [`@stone-js/filesystem`](./stone-js-filesystem) | Filesystem abstraction (S3-ready). |
| [`@stone-js/browser-core`](./stone-js-browser-core) | Browser HTTP/event primitives. |

### Adapters (Integration)
| Package | Description |
|---|---|
| [`@stone-js/node-http-adapter`](./stone-js-node-http-adapter) | Node.js HTTP server. |
| [`@stone-js/node-cli-adapter`](./stone-js-node-cli-adapter) | Node.js CLI. |
| [`@stone-js/aws-lambda-adapter`](./stone-js-aws-lambda-adapter) | Generic AWS Lambda (any trigger). |
| [`@stone-js/aws-lambda-http-adapter`](./stone-js-aws-lambda-http-adapter) | AWS Lambda HTTP triggers. |
| [`@stone-js/browser-adapter`](./stone-js-browser-adapter) | Browser SPA. |

### Frontend
| Package | Description |
|---|---|
| [`@stone-js/use-view`](./stone-js-use-view) | Framework-agnostic view layer. |
| [`@stone-js/use-react`](./stone-js-use-react) | React integration (SSR/CSR). |

### Tooling
| Package | Description |
|---|---|
| [`@stone-js/cli`](./stone-js-cli) | Build & scaffolding CLI for every project type. |
| [`@stone-js/starters`](./stone-js-starters) | Official project templates. |
| [`@stone-js/docs`](./stone-js-docs) | Documentation site. |

## Quick start

```bash
# Scaffold a new app
npm create @stone-js@latest my-app
cd my-app && npm install && npm run dev
```

See [stonejs.dev](https://stonejs.dev) for full documentation.

## Working in this monorepo

New here? Read **[MONOREPO.md](./MONOREPO.md)** — a step-by-step guide to how the monorepo works, what each tool does, and every command you need to pilot it yourself.

```bash
pnpm install        # install everything, link internal packages
pnpm build          # build all packages (turbo, cached)
pnpm test           # run all tests
pnpm lint           # lint all packages
pnpm changeset      # record a change for the next release
```

Contributing? See **[CONTRIBUTING.md](./CONTRIBUTING.md)**. Security issues? See **[SECURITY.md](./SECURITY.md)**.

## License

[MIT](./LICENSE) © Evens Pierre ("Mr. Stone") and the Stone.js contributors.
