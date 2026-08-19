---
"@stone-js/cli": patch
---

fix(cli): stop warning about optional peers the project did not install

Every consumer build printed `"js-yaml" is imported by "@stone-js/config-source" but could not be resolved - treating it as an external dependency`, even with no YAML source in sight. The import is already lazy; Rollup simply sees a specifier it cannot resolve.

Nine packages ship optional peers (`js-yaml`, `ioredis`, `ws`, the AWS/GCP/Azure SDKs...), each imported behind the branch that needs it so an app pays only for what it uses, so the same noise appeared for cache, queue, realtime, cloud-file, event-bus and the WebSocket adapters. The builder now treats an optional peer as external exactly when the project has not installed it, which is what the warning suggested anyway. An installed optional peer keeps its normal resolution.
