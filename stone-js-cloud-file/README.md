# Stone.js - Cloud File

[![npm license](https://img.shields.io/npm/l/@stone-js/cloud-file)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/cloud-file)](https://www.npmjs.com/package/@stone-js/cloud-file)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/cloud-file)](https://www.npmjs.com/package/@stone-js/cloud-file)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Release](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](https://github.com/stone-foundation/stone-js-framework/blob/main/SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-framework/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-framework/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-framework/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

**Cloud storage for Stone.js.** Drivers for the agnostic `@stone-js/filesystem` contract, plus a signed-URL contract for direct-to-storage uploads and private downloads. Ships drivers for **S3** (and every S3-compatible store: Cloudflare R2, MinIO, DigitalOcean Spaces, Alibaba OSS, Tencent COS), **Google Cloud Storage** and **Azure Blob**.

---

## Introduction

Your domain talks to the agnostic `FileSystem` contract (`get`/`put`/`delete`/`url`/`readStream`…), never to a cloud SDK. This module supplies the cloud drivers and wires them into the container, so switching or mixing backends (`local`, `s3`, …) is configuration, not code. It also adds a **signed-URL** capability so a client can upload straight to the bucket and download private objects without proxying bytes through your app.

The cloud SDK is **never bundled**: it is an optional peer dependency, imported lazily on first use. Your module stays lean; you install only the SDK for the provider you actually use.

## Installation

```bash
npm install @stone-js/cloud-file

# + the SDK for your provider:
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner   # S3 / R2 / MinIO / Spaces / OSS / COS
npm install @google-cloud/storage                              # Google Cloud Storage
npm install @azure/storage-blob                                # Azure Blob
```

> Peer dependencies: `@stone-js/core`, `@stone-js/filesystem`.

## Usage

Declarative (single disk):

```ts
import { StoneApp } from '@stone-js/core'
import { CloudFile } from '@stone-js/cloud-file'

@CloudFile({ driver: 's3', bucket: 'uploads', region: 'eu-west-3' })
@StoneApp({ name: 'app' })
export class Application {}
```

Imperative / multi-disk via `stone.filesystem`:

```ts
import { defineConfig } from '@stone-js/core'
import { cloudFileBlueprint } from '@stone-js/cloud-file'

export const AppConfig = defineConfig({
  filesystem: {
    default: 's3',
    disks: [
      { name: 's3', driver: 's3', bucket: 'uploads', region: 'eu-west-3' },
      { name: 'r2', driver: 's3', bucket: 'assets', endpoint: 'https://<acct>.r2.cloudflarestorage.com' }
    ]
  }
})
```

Inject the default disk (`fileSystem`) or the manager (`storage`) anywhere:

```ts
export class UploadService {
  constructor (private readonly fileSystem) {}       // the default disk
  async save (path, bytes) { await this.fileSystem.put(path, bytes) }
}
```

## Signed URLs (direct-to-cloud upload)

```ts
// issue a short-lived upload URL; the client PUTs the file straight to storage
const { url, method, headers } = await fileSystem.temporaryUploadUrl('avatars/1.png', {
  contentType: 'image/png',
  expiresIn: 600
})

// later, a private download URL
const link = await fileSystem.temporaryUrl('avatars/1.png', { expiresIn: 60 })
```

Use `supportsSignedUrls(disk)` (from `@stone-js/filesystem`) to feature-detect before calling.

## S3-compatible stores

Point the S3 driver at any S3-compatible endpoint: Cloudflare R2, MinIO (`forcePathStyle: true`), DigitalOcean Spaces, Alibaba OSS, Tencent COS. Set `endpoint` (and `forcePathStyle` where required); everything else is identical.

## Documentation

See the [official documentation](https://stonejs.dev/docs/extensions/cloud-file) for the full guide.

## License

[MIT](./LICENSE)
