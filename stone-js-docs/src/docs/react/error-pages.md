---
title: Error Pages
---

In a context-aware system like Stone.js, errors aren’t exceptions, they’re part of the design. From failed API calls to unexpected user input, errors can occur at any stage of an application’s lifecycle. The question is not how to avoid them, but how to handle them **gracefully**, both in code and in the UI.

Stone.js introduces the concept of **Error Pages**: specialized pages rendered in response to failures, designed to catch and display user-friendly messages without crashing the app.

These pages follow the same composable structure as regular pages but with one key difference: they react to thrown errors, not user events.

### Why Error Pages Matter

Error Pages are your system’s visual safety net. Whether something goes wrong during data fetching, rendering, or integration, Stone.js ensures:

* The application remains stable
* The user is guided, not lost
* The error is handled contextually

Rather than burying users in console errors or blank screens, you offer them meaningful fallback experiences, wrapped in the same powerful context engine that powers your pages.

### Handlers vs. Pages: Know the Difference

Stone.js has **two mechanisms** for dealing with errors:

| Mechanism          | Purpose                               | Scope                               | Handles UI? |
| ------------------ | ------------------------------------- | ----------------------------------- | ----------- |
| **Error Handlers** | Catch and process exceptions          | Functional & Integration dimensions | ❌ No        |
| **Error Pages**    | Display friendly UI when errors occur | View dimension (SPA/SSR/SOR)        | ✅ Yes       |

You can (and should) use **both**:

* **Throw** freely in your application logic.
* Let error **handlers** catch the error and return structured responses.
* If the error reaches the **view**, let an **ErrorPage** take over and guide the user.

Stone.js routes each failure to the appropriate layer, and gives you complete control over how it’s handled.

### A Continuum-Safe System

Thanks to the Continuum Architecture, error management in Stone.js is:

* **Dimension-aware**: Different responses for functional vs. integration failures
* **Composable**: Error pages are just React renderers with access to DI and context
* **Extensible**: Customize responses per error type, per adapter, or globally
* **Framework-consistent**: You register, inject, and snapshot just like any other handler

An ErrorPage is a **view-level fail-safe**, not just a UI bandage. It’s the moment where **architecture meets empathy**, turning uncertainty into clarity.

## Defining Error Pages

In Stone.js, an **ErrorPage** is a specialized kind of page: it reacts to thrown errors and renders a React component instead of crashing your app.

An ErrorPage behaves like a normal Stone page, it can define a `head()` and `render()` method, but it also accepts and responds to an error passed to it by the system.

This is a first-class feature. Whether your app runs in SPA, SSR, or SOR mode, the ErrorPage system provides a unified, dimension-aware way to gracefully handle and display errors.

### Error Page Anatomy

Just like a normal page, you can define an ErrorPage using:

* A **class** (with decorators, ideal for declarative registration)
* A **factory function** (for imperative registration)

The only difference? The `handle()` method accepts an **error** as its first parameter.

```ts
handle(error: any, event: ReactIncomingEvent): any
```

You can also return structured data from `handle()`, just like a page, and use that in your `render()` method.

### The ErrorPage Interface

Here’s what you can define:

| Method     | Purpose                                                   |
| ---------- | --------------------------------------------------------- |
| `head()`   | (Optional) Set the HTML `<head>` tags (title, meta, etc.) |
| `handle()` | (Optional) Receive the error and incoming event           |
| `render()` | (Required) Render a React view based on the error state   |

The shape can be class-based or factory-based. Let’s look at both.

::: tabs#class-factory
@tab:active Class-based
### Class-based Example

```ts
import {
  ErrorPage,
  PageStatus,
  ReactIncomingEvent,
  RenderErrorContext,
  IComponentErrorHandler
} from '@stone-js/use-react'

@ErrorPage({ layout: 'error', error: 'default' })
export class DefaultErrorPage implements IComponentErrorHandler<ReactIncomingEvent> {
  @PageStatus(500)
  handle(error: any, event: ReactIncomingEvent) {
    return { message: 'Something went wrong.' }
  }

  render({ data, statusCode }: RenderErrorContext<any>) {
    return (
      <div>
        <h1>{statusCode}</h1>
        <p>{data?.message}</p>
      </div>
    )
  }
}
```

@tab Factory-based
### Factory-based Example

```ts
import {
  defineErrorPage,
  ReactIncomingEvent,
  RenderErrorContext
} from '@stone-js/use-react'

const DefaultErrorPage = () => ({
  handle(error: any, event: ReactIncomingEvent) {
    return { message: 'Something went wrong.' }
  },

  render({ data, statusCode }: RenderErrorContext<any>) {
    return (
      <div>
        <h1>{statusCode}</h1>
        <p>{data?.message}</p>
      </div>
    )
  }
})

blueprint.set(defineErrorPage(DefaultErrorPage, { layout: 'error', error: 'default' }, true))
```
:::

