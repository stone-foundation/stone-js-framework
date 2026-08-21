---
"@stone-js/use-react": patch
"@stone-js/cli": patch
---

refactor(use-react): the React renderer now carries its own build

The CLI knew how to build a React application. It shipped Vite, `@vitejs/plugin-react`,
`vite-plugin-babel` and `browserslist` to prove it, and a project that renders nothing on a screen
installed all four. That was backwards: the tool that runs commands does not get to know what a
view is, and the one qualified to answer how React views become an application is the React
renderer.

So the answer moved to where it belongs. `@stone-js/use-react` now owns the React build end to end
(CSR, SSR, SSG, the dev server, the preview server, the console build and the SSG prerender) and
declares it as a CLI plugin, auto-discovered from `stone.cliPlugin`. Installing the renderer is
still all a React project does; the CLI simply no longer pretends to know why.

**The CLI keeps one target, `server`, and its dependency on the renderer is gone.** It was a real
dependency, in a package a backend-only project installs, and removing it also removed the last
cycle in the workspace: `@stone-js/cli` and `@stone-js/use-react` used to depend on each other, so
the order they built in was whatever pnpm decided that day. The renderer builds after the CLI now,
which is the only order that ever made sense.

**Nothing changes for an application.** `stone dev`, `stone build`, `stone preview`, `stone serve`
and `stone build react` behave as before, because the target is registered the same way the native
one is: a config-phase middleware, additive, so a project that declared its own targets keeps them.
This was verified rather than assumed. The three rendering modes were built from the same sources
before and after the move, in both the declarative and the imperative style, and produced the same
set of output files, with the SSG prerender still carrying its rendered markup. The one difference
in the bundles is that a blueprint an application does not reach is now tree-shaken out of it.

**Only a project importing the CLI's React internals has anything to do**, and only if it reached
past the public commands: `ReactBuilder`, the build middleware, `viteConfig`, the entry-point
templates and the SSG helpers are now imported from `@stone-js/use-react/cli` instead of
`@stone-js/cli`. The CLI's own helpers they build on (`isCSR`, `isSSR`, `isSSG`, `isTypescriptApp`,
`generatePublicEnvironmentsFile`, `getStoneBuilderConfig` and the rest) stay where they are.

**One behaviour did change, and for the better: the SSG prerender now runs its SSR server on the
Node that is building.** It spawned `node`, a bare command name resolved through `PATH`, which
decides neither that the interpreter is the one that just produced the bundle nor that the directory
it came from is trustworthy. `process.execPath` answers both. The two SSG lab applications still
pre-render their routes with their markup intact, which is how a wrong interpreter would have shown
itself.

This is the same move the native target already made, applied to the platform that came first. A
module owns its build, the CLI owns none of them, and adding a renderer to the ecosystem no longer
means editing the CLI.
