# Stone.js · Telemetry

[![npm license](https://img.shields.io/npm/l/@stone-js/telemetry)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/telemetry)](https://www.npmjs.com/package/@stone-js/telemetry)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/telemetry)](https://www.npmjs.com/package/@stone-js/telemetry)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Release](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](https://github.com/stone-foundation/stone-js-framework/blob/main/SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-framework/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-framework/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-framework/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

> Framework-agnostic telemetry for Stone.js: spans, counters and gauges wired through the kernel hooks and middleware, with pluggable exporters (console by default, OpenTelemetry-friendly).

Part of **[Stone.js](https://stonejs.dev)**, the reference implementation of the
[Continuum Architecture](https://evens-stone.github.io/continuum-manifesto/manifesto): write your
domain once, and the context (runtime, protocol, caller) applies to it at run time.

## Install

```bash
npm i @stone-js/telemetry
```

## Usage

```ts
import { Telemetry } from '@stone-js/telemetry'
import { StoneApp } from '@stone-js/core'

// Spans, counters and gauges wired through the kernel, exporter-agnostic.
@Telemetry()
@StoneApp({ name: 'my-app' })
export class Application {}

// Inject the telemetry service in a handler/service to record spans and metrics.
```

## Documentation

Full documentation: **[stonejs.dev/docs/extensions/telemetry](https://stonejs.dev/docs/extensions/telemetry)**.

## License

[MIT](https://opensource.org/licenses/MIT) © Evens Pierre ("Mr. Stone") and the Stone.js contributors.
