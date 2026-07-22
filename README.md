# Stone.js

[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![npm](https://img.shields.io/npm/v/@stone-js/core?label=%40stone-js%2Fcore)](https://www.npmjs.com/package/@stone-js/core)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.11-brightgreen.svg)](https://nodejs.org)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Maintained with pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)
[![Versioned with changesets](https://img.shields.io/badge/versioned%20with-changesets-blue.svg)](https://github.com/changesets/changesets)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](./SECURITY.md)

> **Your app exists in every runtime. Until you run it.** A universal, cloud-native micro-kernel framework: one codebase for backend **and** frontend, running on Node, serverless (FaaS), the browser, the CLI, the edge and AI agents.

Stone.js is the reference implementation of the [**Continuum Architecture**](https://evens-stone.github.io/continuum-manifesto/manifesto): an application is not an object but an *act*, `Application = Domain × Context → Resolution`. You write your **domain** once; Stone.js **is the context** that applies to it at run time.

This repository is the **monorepo** for the whole framework: every `@stone-js/*` package lives here and is released together (lockstep) with [changesets](https://github.com/changesets/changesets).

---

## The four dimensions

| Dimension | Incarnation | Role |
|---|---|---|
| **Setup** | Blueprint (`@stone-js/config` + core BlueprintBuilder) | A single configuration manifest, built once before any event, by decorator introspection or imperative meta-modules. |
| **Integration** | Adapters (one package per platform) | Capture raw *causes*, normalise them into *intentions* (`IncomingEvent`), turn responses back into native *effects*. |
| **Initialization** | Kernel (`@stone-js/core`) | Applies the container (per-event execution context) + the domain to the intention; middleware, hooks, error handlers. |
| **Functional** | Your code | Handlers and services, no imposed structure. |

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
| [`@stone-js/router`](./stone-js-router) | Universal router (Node + browser), by-path and by-key routing. |
| [`@stone-js/env`](./stone-js-env) | Environment variable access. |
| [`@stone-js/filesystem`](./stone-js-filesystem) | Filesystem abstraction (signed-URL ready). |
| [`@stone-js/browser-core`](./stone-js-browser-core) | Browser HTTP/event primitives. |
| [`@stone-js/config-source`](./stone-js-config-source) | Agnostic config sources (env/file/http/SSM/secrets) loaded into the blueprint. |
| [`@stone-js/telemetry`](./stone-js-telemetry) | Spans, counters and gauges on an agnostic contract. |

### Adapters — Node
| Package | Description |
|---|---|
| [`@stone-js/node-http-adapter`](./stone-js-node-http-adapter) | Node.js HTTP server. |
| [`@stone-js/node-cli-adapter`](./stone-js-node-cli-adapter) | Node.js CLI. |
| [`@stone-js/node-ws-adapter`](./stone-js-node-ws-adapter) | Node.js WebSocket server (`ws`). |

### Adapters — Serverless (FaaS)
| Package | Description |
|---|---|
| [`@stone-js/aws-lambda-adapter`](./stone-js-aws-lambda-adapter) | Generic AWS Lambda (any trigger). |
| [`@stone-js/aws-lambda-http-adapter`](./stone-js-aws-lambda-http-adapter) | AWS Lambda HTTP triggers. |
| [`@stone-js/aws-apigw-ws-adapter`](./stone-js-aws-apigw-ws-adapter) | AWS API Gateway WebSockets. |
| [`@stone-js/gcp-cloud-functions-adapter`](./stone-js-gcp-cloud-functions-adapter) | Generic Google Cloud Functions. |
| [`@stone-js/gcp-cloud-functions-http-adapter`](./stone-js-gcp-cloud-functions-http-adapter) | Google Cloud Functions HTTP. |
| [`@stone-js/azure-functions-adapter`](./stone-js-azure-functions-adapter) | Generic Azure Functions. |
| [`@stone-js/azure-functions-http-adapter`](./stone-js-azure-functions-http-adapter) | Azure Functions v4 HTTP. |
| [`@stone-js/alibaba-fc-adapter`](./stone-js-alibaba-fc-adapter) | Generic Alibaba Cloud Function Compute. |
| [`@stone-js/alibaba-fc-http-adapter`](./stone-js-alibaba-fc-http-adapter) | Alibaba FC HTTP. |
| [`@stone-js/tencent-scf-adapter`](./stone-js-tencent-scf-adapter) | Generic Tencent Cloud SCF. |
| [`@stone-js/tencent-scf-http-adapter`](./stone-js-tencent-scf-http-adapter) | Tencent SCF HTTP. |

### Adapters — Edge, Web & Agents
| Package | Description |
|---|---|
| [`@stone-js/edge-adapter`](./stone-js-edge-adapter) | Any WinterCG/edge runtime (Cloudflare Workers, Deno, Bun). |
| [`@stone-js/fetch-adapter`](./stone-js-fetch-adapter) | Web-standard (WinterCG Fetch) adapter. |
| [`@stone-js/browser-adapter`](./stone-js-browser-adapter) | Browser SPA. |

### Frontend
| Package | Description |
|---|---|
| [`@stone-js/use-view`](./stone-js-use-view) | Framework-agnostic view engine layer. |
| [`@stone-js/use-react`](./stone-js-use-react) | React integration (SSR/SSG/CSR). |

### Modules & extensions
| Package | Description |
|---|---|
| [`@stone-js/validation`](./stone-js-validation) | Input validation (Zod / Standard Schema), one schema for API and form. |
| [`@stone-js/auth`](./stone-js-auth) | Stateless, edge-native JWT/OAuth authentication. |
| [`@stone-js/authz`](./stone-js-authz) | Isomorphic authorization (CASL-based). |
| [`@stone-js/resources`](./stone-js-resources) | API resources: shape what the domain returns. |
| [`@stone-js/openapi`](./stone-js-openapi) | OpenAPI 3.1 derived from your validation schemas. |
| [`@stone-js/realtime`](./stone-js-realtime) | Channels, presence and broadcast over WebSockets. |
| [`@stone-js/event-bus`](./stone-js-event-bus) | Agnostic cloud event bus (emit + key-routed handling). |
| [`@stone-js/queue`](./stone-js-queue) | Agnostic job queue (delay, retries, backoff). |
| [`@stone-js/cache`](./stone-js-cache) | Agnostic cache (get/set/ttl/tags/remember). |
| [`@stone-js/cloud-file`](./stone-js-cloud-file) | Cloud storage on the filesystem contract, signed URLs. |
| [`@stone-js/mcp-dev`](./stone-js-mcp-dev) | `stone mcp`: serve the framework's knowledge + your tools to a coding agent (MCP, stdio). |
| [`@stone-js/testing`](./stone-js-testing) | Boot a real app in-memory and dispatch events. |

### Tooling
| Package | Description |
|---|---|
| [`@stone-js/cli`](./stone-js-cli) | Build & scaffolding CLI for every project type. |
| [`@stone-js/starters`](./stone-js-starters) | Official project templates. |
| [`@stone-js/blog-starters`](./stone-js-blog-starters) | Opt-in starter templates for the blog recipes. |

> The documentation site (`@stone-js/docs`), the website (`@stone-js/website`) and the integration lab (`@stone-js/lab`) live here too but are internal (not published to npm).

## Quick start

```bash
# Scaffold a new app
npm create @stone-js@latest my-app
cd my-app && npm install && npm run dev
```

See [stonejs.dev](https://stonejs.dev) for full documentation.

## Working in this monorepo

New here? Read **[MONOREPO.md](./MONOREPO.md)**, a step-by-step guide to how the monorepo works, what each tool does, and every command you need to pilot it yourself.

```bash
pnpm install         # install everything, link internal packages
pnpm build           # build all packages (pnpm -r, topological)
pnpm test            # run all tests
pnpm test:coverage   # run all tests with coverage (lcov, for Sonar)
pnpm lint            # lint all packages
pnpm audit           # security audit of the dependency tree
pnpm changeset       # record a change for the next release
```

Commits follow [Conventional Commits](https://conventionalcommits.org) (enforced by commitlint via a Husky `commit-msg` hook); staged files are linted per-package on `pre-commit`.

Contributing? See **[CONTRIBUTING.md](./CONTRIBUTING.md)**. Security issues? See **[SECURITY.md](./SECURITY.md)**.

## License

[MIT](./LICENSE) © Evens Pierre ("Mr. Stone") and the Stone.js contributors.
