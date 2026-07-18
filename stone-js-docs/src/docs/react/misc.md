---
title: Miscellaneous
next: ../deeper/testing
---

Not everything fits in a tidy box, and that’s okay.

This page covers **miscellaneous features** of Stone.js’ React integration: small utilities, advanced configuration, third-party library integration, and template customization. These aren’t core to how pages or layouts work, but they can make a huge difference when polishing your app or wiring it into your larger system.

You’ll learn how to:

* Control rendering context with `<StoneClient>` and `<StoneServer>`
* Customize the HTML template used during server rendering
* Configure core React integration settings via the **blueprint**
* Integrate powerful tools like `react-query` and `react-helmet` (if you want to)
* Stay aligned with the Continuum Architecture while leveraging the React ecosystem

If you're building serious apps, this is where the real-world polish begins.

### Stone.js Rendering Utilities: `<StoneClient>` and `<StoneServer>`

In Stone.js, rendering isn’t just a one-shot operation, it’s a **context-aware process**. Whether you're rendering on the server, in the browser, or preparing for hydration, Stone.js offers utilities to help you control **what renders where**.

Sometimes, you may want to:

* Render something **only on the client** (e.g., animations, browser-only APIs)
* Render something **only on the server** (e.g., SSR-only placeholders, skeletons)
* Avoid flashing content during hydration

That’s where these two small but powerful utilities come in.

#### `<StoneClient>`: Client-Only Rendering

Use this component to wrap parts of your JSX that should **only appear in the browser**, after hydration.

```tsx
import { StoneClient } from '@stone-js/use-react'

function Component() {
  return (
    <div>
      <p>This is universal content</p>
      <StoneClient>
        <p>This will only render on the client.</p>
      </StoneClient>
    </div>
  )
}
```

During SSR, the content inside `<StoneClient>` is **not rendered at all**, only the surrounding elements are sent to the browser. This avoids hydration mismatches and protects browser-only logic.

#### `<StoneServer>`: Server-Only Rendering

Likewise, use `<StoneServer>` to render content **only during SSR**, perfect for skeletons, preloaders, or analytics injection.

```tsx
import { StoneServer } from '@stone-js/use-react'

function Component() {
  return (
    <div>
      <StoneServer>
        <p>Loading...</p>
      </StoneServer>
    </div>
  )
}
```

When the app hydrates in the browser, the contents inside `<StoneServer>` are discarded. They never run on the client.

### Best Use Cases

| Utility         | When to use it                                       |
| --------------- | ---------------------------------------------------- |
| `<StoneClient>` | Browser-only logic (e.g. `window`, `localStorage`)   |
| `<StoneServer>` | Skeletons, SEO placeholders, SSR-only tags or markup |

This helps you build precise, **context-aware interfaces**, without worrying about hydration mismatches or throwing errors in the wrong environment.

### Customizing the HTML Template

Stone.js uses a **server-rendered HTML template** as the entry point for every page. This template is fully customizable and allows you to inject global assets, meta tags, fonts, stylesheets, or scripts, **just like you would in any standard HTML file**.

But there's a twist: Stone.js makes it **context-aware** through special placeholders.

#### Exporting the Default Template

To begin customization, you first need to export the default HTML template using the Stone CLI:

```bash
stone export app
```

This will generate a file named `index.html` at the root of your project, typically structured like this:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Stone.js + React</title>
    <link rel="stylesheet" href="/assets/styles/main.css" />
    
    <!--app-head-->
  </head>
  <body>
    <div id="app"><!--app-html--></div>
    <script type="module" src="/src/index.ts" defer></script>
  </body>
