---
title: Layout
---

In Stone.js, a **layout** is a special kind of component that wraps your pages to provide consistent structure and shared elements, like headers, footers, navigation bars, or global wrappers.

Unlike a **page**, a layout is **not** an event handler.
It doesn’t process incoming events or respond to the request lifecycle, it only participates in the **rendering phase**. You can think of a layout as a **view-dimension scaffold**: it receives the output of a page and determines how that page is framed and displayed.

### Why not treat a layout like a page?

Because their responsibilities are different:

| Feature             | Page                       | Layout                         |
| ------------------- | -------------------------- | ------------------------------ |
| Handles events      | ✅ Yes (event handler)     | ❌ No                          |
| Has `handle()`      | ✅ Yes                     | ❌ No                          |
| Has `render()`      | ✅ Yes                     | ✅ Yes                         |
| Can define metadata | ✅ Yes                     | ✅ Yes (`head()` optional)     |
| Receives lifecycle  | ✅ Yes (hooks, middleware) | ❌ No                          |
| Wraps other content | ❌ No                      | ✅ Yes (via `<StoneOutlet />`) |

This separation gives you architectural clarity:

* Pages handle logic, load data, and respond to context
* Layouts provide consistent structure, styling, and UI context

### How it fits in the Continuum

Layouts live entirely in the **view dimension** of your application.
They don’t care about transport protocols, event formats, or middleware.
They exist to make the visual layer modular, composable, and context-aware, without leaking business logic.

Stone.js provides a familiar, React-compatible structure for defining and rendering layouts, while ensuring they remain **platform-agnostic** and **easy to manage** across SPA, SSR, and SOR applications.

## Defining Layouts

Layouts in Stone.js are defined just like pages, as **classes** or **factories**, but with an important distinction:

::: important
Layouts do **not** implement a `handle()` method, because they are **not event handlers**.
:::

Instead, a layout can implement:

* `render()`: to return the layout structure as a React component
* `head()`: optionally, to define layout-wide `<title>`, `<meta>`, `<link>`, etc.

By design, layouts are **view-only**, and cannot:

* Intercept or modify incoming events
* Use middleware
* Rely on lifecycle hooks

This keeps their purpose clear and limited: **structure the UI, don’t handle logic**.

::: tabs#class-factory-function
@tab:active Class-based
### Class-Based Layouts

Class-based layouts provide a declarative structure that pairs perfectly with decorators.

```ts
import { IComponentEventHandler, ReactIncomingEvent, RenderLayoutContext, StoneOutlet } from '@stone-js/use-react'

export class BaseLayout implements IComponentEventHandler<ReactIncomingEvent> {
  render({ children }: RenderLayoutContext<ReactNode>) {
    return (
      <div className="layout">
        <header>Header</header>
        <main><StoneOutlet>{children}</StoneOutlet></main>
        <footer>Footer</footer>
      </div>
    )
  }

  head(): HeadContext {
    return {
      title: 'My App',
      description: 'The base layout of the application',
    }
  }
}
```

@tab Factory-based
### Factory-Based Layouts

Prefer factories when you want dynamic construction or are using the **imperative API**.

```ts
import { definePageLayout, StoneOutlet } from '@stone-js/use-react'

export const BaseLayout = () => ({
  render({ children }: RenderLayoutContext<ReactNode>) {
    return (
      <div className="layout">
        <nav>Navigation</nav>
        <StoneOutlet>{children}</StoneOutlet>
      </div>
    )
  },

  head(): HeadContext {
    return {
      title: 'Base Layout',
      metas: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  }
})
```
:::

::: info
Even though the layout implements IComponentEventHandler, only the render() and head() methods are used.
:::

## Registering Layouts

Just like pages, layouts in Stone.js must be **explicitly registered** so the framework can associate them with your pages.

You can register a layout using:

* The **declarative API**, with `@PageLayout()`, for class-based layouts
* The **imperative API**, with `definePageLayout()`, for any layout shape

Let’s look at both.

::: tabs#declarative-imperative
@tab:active Declarative
### Declarative Registration

If your layout is defined as a class, simply annotate it with the `@PageLayout()` decorator:

```ts
import { PageLayout } from '@stone-js/use-react'

@PageLayout({ name: 'default' })
export class BaseLayout { ... }
```

The `name` parameter allows you to:

* Set a default layout for all pages (`name: 'default'`)
* Register multiple named layouts for different sections (`'admin'`, `'auth'`, etc.)

Any page that does **not** explicitly specify a layout will fall back to the one registered with `name: 'default'`.

@tab Imperative
### Imperative Registration

For factory-based layouts or runtime registration, use `definePageLayout()`:

```ts
import { definePageLayout } from '@stone-js/use-react'

blueprint.set(definePageLayout(BaseLayout, { name: 'default' }, true))
```

* The second argument is the same `PageLayoutOptions` object as in the decorator.
* The third `true` flag indicates this is a factory layout (not a class).
:::

You can define as many layouts as needed, then assign them per-page using their `name`.

## Rendering with `<StoneOutlet />`

Layouts are wrappers, and every wrapper needs a place to render the wrapped content.

That’s the job of the `<StoneOutlet />` component.

It acts as a placeholder in your layout where the **page content will be injected** during rendering. Without it, the layout renders, but the page disappears.

### Example

```tsx
render({ children }: RenderLayoutContext<ReactNode>) {
  return (
    <div className="app-shell">
      <header>Global Header</header>
      <main>
        <StoneOutlet>{children}</StoneOutlet>
      </main>
      <footer>Global Footer</footer>
    </div>
  )
}
```

The `children` prop holds the output of the matched page's `render()` method.
`<StoneOutlet />` simply renders those children in the correct place, enabling layout nesting across navigations.

