---
"@stone-js/cli": patch
---

Fail the build when a .tsx file carries app-level decorators (@StoneApp, @Browser, @UseReact, @Configuration, @Provider) and lazy views are on. The check runs in GenerateClientFileMiddleware and throws a CliError that names the file and explains the fix.
