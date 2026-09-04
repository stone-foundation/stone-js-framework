---
"@stone-js/use-react": patch
---

fix(use-react): `stone dev` starts again for a React application

The generated dev-server entry imported `runDevServer` from `@stone-js/cli`. Both runners moved into this package when it took over the React build, and the template kept naming the package it had left, so every `stone dev` of a React application died before a single line of the application ran:

```
import { runDevServer } from '@stone-js/cli'
SyntaxError: The requested module '@stone-js/cli' does not provide an export named 'runDevServer'
```

Reproduced on the published starter, and it has been broken since the build moved, not since the last release. Nothing caught it because no test starts a dev server, and the generated file is only ever executed by one. The two tests that covered this template asserted the import **as a string**, which is why they stayed green through the move; they now check the specifier and the name against the module itself, so renaming or moving a runner fails in the suite instead of at the first `stone dev` somebody runs.
