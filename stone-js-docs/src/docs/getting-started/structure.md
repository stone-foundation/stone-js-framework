---
title: Project Structure
---

Understanding how to organize a Stone.js project is like understanding the flow of time in the Continuum, it's not mandatory, but it makes everything smoother, clearer, and a lot more fun.

Stone.js follows a philosophy we call **Adaptive Convention Configuration**. That means we provide smart, flexible defaults to get you started quickly, but in the end, **the convention is yours**. You and your team own how things are structured, named, and organized. Follow our guide, rewrite it, remix it, either way, **the context belongs to you**.

Here’s a typical layout for a Stone.js project that balances backend, frontend, and fullstack needs while being ready for liftoff (Node? Lambda? Browser? All of the above?).

## Root Directory

This is where your app declares its identity to the world (and to the build system). Some files are always present, others show up only when you need them.

| File/Folder                                                   | Purpose                                                            |
| ------------------------------------------------------------- | ------------------------------------------------------------------ |
| `stone.config.mjs`                                            | Optional Stone.js build config using `defineConfig`.               |
| `vite.config.js`                                              | Optional Vite config for frontend builds.                          |
| `rollup.config.mjs`                                           | Optional Rollup config for custom server builds.                   |
| `vitest.config.js`                                            | Optional Vitest config for test runners.                           |
| `tsconfig.json`                                               | TypeScript configuration, required if you're using TypeScript.     |
| `.env`                                                        | Local environment variables, we love `.env` like devs love coffee. |
| `app/`                                                        | Your domain logic lives here.                                      |
| `public/`                                                     | Static files (images, fonts, etc.) for frontend apps.              |
| `assets/`                                                     | Processed static assets, bundled, optimized, the works.            |
| `tests/`                                                      | Your automated test suites. Vitest-friendly.                       |
| `dist/`                                                       | Output directory after build.                                      |
| `dist/server.mjs`                                             | Your production server (when deploying backend/fullstack/SSR).     |
| `dist/index.html`                                             | Your built frontend entrypoint (for SPA).                          |
| <span style="text-decoration: line-through;">`.stone/`</span> | Temporary dev artifacts and cache. You can ignore this one, we do. |


## `stone.config.mjs` (Optional)

This file lets you fully customize the build process of your Stone.js app, inputs, outputs, excluded modules, and more.

```js title="stone.config.mjs"
import { defineConfig } from '@stone-js/cli'

export default defineConfig({
  target: 'service',
  language: 'typescript',
  imperative: true,
  input: {
    all: 'app/**/*.ts'
  },
  output: 'server.mjs'
})
```

Not using custom builds yet? No worries. This file is optional. But when you're ready to deploy to multiple environments or exclude platform-specific code, it's your new best friend.


## `app/` Directory

This is where the magic happens, your domain's **core logic** lives here. Routes, services, views, handlers, whatever powers your app, it lives in `app/`.

Stone.js doesn’t force a rigid structure. Instead, it gives you **freedom with intention**. The only convention we suggest is this:

👉 You must define **a single app entry point**, name it however you want (`Application.ts`, `MainApp.ts`, `MyUnicornApp.ts`), as long as it does one of the following:

- **Declarative API**: Export a class decorated with `@StoneApp()`.
- **Imperative API**: Export your created app using `defineStoneApp()`.

Even the folder name `app/` is just a suggestion, feel free to rename it to match your project’s domain or your team’s naming conventions. *You own the structure. You own the context.*

After that? Organize your files, folders, and features however suits your domain. Stone.js adapts to your logic, not the other way around.

### Example structure:

```bash
app/
└── Application.ts (or .mjs, or whatever-you-want.ts)
```

### Declarative API Example

```ts title="app/Application.ts"
import { StoneApp } from "@stone-js/core"

@StoneApp()
export class Application {
  // Start with something cool here.
}
```

### Imperative API Example

```ts title="app/Application.ts"
import { defineStoneApp } from "@stone-js/core"

export const Application = defineStoneApp(() => {
  // Start with something cool here.
})
```

Stone.js will detect the proper entrypoint automatically. You define the intent, we adapt to your context. That's the continuum in action.


## `tests/` Directory

Where all your brilliant ideas are *proven to work*. Organize your tests however you like, we recommend grouping by feature or module. Stone.js pairs nicely with [Vitest](https://vitest.dev/), and yes, 100% coverage is possible (and encouraged, be a testing hero).


## A Few Extra Notes

- The `public/` and `assets/` folders are only used when you’re building frontend apps (SPA or SSR).
- The `dist/` folder is the final artifact, the thing you deploy.
- The `.stone/` folder? It’s where we hide our build cache, dev bundles, and a few secrets. You can safely ignore it.


## Customize Everything (Because Context Changes)

Stone.js doesn't lock you into any structure. The above layout is **recommended**, but you're free to adapt, remix, and reorganize based on your context, your app type, and your deployment target. Thanks to the [Continuum Architecture](../architecture/continuum.md), everything stays consistent across environments.

So go ahead, **declare your intentions**, keep your contexts clear, and let your project evolve like a true continuum.
