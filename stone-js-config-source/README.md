# Stone.js - Config Source

[![npm](https://img.shields.io/npm/l/@stone-js/config-source)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@stone-js/config-source)](https://www.npmjs.com/package/@stone-js/config-source)
[![npm](https://img.shields.io/npm/dm/@stone-js/config-source)](https://www.npmjs.com/package/@stone-js/config-source)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![Build Status](https://github.com/stone-foundation/stone-js-config-source/actions/workflows/main.yml/badge.svg)](https://github.com/stone-foundation/stone-js-config-source/actions/workflows/main.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-config-source&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-config-source)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

**Agnostic configuration sources for Stone.js.** Load and merge configuration from many providers, env vars, JSON/YAML files, AWS SSM Parameter Store, Secrets Manager, an HTTP endpoint (a GitHub raw file, a gist), with KMS-decrypted values, into the blueprint **before the app boots**, so every blueprint middleware and provider sees the resolved config. Opt into **live** reload to refresh it on each incoming request.

---

## Installation

```bash
npm install @stone-js/config-source

# only the drivers you use (optional peers, imported lazily):
npm install @aws-sdk/client-ssm @aws-sdk/client-secrets-manager @aws-sdk/client-kms js-yaml
```

> Peer dependency: `@stone-js/core`. The AWS SDKs and `js-yaml` are optional peers, imported lazily.

## How it plugs in

The framework awaits a `@Configuration()`'s `configure(blueprint)` during `initBlueprint`, **before** the blueprint middleware run. Load your sources there and the whole app boots with the config already merged in:

```ts
import { Configuration } from '@stone-js/core'
import { loadConfigSources, envSource, fileSource, ssmSource, secretsSource, kmsDecryptor } from '@stone-js/config-source'

@Configuration()
export class AppConfig {
  async configure (blueprint) {
    await loadConfigSources(blueprint, [
      envSource({ prefix: 'APP_' }),
      fileSource({ path: './config.yaml', optional: true }),
      ssmSource({ path: '/my-app/' }),
      secretsSource({ secretId: 'my-app/prod' })
    ], { transform: kmsDecryptor() })
  }
}
```

Sources are merged in order (later wins). `transform` runs on every leaf value, `kmsDecryptor()` decrypts any string prefixed with `kms:`.

### Live reload

Mark the configuration `live` and Stone reloads it on every incoming event (its native live-config mechanism), no restart needed:

```ts
@Configuration({ live: true })
export class LiveConfig {
  async configure (blueprint) {
    await loadConfigSources(blueprint, [ssmSource({ path: '/my-app/' })])
  }
}
```

## Sources

| source | provider |
| ------ | -------- |
| `envSource({ prefix?, env? })` | environment variables (prefix stripped) |
| `fileSource({ path, format?, optional? })` | local JSON / YAML file |
| `ssmSource({ path, region?, client? })` | AWS SSM Parameter Store (nested by path) |
| `secretsSource({ secretId, region?, client? })` | AWS Secrets Manager (JSON secret) |
| `httpSource({ url, headers?, format?, fetch? })` | any URL (GitHub raw, gist, config server) |
| `kmsDecryptor({ region?, prefix? })` | a `transform` that decrypts `kms:`-prefixed values |

Use `ConfigSourceManager` directly for finer control (`.add()`, `.load()`, `.loadInto(blueprint)`).

## License

[MIT](./LICENSE)
