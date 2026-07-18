---
title: Error handlers
---

In Stone.js, an **Error Handler** is your domain’s safety net. It’s where uncertainty becomes clarity, where thrown errors meet intentional handling. Just like an event handler responds to intentions, an error handler responds to disruptions. It’s not an afterthought, it’s a first-class citizen of the framework.

Stone.js encourages you to throw errors freely when something goes wrong. You don’t need to wrap everything in try/catch. Instead, trust the system: **throw first, handle later**. That’s the philosophy. And error handlers are the mechanism that makes it work.

These handlers are context-aware and dimension-specific. In the **initialization dimension**, they help your domain respond gracefully to unexpected situations. In the **integration dimension**, they help adapters transform errors into platform-friendly responses (e.g., an HTTP 500).

No matter where the error happens, Stone.js provides a clean, structured way to:

- Catch and process it
- Log it (if needed)
- Return a proper response (or not)

This clean separation of concerns makes your application more robust, testable, and expressive, fully aligned with the **Continuum Architecture**. Because in a continuum, **the context can fail too**, and your system must respond accordingly.

## Error Handler Fundamentals

Stone.js treats errors as first-class context events. Errors can occur at any point in the system, during setup, initialization, middleware execution, event handling, adapter processing, or even within a user-defined service. That’s expected. What matters is **how you react**.

### Throw Early, Handle Later

In Stone.js, you’re encouraged to **throw errors freely**, wherever something invalid, unexpected, or critical happens. Don't second-guess yourself. If it's an error, `throw`.  
Stone.js will intercept it and route it to the appropriate error handler, based on the **error’s class name** and the **current dimension** (initialization or integration).

This leads to cleaner domain code: you don't litter your logic with try/catch blocks. You express intent through exceptions, and handle them **declaratively** or **imperatively** elsewhere.

### Custom Error Classes: Your Best Friends

Stone.js matches errors to handlers using the **name** of the error class. 
That’s why it’s **strongly recommended** to define your own error classes and explicitly set their names.

```ts
export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}
```

::: important
It's crucial to define a class name explicitly. Because class names can be minified or obfuscated in production, using the class name directly (like `UnauthorizedError`) ensures that your error handlers can always find the right match.
:::

This gives your system semantic clarity and fine-grained control. You can:

- Handle `UnauthorizedError` differently from `NotFoundError`
- Create default fallbacks for all unrecognized errors
- Log critical errors differently from user mistakes

### Error Handler Resolution

When an error is thrown:

1. Stone.js checks for a handler matching the error’s class name.
2. If not found, it checks for a `"default"` handler.
3. If none exists, the system may re-throw or log depending on context.

This resolution is **dimension-specific**, meaning different handlers apply in:

- The **Initialization Dimension** (runtime request, event processing, services)
- The **Integration Dimension** (adapter level: raw input/output handling)

By modeling errors as first-class events, Stone.js turns failure into an opportunity to **observe, adapt, and respond**, all without entangling your business logic.

## Defining an Error Handler

Stone.js supports **three shapes** of error handlers: **class-based**, **function-based**, and **factory-based**. They all share the same goal, to react to a thrown error, but offer flexibility depending on how much context and dependency injection you need.

::: tabs#class-factory-function
@tab:active Class-based
### Class-based Error Handler

Use this shape when you want a clean, injectable class with optional constructor dependencies.

```ts
export class MyErrorHandler {
  handle(error: Error, context: IncomingEvent): unknown {
    // Handle the error
    // Optionally return a response
  }
}
```

The `handle` method will be automatically invoked when the matched error is thrown. If you need services from the container (like a logger), just inject them via the constructor, Stone.js will take care of wiring.

@tab Function-based
### Function-based Error Handler

This is the simplest form, just a plain function. Great for quick logic or when DI isn’t needed.

```ts
export function myErrorHandler(error: Error, context: IncomingEvent): unknown {
  // Handle the error
  // Optionally return a response
}
```

Use this when you don’t need state, services, or complexity, just direct reaction to an exception.

@tab Factory-based
### Factory-based Error Handler

Need dynamic behavior, contextual setup, or access to the container or blueprint? Use a factory. 
The factory returns the actual function-based error handler.

In the **initialization dimension**, the factory receives the container:

