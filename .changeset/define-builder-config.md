---
'@stone-js/cli': patch
---

The build manifest is configured with `defineBuilderConfig`.

`@stone-js/cli` exported `defineConfig`, and so does `@stone-js/core` — one shapes the build, the
other configures the application. The clash read fine in a document and badly in an editor: both
packages sit in the same project, so an auto-import could pick the build one inside `app/`, where the
application would simply never read what it returned. A silent misconfiguration is a poor price for a
shared word.

The name now matches what it writes: `stone.builder.*`, typed `BuilderConfig`. Rename the import in
`stone.config.mjs` and nothing else changes.

```js
import { defineBuilderConfig } from '@stone-js/cli'

export default defineBuilderConfig({ rendering: 'ssg' })
```
