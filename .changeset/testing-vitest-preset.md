---
"@stone-js/testing": patch
"@stone-js/cli": patch
---

feat(testing): the decorator semantics a runner needs, published

A project that keeps its own Vitest config, a monorepo with one shared config or an application running unit tests straight from Vitest, does not go through `stone test` and fails on the first decorated class it imports:

```
SetupError: Class decorators must be used with the 2023-11 decorators proposal.
```

The fix is two options, and until now they lived in a private method of a CLI command, so every such project had to rediscover them by reading our source or by hitting the error. They are published:

```ts
import { defineConfig } from 'vitest/config'
import { decoratorSemantics } from '@stone-js/testing/vitest'

export default defineConfig({
  esbuild: decoratorSemantics,
  test: { globals: true, include: ['tests/**/*.spec.ts'] }
})
```

Its own entry point, `@stone-js/testing/vitest`, because a runner config is loaded before anything else and has no business pulling the test client, the adapter and their platform peers with it. Verified on a scaffolded application: a decorated class fails under a bare `vitest run` and passes with that import and nothing else.

`stone test` still writes the same two options into the config it generates, and keeps writing them out rather than importing them, because a CLI generating a config must not require a package the project may not have installed. The two are held together by a test on each side asserting the same value, so they cannot drift into two answers.

This buys the decorators and nothing more. `.env.test` loaded before the runner starts, and the build's own file set handed to the test process, are what `stone test` adds on top, so an integration suite is still better off going through it.
