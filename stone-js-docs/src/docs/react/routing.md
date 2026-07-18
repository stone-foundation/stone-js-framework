---
title: Routing
---

Routing in Stone.js is not just about navigating between views, it’s about **matching user intent with system logic** in a way that works seamlessly across **all execution contexts**: browser, server, or serverless.

In traditional frameworks, routing is often tightly coupled to components or file-based conventions.
In Stone.js, routing is decoupled, explicit, and unified. It operates on **event handlers**, and since every **page is an event handler**, routing pages becomes a natural extension of the Stone.js architecture.

This gives you a powerful and declarative way to:

* Match routes to pages
* Inject parameters and services
* Define bindings
* Support dynamic registration
* And ensure routing works the same way across SPA, SSR, and SOR

Whether you're building a small client-side app or a large distributed system, your routing model stays consistent and continuum-aligned.

::: info Intentions
In Stone.js, pages don’t just render views, they handle intentions.  
And routing is how we connect those intentions to the right handler.
:::

## Defining Routes for Pages

In Stone.js, you define page routes using the same techniques available for any event handler, because **pages are just handlers** in the view dimension.

You can register a route to a page using:

* The **declarative API**, with the `@Page()` decorator
* The **imperative API**, with the `definePage()` utility

These definitions are static, they’re evaluated during the application’s setup phase and are ideal for most applications.

::: important
All advanced router features are available for pages: parameters, regex validation, aliases assignment, bindings, and more.
:::

::: tabs#declarative-imperative
@tab:active Declarative
### Declarative Example

Use the `@Page()` decorator for class-based pages. It provides better introspection, supports lazy loading out of the box, and works perfectly with the blueprint system.

```ts
import { Page } from '@stone-js/use-react'

@Page('/users/:id@user(\\d+)', {
  name: 'user.view',
  bindings: { id: 'userService@findOneBy' }
})
export class UserPage implements IComponentEventHandler<ReactIncomingEvent> {
  render({ event }: RenderContext): React.ReactNode {
    const user = event.get('user')
    return <div>Hello {user.fullname}</div>
  }
}
```

@tab Imperative
### Imperative Example

Use `definePage()` when working with factory-based pages or when you prefer full control.

```ts
import { definePage } from '@stone-js/use-react'

const UserPage = () => ({
  render({ event }: RenderContext): React.ReactNode {
    const user = event.get('user')
    return <div>Hello {user.fullname}</div>
  }
})

definePage(UserPage, {
  name: 'user.view',
  path: '/users/:id@user(\\d+)',
  bindings: { id: 'userService@findOneBy' },
}, true)
```
:::

### Why Static Definitions?

Static routes:

* Are fully introspectable
* Support lazy-loading
* Are compatible with all adapter types (browser/server/etc.)
* Integrate naturally with the Blueprint setup

For more dynamic or runtime-driven scenarios, refer to the **Runtime Page Registration** section or the [Router documentation](../router/definitions).

## Dynamic Route Bindings

Stone.js allows you to define smart, declarative routes that not only match a path, but also **inject data directly into the request context**, before your page handler is even called.

This is done using **route bindings**.

Bindings enable you to:

* Validate and extract route parameters
* Automatically resolve data from services (e.g., load a user by ID)
* Reduce boilerplate in your `handle()` or `render()` methods

### Syntax: `:param@alias(regex)`

```ts
@Page('/users/:id@user(\\d+)', {
  bindings: {
    id: 'userService@findOneBy'
  }
})
```

This tells Stone.js:

* `:id` is the route parameter
* `user` is the binding alias
* `\\d+` is the regex that validates the parameter
* `userService@findOneBy` is the service method to call with `id` as argument

### How it works

With that definition in place:

* Before your page is executed, Stone.js calls `userService.findOneBy(key, value)`
* The result is injected as `event.params.user`
* No `handle()` method is required, you can access the user directly in `render()`

```tsx
render({ event }: RenderContext) {
  const user = event.get('user')
  return <h1>Hello, {user.fullname}</h1>
}
```

::: tip
This makes pages lighter, especially when your data model is tightly bound to your URL structure.
:::