### `@PageStatus()`

You can annotate your `handle()` method with `@PageStatus()` to indicate the HTTP status code associated with this error. This ensures proper response semantics and accurate metadata for SSR and integrations.

```ts
@PageStatus(404)
handle(error: NotFoundError, event: ReactIncomingEvent) {
  return { message: 'Not found.' }
}
```

### Reuse Layouts

Just like standard pages, ErrorPages can use layouts via the `layout` option:

```ts
@ErrorPage({ layout: 'error', error: 'default' })
```

This lets you provide consistent branding or structural UI for your error views. In the layout’s `render()` method, you can use `<StoneOutlet />` as usual to render the inner error page.

## Adapter Error Pages

Error handling in Stone.js isn’t just for the application logic. When something goes wrong at the adapter level, during raw request processing, platform integration, or low-level execution, Stone.js gives you the ability to render **Adapter Error Pages**.

These error pages aren’t associated with an incoming event like standard ErrorPages. Instead, they’re rendered directly by the adapter when the application fails before the `handle()` phase, or if the error happens outside the event lifecycle.

### When Are Adapter Error Pages Used?

Adapter Error Pages are invoked when:

* A thrown error bypasses or breaks the normal lifecycle
* The application fails before it can construct an event
* An error occurs during low-level request parsing or response building
* No matching ErrorPage is available for the error

### Special Context: `RenderAdapterLayoutContext`

The layout used for adapter error rendering receives a slightly different context than normal layouts:

```ts
interface RenderAdapterLayoutContext<TChildren = ReactNode, TData = any> {
  data?: TData
  error?: any
  statusCode?: number
  children: TChildren
  blueprint: IBlueprint
}
```

The main differences:

* `error`: the original error object
* `statusCode`: HTTP code or platform-specific status
* `blueprint`: the application’s blueprint (since container is not guaranteed)

This context allows your layout to adapt to the error, even without a fully initialized application.

### Use Layouts with Adapter Errors

If you’ve registered a layout using:

```ts
@PageLayout({ name: 'error' })
```

You can use it in an adapter error page using the decorator `AdapterErrorPage` like this:

```ts
@AdapterErrorPage({
  layout: 'error',
  error: 'default'
})
```

In your layout’s render method, you can use the status code and error message:

```tsx
render({ children, statusCode, error }: RenderAdapterLayoutContext) {
  return (
    <div>
      <h1>Error {statusCode}</h1>
      <pre>{error?.message}</pre>
      <StoneOutlet>{children}</StoneOutlet>
    </div>
  )
}
```

Even when your app can’t fully initialize, **the adapter can still render a user-facing error** with branding and structure.

## Throwing Errors Manually with `reactRuntime.throwError()`

In a Stone.js + React application, most errors should be thrown **naturally** (e.g., inside a `handle()` method, a service, or middleware). But there are scenarios, particularly inside the **React rendering lifecycle**, where you cannot `throw` an error the standard way.

Why? Because once the page is rendered, you're in React's world. The Stone.js lifecycle is complete. Throwing an error in a component or event handler won't reach your error handlers or render an `ErrorPage`.

That’s where `reactRuntime.throwError()` comes in.

### Use Case: React Component Interactivity

Inside a component, you might want to trigger an error page in response to a user action, like a failed login, an expired session, or access to a forbidden route.

You can use the `reactRuntime` utility, which is available in:

* The **constructor** of a class-based page
* The **factory arguments** of a factory-based page
* The **StoneContext** (inside React components)

### Inside a Page Constructor

```ts
export class DashboardPage implements IComponentEventHandler<ReactIncomingEvent> {
  private readonly reactRuntime: ReactRuntime

  constructor(private readonly container: IContainer) {
    this.reactRuntime = container.resolve('reactRuntime')
  }

  render(): React.ReactNode {
    return (
      <button onClick={() => this.reactRuntime.throwError(new Error('Session expired'), 401)}>
        Expire Session
      </button>
    )
  }
}
```

### Inside a React Component

```tsx
import { useContext } from 'react'
import { StoneContext } from '@stone-js/use-react'

export const SessionButton = () => {
  const { container } = useContext(StoneContext)
  const reactRuntime = container.resolve('reactRuntime')

  return (
    <button onClick={() => reactRuntime.throwError(new Error('Forbidden access'), 403)}>
      Trigger Error
    </button>
  )
}
```

### How It Works

