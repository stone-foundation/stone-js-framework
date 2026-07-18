---
title: React
prev: ../router/misc
---

React is one of the most popular libraries for building user interfaces. It focuses entirely on the view layer, leaving the rest of the application structure up to you.

This is where Stone.js comes in.

Stone.js doesn’t modify React or ask you to change how you use it. Instead, it creates the environment around React: handling routing, page lifecycle, request/response handling, layouts, and rendering, whether you're building a single-page app, server-rendered interface, or a fullstack system.

You keep using React as you know it. Stone.js simply gives it a structure to live in, grow in, and adapt to different runtimes with ease.

This documentation is focused on showing you how to use React with Stone.js. It’s not a React tutorial, it’s a guide to merging your React knowledge with the Stone.js ecosystem.

::: important
If you’re new to React, check out the [official React documentation](https://reactjs.org/docs/getting-started.html) before diving in.
:::

## **Why React stays React**

In Stone.js, React remains exactly what it is: a library for building user interfaces. You don’t need to learn a new templating language, or adapt your mental model. No wrappers. No reinvented components. No new syntax.

You write React components, just like you always do.

What Stone.js brings is not a rewrite of React, but an extension of what React can do in a full application context: request handling, routing, SSR, layouts, middleware, dependency injection, and deployment flexibility, without ever touching your components.

React handles the UI. Stone.js handles the system. Together, they form a complete and composable continuum.

If you already know how to build a React app, you won’t have to unlearn anything. You’ll just learn how to **merge** your React knowledge with Stone.js features.  
That’s the Stone.js way: **augment, not replace**.

## **Installing required packages**

React isn’t bundled with Stone.js by default, and there’s a good reason for that.

In the Continuum Architecture, a library is a tool, not a foundation. You install it when you need it, use it where it makes sense, and integrate it without compromise. Stone.js doesn’t assume how you want to build your UI, it simply gives you the architecture to support it.

Other platforms may create an entire framework around React, treating it as the core of the system. But in reality, React is just the view layer. You don’t need to wrap it in a framework, you need to **connect it to one**.

::: important
You don't need to install React if your React app was created with the Stone.js CLI. The CLI automatically installs React and the required packages for you.
:::

To use React with Stone.js, just install the parts you need:

```bash
npm install react react-dom @stone-js/use-react @stone-js/browser-adapter
```

Here’s what each package does:

* `react` and `react-dom`: the standard React packages.
* `@stone-js/use-react`: the bridge that allows Stone.js to render and orchestrate React components.
* `@stone-js/browser-adapter`: enables Stone.js to run your application in the browser as a CSR/SPA app.

This way, you stay in control. React remains React. And your architecture stays sound.

## **Activating React support**

Once your packages are installed, the next step is to **activate React and the browser adapter** inside your Stone.js application.

You can do this in two ways: using the **declarative API** or the **imperative API**. Both approaches achieve the same result, choose the one that best fits your style or your project structure.

::: tabs#declarative-imperative
@tab:active Declarative
#### Declarative API

If you're building your app using class-based modules, the declarative API offers the most concise and readable approach.

You simply decorate your main application class with `@UseReact()` to enable React support, and `@Browser()` to run the app in a browser environment.

```ts
import { StoneApp } from '@stone-js/core'
import { UseReact } from '@stone-js/use-react'
import { Browser } from '@stone-js/browser-adapter'

@Browser()
@StoneApp()
@UseReact()
export class Application {}
```

These decorators wire everything up: the adapter, the initialization dimension, and the full request lifecycle. Your app is now ready to use React as its rendering engine.

@tab Imperative

#### Imperative API

Prefer a more functional or flexible setup? The imperative API lets you wire everything manually via blueprint configuration.

This is especially useful when working in factory-based setups or when you want more control over registration order and dynamic composition.

```ts
import { browserAdapterBlueprint } from '@stone-js/browser-adapter'
import { defineBlueprintConfig, IBlueprint, stoneBlueprint } from '@stone-js/core'
import { useReactBlueprint, defineComponentEventHandler } from  '@stone-js/use-react'

export const Application = () => {
  // Your React app logic
}

export const AppBlueprint = defineBlueprintConfig((blueprint: IBlueprint) => {
  blueprint
    .set(stoneBlueprint)
    .set(useReactBlueprint)
    .set(browserAdapterBlueprint)
    .set(defineComponentEventHandler(Application, true))
})
```
:::

In both approaches, the outcome is the same: **React becomes a first-class citizen in your application**, without compromising structure, runtime clarity, or deployment flexibility.

## **Understanding Adapters: CSR, SSR, and SOR**

Stone.js uses **adapters** to determine how your application behaves at runtime. Whether it renders in the browser, on the server, or both, **you don’t change your code**, you just configure the adapter.

This flexibility means you can build:

* A **CSR** (Client-Side Rendered) that runs entirely in the browser
* A **SSR** (Server-Side Rendered) app that renders HTML on the server and hydrates it in the browser
* A **SOR** (Server-Only Rendered) app that renders everything server-side with no client-side React runtime

Let’s break them down.

::: tabs#app-rendering
@tab:active CSR
### Client-Side Rendering (CSR)

For browser-only applications, dashboards, admin tools, or lightweight frontends, you can use the browser adapter alone.

```ts
import { StoneApp } from '@stone-js/core'
import { UseReact } from '@stone-js/use-react'
import { Browser } from '@stone-js/browser-adapter'

@Browser()
@StoneApp()
@UseReact()
export class Application {}
```

This setup gives you a fully client-side React app. Stone.js handles routing, page lifecycle, 
and modular architecture, React handles rendering and events in the DOM.

@tab SSR
### Server-Side Rendering (SSR)

When you want both performance and dynamic content, use both a browser and a server adapter.

This enables:

* Server-rendered HTML with data already present
* Client-side hydration for full interactivity
* Snapshot-based data transfer to avoid re-fetching

```ts
import { StoneApp } from '@stone-js/core'
import { UseReact } from '@stone-js/use-react'
import { Browser } from '@stone-js/browser-adapter'
import { NodeHttp } from '@stone-js/node-http-adapter'

@Browser()
@NodeHttp()
@StoneApp()
@UseReact()
export class Application {}
```

SSR is ideal for marketing sites, e-commerce, or SEO-sensitive content, where the initial render happens on the server, but the app remains interactive on the client.

@tab SOR
### Server-Only Rendered (SOR)

When you want a **self-contained application**, logic, data access, and view rendering all running on the server, you can use SOR mode.

In SOR, React is used to render HTML on the server, and the resulting markup is sent directly to the client. There’s **no client-side hydration**, no browser runtime, just clean, fast HTML from the server.

```ts
import { StoneApp } from '@stone-js/core'
import { UseReact } from '@stone-js/use-react'
import { NodeHttp } from '@stone-js/node-http-adapter'

@NodeHttp()
@StoneApp()
@UseReact()
export class Application {}
```

This mode is perfect for traditional monoliths, internal tools, or controlled environments where the client only needs HTML and nothing more.
:::

### Adapter Philosophy: Compose your runtime

This adapter system reflects the **Continuum Architecture** at its core.

Instead of rewriting your app for different platforms, you compose the environment around it. Your pages, components, and lifecycle stay the same, the adapter determines **how and where they execute**.

| Adapter Setup                | Mode | Rendering Location      | Client JS |
| ---------------------------- | ---- | ----------------------- | --------- |
| `@Browser()` only            | CSR  | Browser                 | ✅ Yes     |
| `@Browser()` + `@NodeHttp()` | SSR  | Server (with hydration) | ✅ Yes     |
| `@NodeHttp()` only           | SOR  | Server only             | ❌ No      |

You can even combine multiple server adapters (e.g., HTTP, Lambda, etc.), and Stone.js will infer the right one based on context.

## **The Continuum Philosophy in Action**

Stone.js is built on a simple but powerful principle: **everything is a continuum**.

When you use React with Stone.js, you're not switching tools or changing how you write components. You're extending your existing knowledge across new dimensions, **from the browser to the server**, from CSR to SSR to SOR, without reinventing your logic at each step.

In the Continuum Architecture:

* Your view layer (React) stays decoupled from infrastructure.
* Your page logic is reusable across runtime contexts.
* Your application's structure is introspectable, modular, and flexible.

Stone.js doesn't wrap React, it **hosts** it, it gives it a place to **express** itself in a structured way.

You bring your components. Stone.js brings the structure, the lifecycle, the routing, the deployment flexibility, and the context awareness needed to turn a React UI into a complete application.

This documentation will guide you through that integration, step by step, dimension by dimension.