</html>
```

#### Special Placeholders

There are two **required** placeholders that Stone.js uses during SSR and hydration:

* `<!--app-head-->`: This is where Stone.js will inject `<title>`, `<meta>`, and any tags returned by your `head()` method from pages or layouts.
* `<!--app-html-->`: This is where the actual rendered React content goes.

**Do not remove or rename these**, they’re essential for proper hydration and SSR.

#### Common Customizations

You can freely add anything else to the template:

* Google Fonts or custom fonts via `<link>`
* Meta tags for SEO or social sharing
* Favicon or manifest files
* Scripts for analytics or tag managers
* Global stylesheets

```html
<link rel="icon" href="/favicon.svg" />
<link rel="stylesheet" href="/assets/styles/theme.css" />
<script src="https://example.com/script.js" async></script>
```

Stone.js will preserve and serve them correctly in all rendering contexts.

#### Setting the Template Path (optional)

If you move your HTML template to a custom path, you can update it in the blueprint:

```ts
blueprint.set('stone.useReact.htmlTemplatePath', './template.html')
```

This tells Stone.js where to find your base template during build and SSR.

### Configuring React Behavior in Stone.js

Stone.js uses **React** under the hood to render your components, but the way React is initialized and controlled is entirely **context-aware** and **blueprint-driven**.

That means: you don’t need `ReactDOM.createRoot()` or `hydrateRoot()` scattered around, Stone.js abstracts this for you and gives you a clean way to configure everything via the blueprint.

Let’s explore how to control the key behaviors.

#### Setting the Root Element ID

Stone.js uses a default `div` element with an ID of `app` to mount your React application:

```html
<div id="app"><!--app-html--></div>
```

If you want to change this to something else, like `#root`, simply set the root element ID in the blueprint:

```ts
blueprint.set('stone.useReact.rootElementId', '#root')
```

> This is particularly useful if you’re integrating Stone.js into a larger frontend that already has a specific mounting structure.

#### Setting the HTML Template Path

As mentioned before, you can customize where your base HTML template lives:

```ts
blueprint.set('stone.useReact.htmlTemplatePath', './template.html')
```

This file will be used by the server during SSR, and it must include the `<!--app-head-->` and `<!--app-html-->` placeholders.

#### Registering Layouts Imperatively

If you don’t use decorators and prefer full control over your layout registration, you can do this imperatively:

```ts
blueprint.set('stone.useReact.layout', {
  default: DefaultLayout,
  admin: AdminLayout,
  auth: AuthLayout
})
```

Each layout name (`default`, `admin`, etc.) can then be referenced in your page registration:

```ts
@Page('/dashboard', { layout: 'admin' })
```

You can also change layouts at runtime by setting them conditionally or dynamically based on user roles or context.

#### Putting It All Together

Here’s a quick example of setting everything up in your main configuration:

```ts
export const AppBlueprint = defineBlueprintConfig((blueprint) => {
  blueprint.set('stone.useReact.rootElementId', '#root')
  blueprint.set('stone.useReact.htmlTemplatePath', './template.html')

  blueprint.set('stone.useReact.layout', {
    default: DefaultLayout,
    error: ErrorLayout,
  })
})
```

With this setup, you’re telling Stone.js:

* Where to mount the app
* What template to use for SSR
* How to resolve layout names declaratively

## Summary

This page brought together several advanced and practical topics that help you **fine-tune, extend, and deeply customize** your Stone.js + React applications.

Here’s what you now know how to do:

* **Use StoneClient and StoneServer** components to control execution based on environment, allowing you to render conditionally in universal apps.
* **Customize the HTML template** for your app, including layout, meta tags, scripts, and styles, while preserving the key placeholders (`<!--app-head-->`, `<!--app-html-->`) that Stone.js needs to hydrate your app.
* **Configure React-specific settings** such as:

  * The root DOM element (`rootElementId`)
  * The path to the HTML template (`htmlTemplatePath`)
  * Custom layouts via `stone.useReact.layout`
* **Integrate third-party libraries** cleanly, thanks to the architectural boundaries Stone.js provides. From `react-query` and `react-router`, to UI libraries like `react-helmet`, you remain fully in control.
* Work seamlessly across **server-side, client-side, or hybrid modes**, always with contextual awareness and clean separation of concerns.

The **Continuum Architecture** behind Stone.js ensures you’re never boxed in, you can shape your runtime, ecosystem, and user experience exactly as needed.

Stone.js doesn’t get in your way. It gets out of your way, and gives you **real power** to build the way you want, wherever you deploy.