```ts
export function myErrorHandlerFactory(container: IContainer) {
  const logger = container.resolve('logger')

  return (error: Error, context: IncomingEvent): unknown => {
    logger.error(error)
    return { message: 'Something went wrong' }
  }
}
```

In the **integration dimension**, it receives the blueprint instead (since no container exists there):

```ts
export function adapterErrorHandlerFactory({ blueprint }: { blueprint: IBlueprint }) {
  return (error: Error, context: AdapterErrorContext<unknown, unknown, unknown>) => {
    // Build the raw platform-specific response
    return context.rawResponseBuilder.add('statusCode', 500)
  }
}
```

This pattern gives you the full flexibility of dependency injection *and* functional purity.
:::

## Dimension-specific Behavior

Stone.js separates error handling concerns between the **initialization** and **integration** dimensions, each with its own context shape and return expectations.

::: tabs#dimensions
@tab:active Initialization
### Initialization Dimension

This is where most error handling occurs, at runtime, while processing requests, executing services, or running handlers. Here, the error handler receives:

- The `error`: any thrown object (ideally a subclass of `Error`)
- The `context`: always an `IncomingEvent`

You can return:

- `undefined`, if you just want to log or swallow the error
- A plain object, to be auto-wrapped as a response
- An `OutgoingResponse`, if you want full control over status code, headers, etc.

Example:

```ts
export class UnauthorizedErrorHandler {
  handle(error: UnauthorizedError, context: IncomingEvent) {
    return OutgoingHttpResponse.create({
      statusCode: 401,
      content: { message: 'Access denied' }
    })
  }
}
```

This dimension is perfect for expressing domain-level meaning, treating errors as part of your application's intentional flow.

@tab Integration
### Integration Dimension

This is lower-level, inside the adapter layer. You’ll only need this if you’re customizing how the system interacts with external runtimes (e.g., AWS Lambda, HTTP server, CLI).

The error handler receives:

```ts
interface AdapterErrorContext<RawEventType, RawResponseType, ExecutionContextType> {
  rawEvent: RawEventType
  executionContext: ExecutionContextType
  rawResponseBuilder: IAdapterEventBuilder<RawResponseOptions, IRawResponseWrapper<RawResponseType>>
}
```

And must return the `rawResponseBuilder`.

Example:

```ts
export class DefaultAdapterErrorHandler {
  async handle(error: any, context: AdapterErrorContext<unknown, unknown, unknown>) {
    return context.rawResponseBuilder.add('statusCode', 500)
  }
}
```

You don’t need this in most apps, but it’s essential for adapter authors or advanced customization.
:::

::: tip
Remember: **the integration dimension speaks the language of the platform**, while the **initialization dimension speaks the language of your domain**.
:::

## Registering Error Handlers

Stone.js gives you two clean ways to register your error handlers, **declaratively** via decorators, or **imperatively** via the blueprint API. Both approaches let you specify which error(s) the handler should respond to.

::: tabs#declarative-imperative
@tab:active Declarative
### Declarative Registration

Use decorators when working with class-based handlers. Each dimension has its own decorator:

- `@ErrorHandler()` for the **initialization** dimension
- `@AdapterErrorHandler()` for the **integration** dimension

You can target a specific error class, multiple errors, or set a fallback with `"default"`.

```ts
import { ErrorHandler } from '@stone-js/core'

@ErrorHandler({ error: 'UnauthorizedError' })
export class UnauthorizedErrorHandler {}
```

```ts
import { AdapterErrorHandler } from '@stone-js/core'

@AdapterErrorHandler({ error: 'default' })
export class FallbackAdapterErrorHandler {}
```

The `error` option accepts:

- A string (the class name of the error)
- An array of strings (multiple error class names)
- The literal `"default"` (for fallback behavior)

This makes error handler resolution predictable and easy to trace.

@tab Imperative
### Imperative Registration

Use this when working with function-based or factory-based handlers, or when you prefer full control over setup.

In the **initialization dimension**, register under:

```
stone.kernel.errorHandlers.<ErrorClassName>
```

In the **integration dimension**, use:

```
stone.adapter.errorHandlers.<ErrorClassName>
```

Where `<ErrorClassName>` is either a specific class or `"default"`.

Example:

```ts
blueprint.set('stone.kernel.errorHandlers.UnauthorizedError', {
  module: myErrorHandlerFactory,
  isFactory: true,
})
```

