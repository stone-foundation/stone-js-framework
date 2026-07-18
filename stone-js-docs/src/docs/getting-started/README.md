---
title: Installation
---

Stone.js is a Node.js framework requiring **JavaScript** or **TypeScript** skills and Node.js installation.

Oh! I forgot! First of all, you need a computer.

Ensure you have:
- At least the latest version of [Node.js v18](https://nodejs.org/download/release/v18.19.0/)
- A package manager like `npm`, `yarn` or `pnpm`

Verify Node.js installation:

```sh
node -v
```

If not installed, download from [nodejs.org](https://nodejs.org/en/download). For multiple Node.js versions, consider [Node Version Manager](https://github.com/nvm-sh/nvm).

## Creating a New Project

Create a new Stone.js project using one of these:
- [npm create](https://docs.npmjs.com/cli/v10/commands/npm-init)
- [yarn create](https://classic.yarnpkg.com/lang/en/docs/cli/create/)
- [pnpm create](https://pnpm.io/cli/create)

Execute from the console:

::: code-tabs#shell

@tab:active npm

```bash
npm create @stone-js hello-world
```

@tab yarn

```bash
yarn create @stone-js hello-world
```

@tab pnpm

```bash
pnpm create @stone-js hello-world
```
:::

You can create a Stone.js project with default configurations by skipping the initialization steps:

::: code-tabs#shell

@tab:active npm

```bash
npm create @stone-js hello-world -- -y
```

@tab yarn

```bash
yarn create @stone-js hello-world -y
```

@tab pnpm

```bash
pnpm create @stone-js hello-world -y
```
:::

## Project Initialization Steps

After executing the command to create a new Stone.js project, you'll be guided through a questionnaire. 
This questionnaire helps tailor the project setup to your specific needs by asking about various configuration options.

### Project Name

Specify the directory name (must be empty).

Alternatively, run the command in the current directory:

::: code-tabs#shell

@tab:active npm

```bash
npm create @stone-js .
```

@tab yarn

```bash
yarn create @stone-js .
```

@tab pnpm

```bash
pnpm create @stone-js .
```
:::

### Typings
Choose between:
- `None (Vanilla)` for JavaScript.
- `TypeScript` for TypeScript support.

### Template Selection

Choose a starter template, they are grouped by their complexity and features:
- `Basic`: A basic template with no additional features.
- `Standard`: For medium-sized systems with common features like routing, and middleware.
- `Full`: A full-featured template with advanced features database, authentication, and more.

### Package Manager
Select:
- `npm`
- `yarn`
- `pnpm`

### Modules
Add needed modules during project creation or later.

### Testing Framework
Choose:
- `vitest` for [vitest](https://vitest.dev/).
- `None` for no testing framework.

### Initialize Git
Optionally initialize a Git repository.

## Running Your App

After completing the questionnaire, you can start in development mode:

::: code-tabs#shell

@tab:active npm
```bash
npm run dev
```

@tab yarn

```bash
yarn dev
```

@tab pnpm

```bash
pnpm dev
```
:::

## Build for Production

Stone.js needs to be compiled and bundled due to its use of advanced features not yet supported by all **JavaScript** engines. Bundling eliminates the need for `node_modules`, creating a single deployable file. During the bundling process, tree shaking ensures only used modules are included, resulting in a lightweight build.

The build output will be in the `dist` folder and could contain:
- `dist/index.html` for client side project
- `dist/server.mjs` for any server side project

ready for deployment anywhere.

Build your project:

::: code-tabs#shell

@tab:active npm
```bash
npm run build
```

@tab yarn

```bash
yarn build
```

@tab pnpm

```bash
pnpm build
```
:::

## Preview the Production Build

Preview your build as it would be in production. This is useful for testing the production build before deploying it:

::: code-tabs#shell

@tab:active npm
```bash
npm run preview
```

@tab yarn

```bash
yarn preview
```

@tab pnpm

```bash
pnpm preview
```
:::

## Launch the Production Build

Run your build as a standalone Node.js system, with no `node_modules` nor `package.json`:

```sh
node server.mjs
```

Or deploy it on any serverless platform using an appropriate adapter, which we will discuss later.

## Manual installation

Wanna start your Stone.js app from scratch, like a true master of the continuum? No problem. Here's how to go fully manual and configure everything yourself, step by step.

Whether you're building a backend service, a single-page frontend, or a full-stack universal app, Stone.js has your back. The following guide walks you through setting up a minimal project with either the **declarative** or **imperative** API.

---

### Step 1: Create `package.json`

Start by initializing your Node.js project:

```bash
npm init -y
```

---

### Step 2: Install the Dependencies

#### Backend (e.g. REST API, microservice)

Install the Stone.js core, the Node.js HTTP adapter, and the CLI:

```bash
npm i @stone-js/core @stone-js/node-http-adapter
```

#### Frontend (React SPA)

If you're building a React single-page system:

```bash
npm i react react-dom @stone-js/core @stone-js/use-react @stone-js/browser-adapter
```

#### Dev Dependencies

Stone.js uses decorators (yes, the fancy JS feature), so you'll need Babel plugins:

```bash
npm i -D @babel/plugin-proposal-decorators @babel/preset-env @stone-js/cli
```

Using TypeScript? Of course you are, you’re classy.

```bash
npm i -D @babel/preset-typescript @types/node @types/react @types/react-dom
```

---

### Step 3: Add CLI Scripts

Let’s wire up the `stone` CLI so you can build and run your app with style:

```json
{
  "scripts": {
    "dev": "stone dev",
    "build": "stone build",
    "preview": "stone preview"
  }
}
```

Now you’re ready to develop, bundle, and preview your app using just a command.

---

### Step 4: Create Your System Entry Point

Create your system entry point in the `app/` folder. You can name it whatever you want (`Application.ts`, `main.jsx`, `index.js`, etc.) as long as it lives inside `app/`.

Stone.js will detect it automatically as your app’s root.

---

### Option 1: Declarative API (Decorator Style)

The declarative API lets you define your app with decorators like `@StoneApp()` and platform-specific adapters like `@NodeHttp()` or `@Browser()`.

#### Example: Backend App

```ts title="app/Application.ts"
import { NodeHttp } from "@stone-js/node-http-adapter"
import { IncomingEvent, IEventHandler, StoneApp } from "@stone-js/core"

@NodeHttp()
@StoneApp()
export class Application implements IEventHandler<IncomingEvent> {
  handle(event: IncomingEvent): { message: string } {
    return { message: "Hello world!" }
  }
}
```

#### Example: React App

```tsx title="app/Application.tsx"
import { ReactNode } from "react"
import { StoneApp } from "@stone-js/core"
import { Browser } from "@stone-js/browser-adapter"
import { UseReact, IPage, ReactIncomingEvent } from "@stone-js/use-react"

@Browser()
@UseReact()
@StoneApp()
export class Application implements IPage<ReactIncomingEvent> {
  render(): ReactNode {
    return <h1>Hello world!</h1>
  }
}
```

::: tip
You can use regular JavaScript too, just remove the types and keep the logic!
:::


### Option 2: Imperative API (Full Control)

Prefer functional programming or need fine-grained control? Stone.js has your back with its imperative API using blueprints.

#### Example: Backend App

```ts title="app/Application.ts"
import { defineStoneApp, IncomingEvent } from "@stone-js/core"
import { nodeHttpAdapterBlueprint } from "@stone-js/node-http-adapter"

export const handler = () => (event: IncomingEvent) => ({ message: "Hello world!" })

export const Application = defineStoneApp(
  handler,
  {},
  [nodeHttpAdapterBlueprint]
)
```

#### Example: React App

```tsx title="app/Application.tsx"
import { browserAdapterBlueprint } from "@stone-js/browser-adapter"
import { defineStoneReactApp, useReactBlueprint } from "@stone-js/use-react"

export const handler = () => ({
  render: () => <h1>Hello world!</h1>
})

export const Application = defineStoneReactApp(
  handler,
  {},
  [useReactBlueprint, browserAdapterBlueprint]
)
```

---

### Optional: TypeScript Config

If you're using TypeScript, create a `tsconfig.json` file and configure it to support decorators and JSX (for frontend apps). You can look at [Stone.js starter templates](https://github.com/stone-foundation/stone-js-starters) for inspiration.

---

### Step 5: Run the App

Use the CLI scripts defined earlier to develop, build, and preview your app:

```bash
npm run dev       # Launch the dev server
npm run build     # Build your app
npm run preview   # Preview the build output
```

---

### That's It!

You’re now fully set up to build a **modern**, **cloud-native**, and **context-aware** system with Stone.js.

Start small, think big, and deploy anywhere, because in Stone.js, **everything is a continuum**.
