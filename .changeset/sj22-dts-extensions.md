---
"@stone-js/alibaba-fc-adapter": patch
"@stone-js/alibaba-fc-http-adapter": patch
"@stone-js/auth": patch
"@stone-js/authz": patch
"@stone-js/aws-apigw-ws-adapter": patch
"@stone-js/aws-lambda-adapter": patch
"@stone-js/aws-lambda-http-adapter": patch
"@stone-js/azure-functions-adapter": patch
"@stone-js/azure-functions-http-adapter": patch
"@stone-js/blog-starters": patch
"@stone-js/browser-adapter": patch
"@stone-js/browser-core": patch
"@stone-js/cache": patch
"@stone-js/cli": patch
"@stone-js/cloud-file": patch
"@stone-js/config": patch
"@stone-js/config-source": patch
"@stone-js/core": patch
"@stone-js/edge-adapter": patch
"@stone-js/env": patch
"@stone-js/event-bus": patch
"@stone-js/fetch-adapter": patch
"@stone-js/filesystem": patch
"@stone-js/gcp-cloud-functions-adapter": patch
"@stone-js/gcp-cloud-functions-http-adapter": patch
"@stone-js/http-core": patch
"@stone-js/i18n": patch
"@stone-js/mcp-dev": patch
"@stone-js/node-cli-adapter": patch
"@stone-js/node-http-adapter": patch
"@stone-js/node-ws-adapter": patch
"@stone-js/openapi": patch
"@stone-js/pipeline": patch
"@stone-js/queue": patch
"@stone-js/realtime": patch
"@stone-js/resources": patch
"@stone-js/router": patch
"@stone-js/service-container": patch
"@stone-js/starters": patch
"@stone-js/telemetry": patch
"@stone-js/tencent-scf-adapter": patch
"@stone-js/tencent-scf-http-adapter": patch
"@stone-js/testing": patch
"@stone-js/use-react": patch
"@stone-js/use-view": patch
"@stone-js/validation": patch
---

fix(build): published declarations carry explicit `.js` extensions

Our sources are bundler-style (extensionless relative imports) and `tsc` reproduces what they wrote. In a published ESM package with an `exports` map, a consumer on `moduleResolution: nodenext` cannot resolve those specifiers, so the types of everything they re-export become **invisible**. The reported symptom was misleading: `error TS2305: Module '"@stone-js/use-react"' has no exported member 'useContainer'`, which reads as "the hook does not exist" rather than "the module was not resolved". A pilot project hit it on `@stone-js/use-react` and worked around it with `moduleResolution: "bundler"`, which is right for bundled code but wrong for a pure Node ESM consumer.

The shared build now rewrites relative specifiers in every emitted declaration (`<file>.js`, or `<dir>/index.js` for a directory), and the generated barrel emits them the same way. `@stone-js/use-view`, which carries its own rollup config, was wired to the same plugin.

Verified across 635 declaration files: zero extensionless relative imports, and a `moduleResolution: nodenext` consumer importing `useContainer` / `useBlueprint` typechecks clean where it previously reported 138 errors. A `pnpm run check:dts` guard runs in CI right after the build so this cannot regress, including for a package that grows its own build config.