### What happens without `<StoneOutlet />`?

If you omit `<StoneOutlet />`, your layout will render, but the current page will **not** appear.
This is not an error, it’s just missing the bridge between layout and page.

So always include `<StoneOutlet />` where you want the page content to appear.

## Choosing Layouts Per Page

Once you’ve defined and registered your layouts, you can assign them to individual pages using the `layout` option.

This works the same way whether you’re using the declarative API (`@Page()`) or the imperative API (`definePage()`).

### Declarative Example

```ts
@Page('/dashboard', {
  name: 'dashboard.view',
  layout: 'default'
})
export class DashboardPage implements IComponentEventHandler<ReactIncomingEvent> {
  render() {
    return <div>Welcome to the dashboard</div>
  }
}
```

### Imperative Example

```ts
definePage(DashboardPage, {
  path: '/dashboard',
  name: 'dashboard.view',
  layout: 'default'
}, true)
```

### Layout selection logic

* If a page defines a `layout`, it will use that layout.
* If not, and a layout with `name: 'default'` is registered, that layout is used.
* If no layout is set and no default exists, the page renders without a layout.

This gives you full control while maintaining sensible defaults.

You can also create multiple layouts for different app sections (e.g., `default`, `auth`, `admin`) and assign them per page.

## Defining Metadata in Layouts

Layouts aren’t just visual wrappers, they can also define shared **HTML head tags** like `<title>`, `<meta>`, `<link>`, and more.

This is useful when:

* You want consistent metadata across a group of pages
* You want to provide a base `<title>` or `<description>` that pages can override or extend

To do this, implement a `head()` method in your layout.

### Example: Layout with `head()` metadata

```ts
import { HeadContext } from '@stone-js/use-react'

head(): HeadContext {
  return {
    title: 'My App - Powered by Stone.js',
    description: 'A fast, universal app using Continuum Architecture',
    metas: [
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#ffffff' }
    ],
    links: [
      { rel: 'icon', href: '/favicon.ico' }
    ]
  }
}
```

This metadata will be applied when the layout is active, even before any page-specific `head()` runs.

### Page + Layout metadata

When both a **page** and a **layout** define metadata:

* The layout’s `head()` runs first
* The page’s `head()` can **override or extend** the result

This gives you fine-grained control over how your app’s metadata evolves across routes, without duplication.

Stone.js manages this automatically during SSR and hydration.

## RenderLayoutContext Reference

The `render()` method of a layout receives a special context object: `RenderLayoutContext`.

It extends the standard `RenderContext` used in pages, but adds one important property: `children`.

This is how layouts can wrap the content rendered by the active page.

### Type definition

```ts
interface RenderContext<TData = any> {
  data?: TData
  container: IContainer
  event: ReactIncomingEvent
}

interface RenderLayoutContext<TChildren = ReactNode, UData = any>
  extends RenderContext<UData> {
  children: TChildren
}
```

### Key properties

| Property    | Description                                            |
| ----------- | ------------------------------------------------------ |
| `data`      | The data returned by the page handler (SSR-safe)       |
| `container` | The DI container, to resolve services                  |
| `event`     | The current incoming event (SSR-safe)                  |
| `children`  | The page content that should be rendered inside layout |

You’ll use `children` with `<StoneOutlet />` and `container` to resolve things like `Router`, `Config`, or `Logger` if needed.

## Best Practices

Layouts are a powerful way to organize your UI, but their simplicity is what makes them effective. These practices will help you keep them clean, consistent, and efficient.

#### Keep layouts presentation-only

A layout should never fetch data, modify state, or implement logic. Its only job is to wrap page content in a reusable UI shell.
If you need layout-wide data (e.g., user info, settings), resolve it in the **page handler** or through middleware, and pass it down through context.

#### Always include `<StoneOutlet />`

It’s the single most important element of your layout.

If you don’t include it, no page will render inside the layout.
Use it precisely where you want your page content to appear, usually inside a `<main>` block or central wrapper.

#### Use the `head()` method for layout-wide metadata

If all your pages share the same title, description, or meta tags, define them in the layout using `head()`.
You’ll avoid repetition and ensure consistency across pages.

#### Name layouts clearly and consistently

Use layout names that reflect their purpose: `default`, `auth`, `admin`, etc.
Avoid ambiguous names like `main` or `wrapper`.

This makes it easier to assign layouts declaratively and track them across the codebase.

#### Keep logic out, keep structure in

Avoid this:

```ts
render() {
  if (someCondition) { /* logic here */ }
  return <div>...</div>
}
```

Prefer this:

* Move logic to the page
* Pass down flags via `StoneContext` or props
* Keep layout code declarative

Layouts should **never surprise you**, their output should be predictable and consistent.

## Summary

Layouts in Stone.js are simple by design, but powerful in impact.

They provide a clean, reusable way to wrap your pages with consistent UI, structure, and metadata, without mixing in business logic or event handling.

### Key takeaways:

* Layouts are **not event handlers**, they don’t have `handle()`, middleware, or lifecycle hooks.
* They implement only `render()` (required) and optionally `head()` for setting metadata.
* You can define them as **classes** or **factories**, and register them using:

  * `@PageLayout()` (declarative)
  * `definePageLayout()` (imperative)
* Use `<StoneOutlet />` to inject page content where needed.
* Assign layouts to pages using the `layout` property in your page definition.
* Layout metadata is combined with page metadata during rendering.
* Keep layouts **clean, declarative, and logic-free**, focus only on structure.

Stone.js gives you total control over your view architecture,
without polluting your logic layer, and without reinventing the wheel.

That’s the power of separation by dimension.
That’s the **Continuum**.