Or, for a class-based handler:

```ts
blueprint.set('stone.adapter.errorHandlers.default', {
  module: FallbackAdapterErrorHandler,
  isClass: true,
})
```

These keys support both shapes by using the flags:

- `isClass: true` → for class-based
- `isFactory: true` → for factory-based
- no flag → assumes function-based

This structure gives you flexibility without ambiguity. And thanks to the Blueprint system, you’re always working within a well-scoped, testable setup.

Remember, the current adapter is resolved dynamically at runtime. To ensure your error handler is properly registered in the **integration dimension**, you must use a [**blueprint middleware**](../architecture/blueprint#dynamic-configuration).
:::

## Best Practices

Error handling isn’t just about catching problems, it’s about responding to them meaningfully, without coupling your domain to every possible failure. Here’s how to get it right in Stone.js:

#### Create a Custom Error Class for Every Meaningful Error

Using named classes lets you separate concerns cleanly:

```ts
export class UserNotFoundError extends Error {
  constructor(message) {
    super(message)
    this.name = 'UserNotFoundError'
  }
}

export class InvalidPaymentError extends Error {
  constructor(message) {
    super(message)
    this.name = 'InvalidPaymentError'
  }
}
```

This makes your domain expressive and your error handlers precise. No more `if (error.message.includes(...))` hacks.  
And always set the class name explicitly (`this.name = 'UserNotFoundError'`) to avoid minification issues.

#### Avoid Manual try/catch (Except in Specific Use Cases)

Unless you’re doing something low-level (like a retry wrapper), don’t wrap your services or handlers in `try/catch`.  
Just `throw`, and let Stone.js route the error to the right handler, based on dimension and class.

#### Prefer Class or Factory-Based Handlers in Apps With Dependency Injection

Class-based handlers let you inject services (like a logger or reporter) easily. Factory-based handlers do the same, while remaining functional.

```ts
export class LoggingErrorHandler {
  private readonly logger: Logger
  constructor({ logger }: { logger: Logger }) {
    this.logger = logger
  }

  handle(error: Error, context: IncomingEvent) {
    this.logger.error(error)
    return { statusCode: 500, content: { message: 'Oops.' } }
  }
}
```

#### Use the `"default"` Handler as a Safety Net

Always register a fallback error handler. You never know when a surprise error might slip through.

```ts
@ErrorHandler({ error: 'default' })
export class DefaultHandler {
  handle(error: Error, context: IncomingEvent) {
    return OutgoingHttpResponse.create({
      statusCode: 500,
      content: { message: 'Unexpected error' }
    })
  }
}
```

#### Keep Adapter-Level Handlers Platform-Specific

Only use `@AdapterErrorHandler` or `stone.adapter.errorHandlers.*` if you're building custom adapters or doing raw event translation.  
For everything else, stick with the initialization dimension.

#### Never Silently Swallow Errors (Unless You Know Why)

You can return `undefined` from an error handler, but only if you really mean to. Otherwise, make sure the handler logs or transforms the error meaningfully.

#### Never Return Raw Error Messages to the User

Returning `error.message` directly in a response can expose sensitive implementation details, like internal logic, validation secrets, or even stack traces in some cases. This is a **security leak** and should always be avoided in production.

Instead:

- **Log the real error** for debugging or audit purposes.
- **Return a sanitized message** that is meaningful to the user, but not too revealing.

```ts
handle(error: Error, context: IncomingEvent) {
  this.logger.error(error) // Log the real error

  return OutgoingHttpResponse.create({
    statusCode: 500,
    content: { message: 'Something went wrong. Please try again later.' }
  })
}
```

This keeps your system secure, your logs useful, and your users informed, without oversharing.

## Summary

Error handlers in Stone.js are more than catch blocks, they’re part of your system’s architecture. They allow you to separate failure handling from business logic, keeping your domain expressive and clean.

- Use **class**, **function**, or **factory** shapes depending on your needs.
- Register them **declaratively** with decorators or **imperatively** using the blueprint.
- Handle errors by **class name** or set a `"default"` fallback.
- Use the right **dimension**:  
  - Initialization → domain-level errors  
  - Integration → low-level adapter errors
- Always **log the real error**, and **never expose internal messages** to users.

In a continuum-aware system, errors are not an exception, they’re expected. And now, you’ve got everything you need to handle them like a pro.
