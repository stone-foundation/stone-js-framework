---
title: Build Phase
---

Before a Stone.js system can run, it must be built.

Stone.js leverages the most recent ECMAScript features, including the [2023-11 decorators proposal](https://github.com/tc39/proposal-decorators), to provide a modern, expressive, and powerful developer experience. However, these features are not yet natively supported across all JavaScript runtimes, which makes the build step essential.

This phase is not part of the Continuum Architecture itself, it’s the preparation step that ensures your code is compatible, optimized, and ready to run *anywhere*.

The build process transforms your source files into deployable artifacts:
- `dist/server.mjs`, the universal entry point for your server or backend app
- `dist/index.html` (and associated assets), the HTML entry point for your frontend (SPA)

Whether you're targeting Node.js, the browser, or serverless platforms, this phase ensures you ship a lightweight and fully functional artifact, with no need for `node_modules` or runtime compilation.

Let’s explore how it works.

## Build Commands

Stone.js projects come with built-in scripts that simplify development and production workflows. These commands are designed to help you iterate quickly in development and produce clean, optimized builds for deployment, with zero runtime dependencies.

These commands are available via the `stone` CLI, which is installed automatically when you set up a Stone.js project using `npm create @stone-js`.

### `npx stone dev` or `npx stone serve`

Launches your system in **development mode** with file watching and automatic restarts or hot module replacement (HMR).  
This is your go-to command while building your app.

- Rebuilds on code changes
- Regenerates the bootstrap file automatically
- Keeps everything hot and ready to go

Great for local development, debugging, and rapid iteration.

### `npx stone build` or `npx stone prod`

Generates the **production build** of your Stone.js system.

This command compiles your source files using:
- **Rollup + Babel** for backend/server logic
- **Vite + Babel** for frontend/client code

It outputs the following in the `dist/` folder:
- `server.mjs`, the production-ready server entry point
- `index.html` (and associated assets), the frontend entry point (for SPAs, SSR, etc.)

These are standalone, tree-shaken artifacts, **no `node_modules`, no `package.json` required**. Just deploy and run.

### `npx stone preview`

Serves the production build locally, exactly as it will behave in your deployment environment.

Use this to:
- Confirm that everything is working after build
- Test your SSR/SPA output before deploying
- Catch environment-specific issues early

::: tip
You can also install the `stone` CLI globally with `npm install -g @stone-js/cli` if you prefer. This way you can run any Stone.js command globally, using `stone <command>` instead of `npx stone <command>`.
:::

Each of these commands plays a distinct role in the Stone.js workflow, but they all lead to the same outcome: a modern system ready to deploy anywhere.

## Rollup + Babel (Backend)

To support modern JavaScript features while producing lightweight, portable artifacts, Stone.js uses [Rollup](https://rollupjs.org) and [Babel](https://babeljs.io) under the hood to build and bundle backend applications.

By default, everything is preconfigured for you, no setup required. But when you need more control, the system is fully extensible.

### Built-in Configuration

Stone.js includes an internal preset configuration that:
- Transpiles your code using Babel (e.g., for decorators, top-level `await`, etc.)
- Bundles everything into a deployable artifact (`dist/server.mjs`)
- Optimizes the output for serverless and universal runtimes

You don’t need to configure Rollup manually unless you have specific needs.

### Full Customization

If you want full access to the underlying Rollup config, you can export the internal setup:

```bash
npx stone export rollup
```

This will generate a file named `rollup.config.mjs` at the root of your project. From there, you can modify the config as needed, just keep in mind that **you’re taking full responsibility** for the changes.

This file exposes two named exports:

```ts title="rollup.config.mjs"
export { rollupBuildConfig, rollupBundleConfig };
```

- `rollupBuildConfig`: Used to compile the source files
- `rollupBundleConfig`: Used to create the production-ready artifact

::: important
If you're overriding this file, be cautious. You’re replacing an engine part, not just tweaking a UI color.
:::

### Light Customization via `stone.config.mjs`

If you only need to tweak or extend the config (e.g. to add a Rollup or Babel plugin), you don’t have to override the entire config file. Instead, use the `rollup` key in `stone.config.mjs`:

```js title="stone.config.mjs"
import { defineConfig } from '@stone-js/cli'

export default defineConfig({
  rollup: {
    build: {
      plugins: [
        /* Add Rollup plugins for build */
      ]
    },
    bundle: {
      plugins: [
        /* Add Rollup plugins for bundling */
      ]
    }
  }
})
```

This approach **extends or overrides** the built-in config without replacing it entirely, giving you control **without sacrificing stability**.

This dual-level customization, presets by default, escape hatch when needed, is part of Stone.js’s commitment to flexibility without complexity.

## Vite + Babel (Frontend)

For frontend applications, Stone.js uses [Vite](https://vite.dev) and [Babel](https://babeljs.io) to provide a fast, modern development experience while supporting the latest JavaScript features, including decorators, top-level `await`, and more.

Vite handles your client-side code with lightning-fast hot module replacement in dev mode and optimized bundling for production. Babel ensures compatibility with cutting-edge ECMAScript syntax.

Like the backend build process, everything is configured out of the box, but fully customizable when needed.

### Built-in Configuration

Stone.js ships with an internal Vite configuration that:
- Supports the latest ECMAScript features
- Automatically integrates with the rest of your Stone.js project
- Bundles the frontend into `dist/index.html` (and associated assets) for SPA or SSR deployment

No manual setup is required, just run `npx stone dev` or `npx stone build` and you're good to go.

### Full Customization

If you need to take full control over the Vite configuration, you can export it:

```bash
npx stone export vite
```

This command creates a `vite.config.js` file at the root of your project.

It exposes a single named export:

```ts title="vite.config.js"
export const viteConfig = { ... }
```

From there, you can customize your Vite setup however you like, but remember: **you’re bypassing the built-in safety net**, so proceed only if you know what you're doing.

### Light Customization via `stone.config.mjs`

For most use cases, you don’t need to override the entire Vite config. Instead, you can extend it safely from your `stone.config.mjs` file using the `vite` key:

```js title="stone.config.mjs"
import { defineConfig } from '@stone-js/cli'

export default defineConfig({
  vite: {
    plugins: [
      /* Add your custom Vite plugins here */
    ]
  }
})
```

This method lets you plug into the system without replacing it, a clean way to extend functionality while preserving the Stone.js defaults.

This flexible system, one command to eject, one config to extend, is designed to meet you where you are, whether you're building a simple SPA or pushing the boundaries of SSR and edge rendering.

## Stone Config File (`stone.config.mjs`)

In Stone.js, the `stone.config.mjs` file defines how your **system** is built and bundled, across all dimensions of your continuum.

This configuration exists **only at build-time**. It does not affect runtime behavior, middleware, lifecycle hooks, or any runtime execution flow. Its sole job is to shape your application artifact: what is included, how it is bundled, and how it is optimized for deployment.

### Why it matters

Stone.js applications are continuum-native, designed to be deployed anywhere. To achieve this, the build system must:
- Support both frontend and backend targets
- Handle multiple module types and application types
- Strip away unnecessary context (e.g. Node-only modules from the browser build)
- Output a clean, deployable artifact (`dist/server.mjs`, `dist/index.html`)  

This file is where you configure *how* that happens.

### Extending the Default Builder

Stone.js comes with a powerful default builder, but you can override or extend it by modifying `stone.config.mjs` at the root of your project.

::: important
This file is optional and does not exist by default in your project. You can create it when you need to customize the build process.
:::

Here’s a simple example:

```js title="stone.config.mjs"
import { defineConfig } from '@stone-js/cli'

export default defineConfig({
  target: 'react',
  rendering: 'ssr',
  imperative: true,
  language: 'typescript',
  input: {
    all: 'src/**/*.ts',
    views: 'src/**/*.tsx',
    mainCSS: 'src/styles/main.css'
  },
  rollup: {
    build: { plugins: [] }, // RollupOptions
    bundle: { plugins: [] } // RollupOptions
  },
  vite: { plugins: [] } // UserConfig
})
```

### Main Configuration Options

Below is a breakdown of the most important options in the `BuilderConfig` interface.

#### `language`
Specify whether you're using `javascript` or `typescript`.

#### `target`
Defines what kind of application you're building:
- `react` (SPA/SSR frontend)
- `vue` (SPA/SSR frontend, Coming soon)
- `service` (backend or microservice)

This helps Stone.js infer how to optimize your bundles.

#### `rendering`
Defines the rendering strategy for your frontend application:
- `csr` (Client-Side Rendering)
- `ssr` (Server-Side Rendering)
- `ssg` (Static Site Generation, coming soon)

#### `lazy`
Set to `true` if your system uses **lazy-loading** for views or modules.  
This allows Stone.js to optimize the build by splitting your application into smaller chunks that can be loaded on demand, improving performance and reducing initial load times.

#### `imperative`
Set to `true` if your system uses the **imperative API style**.  
This helps Stone.js make optimizations based on code introspection strategies.

#### `dotenv`
Customize how environment variables are loaded using the dotenv strategy.

#### `input`
Control what gets included and how modules are grouped during build:

```ts
input: {
  all: 'src/**/*.ts',           // All modules
  app: 'src/**/*.ts',           // Business logic (excluding views)
  views: 'src/**/*.tsx',        // Lazy-loadable views
  mainCSS: 'assets/styles.css'  // Main stylesheet
}
```

#### `output`
Specify a custom output path for the final artifact (`server.mjs`, `index.html`).

#### `watcher`
Ignore paths during development watching (e.g., `node_modules`, `dist`).

```ts
watcher: {
  ignore: ['node_modules', 'dist']
}
```

#### `rollup`
Customize Rollup’s build and bundle options individually:

```ts
rollup: {
  build: { plugins: [...] },   // Used to transpile the code
  bundle: { plugins: [...] }   // Used to bundle the final output
}
```

Use this to extend or override internal presets, without replacing them entirely.

#### `vite`
Extend the frontend bundling process for CSR/SSR apps by injecting plugins or custom settings into the internal Vite config:

```ts
vite: {
  plugins: [...]
}
```

Stone.js gives you control where you need it, and safety where you don't.  
The `stone.config.mjs` is your **build-time command center**, shaping how your application continuum turns into a portable artifact, ready for any platform.

## Custom Bootstrap File

Every Stone.js system begins with a **bootstrap file**, a special entry point used during the build to assemble and initialize your continuum system.

This file isn't created manually and doesn’t appear in your project by default. Instead, it's auto-generated internally when you run dev or build commands. Each environment (server, client, console) has its own dedicated bootstrap file.

### Default Bootstrap Targets

| Environment      | Bootstrap File                                       |
| ---------------- | ---------------------------------------------------- |
| Server-side apps | `.stone/server.mjs` or `.ts`                         |
| Console apps     | `.stone/console.mjs` or `.ts`                        |
| Frontend apps    | `.stone/index.html` and `.stone/client.mjs` or `.ts` |

These files are generated automatically and used to:
- Wire together your system's configuration
- Import modules in the correct order
- Instantiate and launch your system

### Customization

Need to inject a global script? Set up analytics? Override the launch logic?

You can export and customize your bootstrap file using:

```bash
npx stone export app
```

Stone.js will intelligently detect whether your project is a **frontend** or **backend** project and generate the appropriate bootstrap file(s) at the root. 
e.g., `index.html`, `client.mjs`, and `server.mjs` (or `.ts` if your project uses TypeScript).

If want to export the **console** bootstrap file, you can do so with:

```bash
npx stone export console
```

This will export the console-specific bootstrap logic as `console.mjs` (or `.ts` if your project uses TypeScript).

Once exported, these files become your responsibility, but also your canvas. Stone.js will now use *your custom bootstrap file* instead of the internal one.

### Why It Matters

Sometimes you need to:
- Import global polyfills or third-party scripts
- Execute logic before the system runs
- Inject global context variables
- Set up loggers, monitors, or debug tools

This is where the bootstrap file shines.  
It’s your one and only **entry point to the system**, and it runs **before anything else** in the continuum.

### Caution

The exported bootstrap file is **not regenerated automatically**.  
Once exported, it becomes a persistent part of your project.  
**Do not modify internal `.stone` bootstrap files directly**, use the exported versions instead, as they are auto-generated and overwritten on every build.

In short, the bootstrap file is the **top-level trigger of your system**.  
It’s where the continuum awakens, and yes, you can customize it.

## Best Practices & Summary

The build phase in Stone.js is simple by design, but powerful under the hood. It ensures your **continuum system** is transformed into a clean, portable artifact that’s ready to run in any context: browser, server, or function-as-a-service.

### Best Practices

- Use `stone.config.mjs` **only for build configuration**, not runtime logic.
- Do not use it to inject runtime logic, that’s what middleware, decorators, and lifecycle hooks are for
- Keep your `input` patterns clean and modular, this helps the system split views from core logic (useful for lazy loading and micro apps)
- Be mindful of exclusions, especially in browser builds, to avoid bundling server-only modules
- Extend internal configs (Rollup/Vite) via `stone.config.mjs` instead of overriding them when possible.
- Only export full configs with `npx stone export rollup/vite` if you have advanced needs.
- Export your bootstrap file with `npx stone export app` or `npx stone export console` **only if you need** top-level control.
- Never edit files inside `.stone/` manually, they’re overwritten during each build.

### Summary

Here’s what to remember:

- **Why build?**  
  To use the latest ECMAScript features (e.g., [decorators 2023-11](https://github.com/tc39/proposal-decorators)) and produce a universal, context-free deployment artifact.

- **What does it produce?**  
  - `dist/server.mjs` for server-side and backend systems  
  - `dist/index.html` (+ assets) for frontend apps

- **How does it work?**  
  - Uses **Rollup + Babel** for backend
  - Uses **Vite + Babel** for frontend
  - Controlled by `stone.config.mjs` and optional custom bootstrap files

Stone.js gives you full control over how your system is built, but only when you need it.  
Stick with the defaults to move fast, and customize only when your use case demands it.

Now that your system is built…  
Let’s see what happens when it runs.
