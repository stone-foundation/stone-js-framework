# Stone.js - Node CLI Adapter

[![npm](https://img.shields.io/npm/l/@stone-js/node-cli-adapter)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@stone-js/node-cli-adapter)](https://www.npmjs.com/package/@stone-js/node-cli-adapter)
[![npm](https://img.shields.io/npm/dm/@stone-js/node-cli-adapter)](https://www.npmjs.com/package/@stone-js/node-cli-adapter)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![Build Status](https://github.com/stone-foundation/stone-js-node-cli-adapter/actions/workflows/main.yml/badge.svg)](https://github.com/stone-foundation/stone-js-node-cli-adapter/actions/workflows/main.yml)
[![Publish Package to npmjs](https://github.com/stone-foundation/stone-js-node-cli-adapter/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-node-cli-adapter/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-node-cli-adapter&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-node-cli-adapter)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-node-cli-adapter&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-node-cli-adapter)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](./SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-node-cli-adapter/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-node-cli-adapter/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-node-cli-adapter/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

The **Node CLI Adapter** enables you to run Stone.js applications in a command-line interface (CLI) context, transforming user-defined or custom commands into system-executable events.

---

## Introduction

In the Continuum Architecture, adapters are responsible for translating external context into normalized system events. The Node CLI Adapter takes terminal input, parsed arguments and commands, and turns them into `IncomingEvent` objects that your system can handle.

This allows you to:

* Build CLI tools, scripts, or developer utilities with Stone.js
* Define custom commands and map them to handlers
* Leverage Stone.js's lifecycle, configuration, and event system in the terminal

---

## Installation

```bash
npm install @stone-js/node-cli-adapter
```

> This package is **pure ESM**. Ensure your project is ESM-compatible (`"type": "module"` in `package.json`) or configure your tooling accordingly.

## Usage

You can activate the adapter using either the declarative or imperative API.

### Declarative API

```ts
import { NodeConsole } from '@stone-js/node-cli-adapter'
import { StoneApp, IncomingEvent, IEventHandler } from '@stone-js/core'

@StoneApp()
@NodeConsole()
export class Application implements IEventHandler<IncomingEvent> {
  handle(event: IncomingEvent) {
    console.log('CLI event received:', event.get<string>('command'))
    return { status: 'ok' }
  }
}
```

### Imperative API

```ts
import { defineStoneApp, IncomingEvent } from '@stone-js/core'
import { nodeConsoleAdapterBlueprint } from '@stone-js/node-cli-adapter'

const handler = (event: IncomingEvent) => {
  console.log('Running CLI command:', event.get<string>('command'))
  return { status: 'done' }
}

export const MyCLIApp = defineStoneApp(handler, {}, [nodeConsoleAdapterBlueprint])
```

## What It Enables

* **Universal CLI Entry Point**
  Use the same `defineStoneApp` structure as other environments, just change the adapter.

* **Custom Commands**
  Register your own CLI commands using `defineCommand()` or `@Command()`, and bind them to handlers in your system.

* **Runtime Argument Parsing**
  Inputs from the terminal are automatically parsed and mapped into an `IncomingEvent`, with parameters available via `.get()`.

* **Cross-platform Logic**
  You can reuse the same handler logic between CLI and server, the adapter abstracts away the runtime.

## Configuration Options

The CLI adapter supports command registration via metadata or blueprint configuration.

To register commands imperatively:

```ts
import { defineConfig, IBlueprint } from '@stone-js/core'
import { defineCommand, NODE_CONSOLE_PLATFORM } from '@stone-js/node-cli-adapter'

export const AppConfig = defineConfig({
  afterConfigure (blueprint: IBlueprint) {
    if (blueprint.is('stone.adapter.platform', NODE_CONSOLE_PLATFORM)) {
      blueprint.set(defineCommand(handler, { name: '*' }))
    }
  }
})
```

> You can also register commands using metadata decorators. See the main Stone.js documentation on [Command Handlers](https://stonejs.dev/docs/deeper/commands) for more.

## Summary

The `@stone-js/node-cli-adapter` lets you run your Stone.js system as a CLI, turning terminal arguments and commands into system-level events. It enables you to reuse your event-handling logic, configuration, and hooks across environments without rewriting platform-specific glue code.

This adapter is ideal for scripting, developer tooling, generators, or any use case where your application lives in the terminal.

## API documentation

* [API](https://github.com/stone-foundation/stone-js-node-cli-adapter/blob/main/docs)

## Contributing

We welcome contributions! See the [Contributing Guide](https://github.com/stone-foundation/stone-js-node-cli-adapter/blob/main/CONTRIBUTING.md) for details.
