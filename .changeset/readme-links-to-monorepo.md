---
'@stone-js/aws-lambda-adapter': patch
'@stone-js/aws-lambda-http-adapter': patch
'@stone-js/browser-adapter': patch
'@stone-js/browser-core': patch
'@stone-js/cli': patch
'@stone-js/config': patch
'@stone-js/core': patch
'@stone-js/env': patch
'@stone-js/filesystem': patch
'@stone-js/http-core': patch
'@stone-js/node-cli-adapter': patch
'@stone-js/node-http-adapter': patch
'@stone-js/pipeline': patch
'@stone-js/router': patch
'@stone-js/service-container': patch
'@stone-js/starters': patch
'@stone-js/use-react': patch
'@stone-js/use-view': patch
---

Point every README link at somewhere that exists.

The per-module repositories were retired when the framework moved to a single one, so 36 links
across 18 READMEs answered with a 404: the exact links a newcomer clicks first, "Contributing"
and "API". The contributing guide now points at the monorepo, and the API reference at the
published one.

`docs/` was never a durable target either, retired repository or not: it is TypeDoc output, and
every build begins by deleting it.
