---
"@stone-js/cli": patch
---

fix(cli): a plugin's generated file outlives the build that swept its scratch

```
ENOENT: no such file or directory, open '.stone/tmp/plugins/i18n.mjs'
    at LoadPluginContext.load (@stone-js/use-react/dist/cli.js)
    at EnvironmentPluginContainer.load (vite)
```

Reported from a running development server, and the cause is a contradiction between two contracts of ours. `.stone/tmp` is scratch for a build: `BuildTerminatingMiddleware` **deletes it when the build ends**, which is right for something consumed by a bundler and thrown away. But what a plugin generates is imported by the application, so a development server keeps loading it for the whole session, on demand, at transform time. A build finishing next to a dev server therefore removed a module Vite was still serving, in a session that was working a second earlier.

`context.writeFile` now writes under `.stone` instead of `.stone/tmp`, so the conventional `plugins/i18n.mjs` lands at `.stone/plugins/i18n.mjs`, which no build sweeps.

**And `.stone/plugins` is emptied at the start of every run**, never at the end. That is the other half: a directory that outlives a build could serve a module written by a plugin that has since been uninstalled, and an application would keep booting on it. Emptying happens before the plugins run, and even when none are loaded, because a stale file outliving its plugin is exactly the case it exists for.

Nothing changes for a plugin author: `writeFile('plugins/x.mjs')` and `addModule('./plugins/x.mjs')` are written exactly as before. A contributed specifier is still rewritten for whichever entry imports it, and that rewriting now spans two directories instead of one, which a test pins: the same contributed path reaches the same file from a production entry in `.stone/tmp` and from a development entry in `.stone`.

The three first-party plugins that generate a module, `@stone-js/i18n`, `@stone-js/openapi` and `@stone-js/mcp-dev`, are untouched.