### SSR Notice: Bindings are not snapshotted automatically

If you're using **SSR** and want to pass the bound data to the client without fetching again, you must **explicitly snapshot it** in your service using `reactRuntime.snapshot()`.

Refer to the [Snapshot documentation](./fetching#snapshot) for guidance.

### When to use bindings

Use bindings when:

* The parameter maps directly to a resource (e.g., `/users/:id`)
* You want to inject data into `event` with minimal code
* You want to keep pages minimal and focused

Avoid bindings when:

* You need conditional logic, branching, or multiple service calls, use `handle()` instead.

## Lazy Loading

Stone.js fully supports **lazy loading** for pages, allowing you to load only the code needed for the active route. This improves performance, reduces initial bundle size, and makes large applications more scalable.

The way lazy loading is handled depends on which API you use to register your page.

::: tabs#declarative-imperative
@tab:active Declarative

### Declarative API: Lazy by default

When you register pages using the `@Page()` decorator, **lazy loading is enabled automatically**.

Stone.js uses dynamic imports behind the scenes to ensure your page module is only loaded when its route is accessed.

```ts
@Page('/about', { name: 'about' })
export class AboutPage implements IComponentEventHandler<ReactIncomingEvent> {
  render(): React.ReactNode {
    return <div>About Us</div>
  }
}
```

Even though this looks like a normal class, Stone.js will isolate the file and load it only when the `/about` route is activated.

No manual configuration required, declarative pages are lazy by design.

@tab Imperative

### Imperative API: Lazy by manual setup

When using the imperative `definePage()` function, **you must configure lazy loading explicitly**.

You do this by:

1. Returning a function that performs a dynamic `import()`
2. Setting the `lazy: true` flag in the route options

```ts
definePage(
  () => import('./HomePage').then(v => Object.values(v)[0]),
  {
    name: 'home',
    path: '/home',
    lazy: true
  },
  true
)
```

Let’s break it down:

* `() => import('./HomePage')` is a function returning a Promise of the module.
* `Object.values(v)[0]` grabs the first export (your page class or factory).
* `lazy: true` tells the router to defer loading this page until the route is accessed.

**Important:** The module must contain only **one page per file** to avoid ambiguity.
:::

Whether you prefer full control or automatic behavior, Stone.js gives you both:

* **Automatic lazy loading when you want it**
* **Manual control when you need it**

## Runtime Page Registration

While static route definitions are ideal for most use cases, Stone.js also supports **runtime page registration**, giving you the flexibility to define routes dynamically after the application has started.

This is useful when:

* Routes depend on runtime data (e.g. feature toggles, plugin systems)
* You want to load routes from external sources
* You're building an admin panel, CMS, or multi-tenant app

Since pages are just handlers, you register them at runtime using the **same APIs** as any other event handler, via the `router` instance.

::: important
Runtime routes should always be registered inside a **service provider’s `boot()` method**, where the `Router` service is guaranteed to be available.
:::

::: tabs#runtime-definitions
@tab:active Fluent
### Fluent API (Chained)

You can define routes fluently using methods like `.page()` and pass a page handler directly:

```ts
@Provider()
export class PageProvider implements IServiceProvider {
  constructor(private readonly container: IContainer) {}

  boot() {
    const router = this.container.make<Router>('router')

    router.page('/help', defineEventHandler(() => ({
      render (event: ReactIncomingEvent) {
        return reactResponse({ content: { message: 'Help Page' } })
      }
    }), true));
  }
}
```

@tab Option
### Option-based Definition

Prefer a structured format? Use `router.define()` and pass route definitions in array form:

```ts
router.define([
  {
    method: 'GET',
    path: '/legal',
    handler: defineEventHandler(() => ({
      render (event: ReactIncomingEvent) {
        return reactResponse({ content: { message: 'Legal Page' } })
      }
    }), true)
  }
]);
```

@tab Collection
### Advanced: Collection API

Need full control over routing structures? Use `Route` and `RouteCollection`:

```ts
const routes = RouteCollection.create()

routes.add(Route.create({
  method: 'GET',
  path: '/faq',
  handler: defineEventHandler(() => ({
    render (event: ReactIncomingEvent) {
      return reactResponse({ content: { message: 'FAQ Page' } })
    }
  }), true)
}));

router.setRoutes(routes);
```
:::

### Runtime Pages Work the Same

The handler for a runtime-registered route can be a valid **page**, as long as it implements the `IComponentEventHandler` interface and returns JSX in its `render()` method.

But be aware:

* **Lazy loading is not automatic**
* You must use `import()` and pass a proper handler instance
* Runtime pages are not introspected during setup

For more details on dynamic routing, see the [Router documentation](../router/definitions#runtime-definition).

## Navigation

Stone.js provides two primary ways to navigate between pages:

1. **Declaratively**, using the built-in `<StoneLink />` component
2. **Programmatically**, using the `Router` service

Both approaches are **context-aware** and adapt automatically depending on whether your app is running in **CSR**, **SSR**, or **SOR**.

### Declarative Navigation with `<StoneLink />`

Use `<StoneLink />` to create links between pages in your application.

```tsx
import { StoneLink } from '@stone-js/use-react'

<StoneLink to="/profile" className="btn btn-primary">
  Go to Profile
</StoneLink>
```

**Why use it instead of a regular `<a>` tag?**

Because `<StoneLink />` is:

* Smart: Uses client-side navigation in SPA/SSR
* Safe: Falls back to traditional navigation in SOR
* Seamless: Keeps routing platform-agnostic

```txt
CSR / SSR → router.navigate()
SOR       → <a href="...">
```

### Programmatic Navigation with `Router.navigate()`

You can also navigate manually, typically after a user interaction, like form submission or authentication.

#### In a Page (via DI):

```ts
constructor(private readonly router: Router) {}

this.router.navigate('/dashboard')
```

#### In a Component (via StoneContext):

```tsx
import { useContext } from 'react'
import { Router } from '@stone-js/router'
import { StoneContext } from '@stone-js/use-react'

const { container } = useContext(StoneContext)
const router = container.resolve(Router)

router.navigate('/logout')
```

### Where is `navigate()` supported?

| Context        | Supported? | Behavior                            |
| -------------- | ---------- | ----------------------------------- |
| SPA (CSR)      | ✅          | Uses history API for seamless nav   |
| SSR (hydrated) | ✅          | Behaves like CSR after hydration    |
| SOR            | ❌          | Not available, use `<StoneLink />` |

In **SOR (Server-Only Rendering)**, there is **no JavaScript runtime** in the browser. That’s why `router.navigate()` cannot work there.

To ensure safe navigation in SOR, always use `<StoneLink />`.

## Router Features Available to Pages

Because every **page** in Stone.js is just a specialized **event handler**, it inherits **all router features** available through the `@stone-js/router` module.

This means you don’t need a separate routing system for pages, everything you can do with the router, you can do with pages.

Here’s what’s available:

### Declarative and Imperative Definitions

You can define routes using:

* `@Page()` for class-based declarative registration
* `definePage()` for factory-based or runtime control

Both support lazy loading, bindings, and more.

### Route Bindings

Automatically fetch and inject resources based on route parameters:

```ts
@Page('/articles/:slug@article', {
  bindings: { slug: 'articleService@findBySlug' }
})
```

The resolved `article` is available in `event.get('article')`.

::: info Reminder
Bindings are **not** snapshotted automatically, use `reactRuntime.snapshot()` when needed.
:::

### Nested & Grouped Routes

Organize your routes using naming conventions or use nested path structures:

```ts
@Page('/admin/users/:id', { name: 'admin.users.view' })
```

You can group routes logically by domain, module, or adapter.

### Regex Parameter Validation

Validate route parameters inline:

```ts
@Page('/posts/:id(\\d+)', { name: 'posts.detail' })
```

This matches only numeric IDs.

### Repeatable & Optional Parameters

Use advanced path patterns for more expressive URLs:

```ts
@Page('/tags/:names*', { name: 'tags.filter' }) // Repeatable
@Page('/archive/:year?/:month?', { name: 'archive' }) // Optional
```

### Aliases and Protocol-Specific Routes

You can define multiple paths for a single page or restrict a route to a specific protocol (e.g., `http`, `https`, `ws`).

```ts
@Page(['/faq', '/help'], { name: 'support.faq' })
```

📘 For the full list of routing features, see the [Router documentation](../router/).
Pages follow the same model and benefit from every router capability.

## Best Practices

Routing in Stone.js gives you an expressive, flexible system with full control over behavior, structure, and context. But with flexibility comes the need for discipline.

Here are the recommended practices to keep your routing layer clean, robust, and continuum-aligned.

#### Use `@Page()` for most routes

Prefer the declarative API (`@Page()`) whenever possible:

* Automatically lazy-loads the page
* Keeps route logic close to the handler
* Provides better introspection and developer tooling
* Aligns with Blueprint and Dimension registration patterns

```ts
@Page('/about', { name: 'about' })
export class AboutPage { ... }
```

#### Use `definePage()` only when necessary

Reserve imperative registration for:

* Factory-based pages
* Runtime-assembled apps
* Dynamic plugin/module injection
* Third-party libraries

Don't overuse imperative routes just for stylistic reasons, declarative is more maintainable long-term.

#### Don’t overuse bindings

Route bindings are a great way to simplify event handler logic, but they:

* Don’t snapshot data automatically
* Should stay simple and predictable

Use bindings for common resource loading (`/users/:id`), not for complex logic.

Snapshot your binding results explicitly if needed in SSR.

#### Avoid `router.navigate()` in SOR

In Server-Only Rendering (SOR) mode, there’s no JavaScript runtime on the client, so `router.navigate()` doesn’t work.

Always use `<StoneLink />` in components and templates when you need cross-platform-safe navigation.

#### Use `<StoneLink />` by default

Use `<StoneLink to="..." />` instead of `<a href="..." />` to:

* Enable seamless navigation in SPA/SSR
* Fallback gracefully to real links in SOR
* Keep the user experience consistent

#### Keep routes grouped by domain

Use namespaces, naming conventions, or route groups to organize pages:

```ts
@Page('/admin/settings', { name: 'admin.settings' })
@Page('/admin/users/:id', { name: 'admin.users.view' })
```

This improves readability, maintainability, and runtime introspection.

#### Validate your dynamic parameters

When using dynamic routes (`:id`, `:slug`), always add regex validation to:

* Prevent route matching ambiguity
* Add light security and clarity
* Make behavior predictable

```ts
@Page('/orders/:id(\\d+)', { name: 'orders.detail' })
```

#### Define runtime routes in `boot()`

If you're registering routes dynamically, always do it inside a service provider’s `boot()` method:

```ts
@Provider()
export class MyModuleProvider {
  boot() {
    const router = this.container.make<Router>('router')
    router.page('/docs', DocsPageHandler)
  }
}
```

This ensures that all dependencies are available and the router is initialized.

#### Don’t bring another router

Stone.js already provides a unified, multi-context router with support for SPA, SSR, SOR, and middleware.

You don’t need `react-router`, or any other third-party navigation library.
Using them will lead to conflicts, redundancy, and unnecessary complexity.

## Summary

In Stone.js, routing is not a side feature, it’s a foundational mechanism that connects user intention with application behavior across every dimension of execution.

Pages in Stone.js are just context-aware event handlers, and routing is the way they’re discovered, matched, and invoked.

By aligning routing with the Continuum Architecture:

* You get consistent, introspectable routing behavior across SPA, SSR, and SOR
* You can define routes declaratively or imperatively, statically or at runtime
* You gain access to powerful features like route bindings, nested paths, protocol filters, and more
* You avoid framework lock-in by using a router designed for both frontend and backend dimensions

With `<StoneLink />`, `Router.navigate()`, and adapter-aware navigation handling, you're always in control, no matter the environment.

### In short:

* A **Page** is a handler.
* A **route** is an intention pathway.
* An **Incoming Event** is an intention.
* And **Stone.js routing** is how you map one to the other, elegantly, contextually, and universally.

For more advanced features and low-level routing tools, refer to the full [Router documentation](../router/).  
But when it comes to Pages, this is everything you need to route with power and precision.
