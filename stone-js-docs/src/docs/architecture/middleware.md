---
title: Middleware
---

In Stone.js, **middleware** is how you participate in the evolution of the context. It is the mechanism that allows you to **intercept**, **transform**, or even **terminate** the flow of execution, across any dimension of the internal context.

Middleware is **active**. It lives inside the execution pipeline and can control how the system interprets an intention, how it applies domain logic, or how it responds to external inputs.

This makes middleware fundamentally different from [hooks](./lifecycle), which observe the lifecycle without affecting it. Hooks run outside the flow; middleware runs inside it.

Each middleware belongs to a specific **dimension** in the Continuum Architecture:

* [**Setup middleware**](./blueprint.md#use-setup-middleware-for-dynamic-logic) builds and mutates the blueprint before the application is ready
* [**Integration middleware**](./adapter.md#adapter-middleware) transforms external inputs (raw requests) into intentions and intentions into effects (responses)
* **Initialization middleware** controls how an intention is handled by the kernel and domain logic

This page focuses on **Initialization middleware**, where fully-formed incomingEvents are processed. This is the dimension where most application logic lives, and where middleware becomes your primary tool to:

* Apply validation or authorization
* Modify the execution context
* Transform or replace responses
* Catch and handle errors
* Wrap or override the event handler

In this phase, middleware gives you full control over **how** the domain is applied to the context.

::: info
The principles in this page apply to all middleware, regardless of dimension.
For dimension-specific behaviors, 
see the [Blueprint](./blueprint.md#use-setup-middleware-for-dynamic-logic) and [Adapter](./adapter.md#adapter-middleware) documentation.
:::

In the Continuum, middleware is the tool you use to **shape the context from within**. It gives you leverage over structure and flow, not just observation, but action.

## Using Middleware

In Stone.js, all middleware follow a **shared structure**, no matter which dimension they belong to. This structural consistency is a core part of the Continuum Architecture: **only the context and return type change**, the shape remains the same.

Whether you're enriching a blueprint, transforming an adapter’s raw input, or intercepting a request before it reaches the domain, middleware always receives a **context**, a `next()` function, and must return a result.

Stone.js supports three interchangeable middleware variants:

- **Class-based**, required when using the Declarative API with decorators
- **Function-based**, simple, flexible, ideal for functional programming with imperative registration
- **Factory-based**, dynamic and dependency-aware, used when function-based middleware needs to be parameterized or contextualized

You can use any of these shapes in **any dimension**. The continuum doesn’t restrict you, it empowers you to choose what fits best.

### Middleware Signature

All middleware in Stone.js share the **same function signature**, regardless of the dimension they operate in:

```ts
const middleware = <ContextType, ReturnType>(
  context: ContextType,
  next: NextMiddleware<ContextType, ReturnType>
): ReturnType => {}
```

Each middleware receives:
- A `context`: the dimension-specific data for that phase (e.g. `IncomingHttpEvent`, `BlueprintContext`, etc.)
- A `next()` function: used to forward the context to the next middleware in the chain
- A return value: either the result of `next()` or a short-circuited custom response

The middleware can:
- **Mutate** the context before calling `next()`
- **Intercept and modify** the result after `next()` returns
- **Short-circuit** the flow by returning early (e.g. an error response)
- **Break the chain** entirely by throwing an exception

This structure makes middleware expressive, composable, and highly controllable, regardless of where it runs in the continuum.

### Middleware Variants

Stone.js middleware can be written in three interchangeable forms: **class**, **function**, or **factory**.  
Each variant provides the same capabilities and can be used in any dimension, choose the shape that best fits your design or context.

::: tabs#class-factory-function
@tab:active Class-based
#### Class-based Middleware

In class-based middleware, you implement a `handle()` method.  
This form is compatible with the Declarative API and supports dependency injection via the constructor.

```ts
import { IMiddleware, NextMiddleware } from '@stone-js/core'
import { IncomingHttpEvent, OutgoingHttpResponse } from '@stone-js/http-core'

export class MyMiddleware implements IMiddleware<IncomingHttpEvent, OutgoingHttpResponse> {
  private readonly userService: UserService

  // Destructuring dependencies injection from the container
  constructor({ userService }: { userService: UserService }) {
    this.userService = userService
  }
  
  async handle(
    event: IncomingHttpEvent,
    next: NextMiddleware<IncomingHttpEvent, OutgoingHttpResponse>
  ): Promise<OutgoingHttpResponse> {
    // Add contextual info
    const user = await this.userService.getUser(event.get('user-id'))
    event.setUserResolver(() => user)

    // Short-circuit if missing header
    if (!event.hasHeader('X-Request-ID')) {
      return OutgoingHttpResponse.create(
        { status: 400, content: 'Missing X-Request-ID header' }
      )
    }

    // Break the flow completely
    if (event.getUser()?.role !== 'admin') {
      throw new UnauthorizedError('Unauthorized')
    }

    // Continue
    const response = await next(event)

    // Add header to result
    response.setHeader('X-Request-ID', event.getHeader('X-Request-ID'))

    return response
  }
}
```

Use this shape when working with decorators or when you want access to constructor-injected dependencies.

@tab Function-based
#### Function-based Middleware

Function-based middleware is concise, expressive, and ideal for functional use cases or manual registration.

```ts
import { NextMiddleware } from '@stone-js/core'
import { IncomingHttpEvent, OutgoingHttpResponse } from '@stone-js/http-core'

export const MyMiddleware = async (
  event: IncomingHttpEvent,
  next: NextMiddleware<IncomingHttpEvent, OutgoingHttpResponse>
): Promise<OutgoingHttpResponse> => {
  event.setUserResolver(() => ({ name: 'John Doe' }))

  return await next(event)
}
```

Function-based middleware offers full control with minimal boilerplate, and is preferred for most imperative scenarios.

@tab Factory-based
#### Factory-based Middleware

Use a factory when your function-based middleware needs to receive configuration or services from the container.

```ts
import { NextMiddleware } from '@stone-js/core'
import { IncomingHttpEvent, OutgoingHttpResponse } from '@stone-js/http-core'

export const createUserResolverMiddleware = ({ userService }: { userService: UserService }) => async (
  event: IncomingHttpEvent,
  next: NextMiddleware<IncomingHttpEvent, OutgoingHttpResponse>
): Promise<OutgoingHttpResponse> => {
  const user = await userService.getUser(event.get('user-id'))
  event.setUserResolver(() => user)

  return await next(event)
}
```

This shape is useful when you need dynamic logic based on runtime conditions, environment, or resolved services, without using a class.

:::

### Why call `next()`

Calling `next()` signals that your middleware has finished its work and the context should proceed to the next middleware in the chain, or to the final handler if none remain.  
Every middleware **must return a value**, either by returning early, forwarding the result of `next()`, or throwing an error.

This mechanism gives you full control over the execution flow:

#### 1. Modify the context before continuing

Mutate the context before forwarding it to the next step.

```ts
event.setUserResolver(() => user)
```

Here, we attach the user to the `IncomingHttpEvent` before it reaches the handler.

#### 2. Short-circuit the middleware chain

Return early without calling `next()` to skip the rest of the chain.

```ts
if (!event.hasHeader('X-Request-ID')) {
  return OutgoingHttpResponse.create(
    { status: 400, content: 'Missing X-Request-ID header' }
  )
}
```

Middleware must always return an `OutgoingResponse` or a subclass of it. In this case, we return a `400` response and prevent the handler from running.

#### 3. Break the flow entirely

Throw an error to stop execution.

```ts
if (event.getUser()?.role !== 'admin') {
  throw new UnauthorizedError('Unauthorized')
}
```

This halts the pipeline and triggers error handling logic.

#### 4. Act after the rest of the chain

Capture and modify the response after downstream middleware or the handler.

```ts
const response = await next(event)
response.setHeader('X-Request-ID', event.getHeader('X-Request-ID'))
return response
```

This lets you wrap, modify, or augment the final response before it leaves the system.

This simple yet powerful pattern is what makes middleware composable, interruptible, and expressive across all dimensions.

### Sync or Async? Both.

Middleware can be **synchronous** or **asynchronous**, as long as it returns the appropriate value.  
Stone.js handles middleware flow seamlessly, so you're free to mix sync and async styles without friction.

### Use Any Variant, in Any Dimension

Stone.js does not restrict middleware variants by dimension.

You can use:
- **Class-based** middleware
- **Function-based** middleware
- **Factory-based** middleware

…in any dimension:
- [Setup](./blueprint#dynamic-configuration)
- [Integration](./adapter#adapter-middleware)
- Initialization

The only difference is the **context and return type**, which are defined by the dimension itself.

**Continuum means flexibility**, choose the shape that suits your logic, and let the system adapt to it.

## Middleware Registration

Once your middleware is defined, it needs to be **registered** so Stone.js can discover and execute it at the appropriate point in the system lifecycle.

There are two ways to register middleware:

- **Declarative API**, via decorators on class-based middleware
- **Imperative API**, via the blueprint utilities

::: tabs#declarative-imperative
@tab:active Declarative
### Declarative API

To register middleware declaratively, use the `@Middleware()` decorator:

```ts
import { Middleware } from '@stone-js/core'

@Middleware()
export class MyMiddleware {}
```

The decorator is only available for **class-based** middleware and must be used within modules discovered by the blueprint.

You can also pass options to control its behavior (see below).

@tab Imperative

### Imperative API

To register middleware imperatively, you can use the `defineMiddleware` blueprint utility function.

```ts
import { defineMiddleware } from '@stone-js/core'

export const MyMiddlewareHandler = (context, next) => {
  // Middleware logic here
  return next(context)
}

export const MyMiddleware = defineMiddleware(MyMiddlewareHandler)
```

For factory-based middleware, you can pass a factory function that returns the actual middleware function 
and use the `factory` option to indicate that it should be treated as a factory:

```ts
import { defineMiddleware } from '@stone-js/core'

export const MyMiddlewareHandler = () => (context, next) => {
  // Middleware logic here
  return next(context)
}

export const MyMiddleware = defineMiddleware(MyMiddlewareHandler, { factory: true })
```

This approach gives you full flexibility and supports **function-based**, **factory-based**, and **class-based** middleware, with shape metadata.
:::

### Priority and Execution Order

Stone.js executes middleware in the order they are defined, unless you specify a `priority`.

- Lower values run first (`priority: 0` runs before `priority: 10`)
- If no priority is defined, middleware are executed in registration order

::: code-tabs#declarative-imperative
@tab:active Declarative

```ts
@Middleware({ priority: 10 })
export class MyMiddleware {}
```

@tab Imperative

```ts
export const MyMiddleware = defineMiddleware(MyMiddlewareHandler, { priority: 10 })
```
:::

### Middleware Options

Whether registered declaratively or imperatively, you can configure middleware using the following options:

```ts
export interface MiddlewareOptions {
  alias?: string | string[]
  priority?: number
  global?: boolean
}
```

**A complete example:**

::: code-tabs#declarative-imperative
@tab:active Declarative

```ts
@Middleware({ priority: 10, alias: 'auth', global: true })
export class MyMiddleware {}
```

@tab Imperative

```ts
export const MyMiddleware = defineMiddleware(
  MyMiddlewareHandler,
  { priority: 10, alias: 'auth', global: true }
)
```
:::

#### `alias`
A named identifier you can use to reference the middleware later, for example, in route definitions:
```ts
@Get({ middleware: ['auth'] })
```

#### `global`
Set to `true` to apply this middleware to **all IncomingEvent executions** by default.  
If omitted or `false`, the middleware is considered **route-specific** and must be explicitly referenced.

## Best Practices

Middleware is one of the most flexible and expressive features in Stone.js, but with great power comes great opportunity for chaos. Follow these guidelines to get the most out of your middleware design while keeping your system clean, scalable, and continuum-aligned.

#### Keep Middleware Single-Purpose

Each middleware should do **one thing well**.

Good:
- One middleware for authentication
- Another for input validation
- Another for response shaping

Avoid building "mega-middleware" that tries to handle multiple unrelated concerns.

#### Don’t Skip the Return

Every middleware **must return a value**, either:
- A custom response
- The result of `next(context)`
- Or throw an error

Returning `undefined` will break the chain and can result in runtime errors.

#### Use `next()` with Intention

Call `next()` only when you're ready to pass control forward.  
Modify the context before it, and the result after it, but avoid calling it conditionally or in multiple branches unless absolutely necessary.

#### Use Aliases for Reusability

Register middleware with an `alias` to reuse it across routes declaratively.

```ts
@Middleware({ alias: 'auth' })
```

Then reference it in routes:

```ts
@Post({ middleware: ['auth'] })
```

#### Use `global` When Appropriate

Global middleware applies to **all intentions**(`IncomingEvent`). Use this for:
- Logging
- Security headers
- Feature toggles

Avoid `global: true` for logic that only applies to a subset of routes or domains.

#### Choose the Right Shape

- Use **class-based middleware** when you rely on the Declarative API
- Use **function-based middleware** for quick, clear logic
- Use **factory-based middleware** for dynamic, parameterized logic or need DI

All shapes are valid, choose based on context, not preference.

#### Avoid Cross-Dimensional Confusion

Keep dimension-specific logic in its place:
- Use **Setup middleware** for configuration
- Use **Integration middleware** for transforming raw input
- Use **Initialization middleware** for per-intention logic
- Use [**Hooks**](./lifecycle) for passive observation
- Use **Middleware** for active transformation
- Use **Blueprint** for system-wide configuration
- Follow the lifecycle, middleware is powerful because it's scoped

## Summary

Middleware in Stone.js gives you the power to **actively shape the flow of your system**, from the moment an intention is created to the point a response is returned.

In this document, we focused on **initialization middleware**, the most common type used to handle per-event logic like authentication, validation, and context enrichment. But the same principles apply across all dimensions.

**Key takeaways:**
- Middleware always receives a `context`, a `next()` function, and must return a value
- You can write middleware as a **class**, **function**, or **factory**
- Stone.js supports both **Declarative** (via decorators) and **Imperative** (via blueprint) registration
- Middleware can mutate, intercept, short-circuit, or wrap the execution, giving you full control
- Always return a result and keep middleware **single-responsibility and focused**
- Use `alias` and `global` for composability and reuse
- When you need to **transform** the system, use middleware
- When you only need to **observe**, use [Hooks](./lifecycle)

The dimension defines the context. The shape is your choice. That’s the continuum.