* If the app is running in **CSR** or **hydrated SSR**, the error page will be rendered instantly.
* If it's **SOR** (server-only), this won’t work, the page has already been rendered and no JavaScript is available to intercept the action.

### Parameters

```ts
reactRuntime.throwError(error: Error, statusCode?: number)
```

* `error`: any instance of `Error` (or a custom error class)
* `statusCode`: optional, used to route to the right ErrorPage or AdapterErrorPage

### When to Use `throwError()`

| Scenario                     | Use `throwError()`? | Notes                                         |
| ---------------------------- | ------------------- | --------------------------------------------- |
| Inside `handle()`            | ❌ No                | Just `throw`, Stone.js catches it             |
| Inside `middleware`          | ❌ No                | Use `reactRedirectResponse()` or throw        |
| Inside `render()` method     | ✅ Yes               | Lifecycle is over, need programmatic fallback |
| Inside component interaction | ✅ Yes               | Useful for buttons, forms, etc.               |

::: important
In short: if you’re inside React, and you want to show an error page, **don’t throw**, use `reactRuntime.throwError()` instead.
:::

## Best Practices

Handling errors in Stone.js is about more than catching exceptions, it’s about architecting resilience. These best practices will help you design error flows that are predictable, modular, and aligned with the Continuum.

#### Separate **Error Pages** from **Error Handlers**

* **Use Error Handlers** to deal with logic and control the response.
* **Use Error Pages** to deal with the UI and show users something meaningful.
* Don’t overload one with the role of the other, each has its dimension and purpose.

#### Always Define a Default ErrorPage

```ts
@ErrorPage({ error: 'default' })
export class DefaultErrorPage { ... }
```

Stone.js will route uncaught or unknown errors here. This ensures your users never face a blank screen or raw stack trace.

#### Use `@PageStatus` for Explicit Status Codes

This makes the intent clear and allows adapter-level rendering to behave correctly (like returning 404 or 403 responses).

```ts
@PageStatus(404)
handle(error: NotFoundError, event: ReactIncomingEvent) { ... }
```

#### Leverage Layouts to Reuse ErrorPage Design

* Register an `error` layout to wrap all your error pages.
* Use `StoneOutlet` to keep things consistent.

```ts
@ErrorPage({ layout: 'error', error: 'default' })
```

#### Never Throw Inside `render()`, Use `reactRuntime.throwError()`

If you want to trigger an error after rendering begins (e.g. in a React component or button handler), use:

```ts
reactRuntime.throwError(new ForbiddenError(), 403)
```

This ensures the system still handles the error using the full routing and layout system.

#### Avoid Manual `try/catch` in Pages or Services

Throw freely, let Stone.js catch and route the error to the proper handler or page. Manual `try/catch` often leads to messy fallback logic and duplicated UI code.

#### Use Custom Error Classes for Semantic Clarity

Don’t throw `Error('Access denied')`, throw `new AccessDeniedError()`. It makes routing easier, logs clearer, and error pages more targeted.

```ts
export class AccessDeniedError extends Error {
  constructor() {
    super('Access denied')
    this.name = 'AccessDeniedError'
  }
}
```

#### Be Careful with Adapter Error Pages

* These are rendered at the platform level, no React context is available.
* Use a separate layout if needed.
* Don’t rely on injected services unless you know what you’re doing (you’re outside initialization).

#### Don’t Overuse Status Pages

Use `@PageStatus` only when you want to declare a standard HTTP status code. Don’t misuse it to simulate other flows. Let errors do their job.

## Summary

Stone.js treats errors as first-class citizens, not exceptions to the rule, but part of the continuum.

With Error Pages, you gain a **declarative, component-based way to handle rendering failures**. Just like pages, error pages support:

* **Class-based and factory-based definitions**
* **Declarative or imperative registration**
* **Layouts**, to keep the UI consistent
* **Automatic routing**, based on the error class name
* **Status codes**, via `@PageStatus`
* **Adapter-aware behavior**, for errors at the integration level

You can throw errors from anywhere, services, event handlers, middleware, or even React components using `reactRuntime.throwError()`. Stone.js will route them to the proper **Error Page**, render the view, and return the correct status, SSR, SOR, or SPA.

Behind the scenes, the framework separates:

* **The functional dimension**, where the error is caught, contextualized, and optionally resolved
* **The view dimension**, where the error is rendered to the user via an Error Page

This decoupling gives you full flexibility:

* Create friendly error screens without logic leaks
* Log and track internal failures while keeping users calm
* Support all platforms without branching your error logic

Error Pages in Stone.js are not just pretty fallbacks, they’re **architectural fault boundaries**, cleanly separating disruption from delivery.

Next time something goes wrong? Your system will respond, cleanly, contextually, and compassionately.
