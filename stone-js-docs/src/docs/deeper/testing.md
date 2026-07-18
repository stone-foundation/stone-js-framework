---
title: Testing
prev: ../react/misc
---

Testing in Stone.js is a first-class concern, but like everything in the Continuum, **context defines how**.

Stone.js supports **unit testing** out of the box using [Vitest](https://vitest.dev). That means you can write fast, isolated tests to validate your application logic, without needing the full application runtime. Whether you’re working with imperative functions or declarative classes, the goal is the same: **test your behavior, not your wiring**.

At the moment, **only unit testing is officially supported**. There is no native library for full integration testing yet, but the architecture is already designed to support it in the future.

Stone.js offers two programming paradigms, **imperative** and **declarative**, and they influence your testing approach:

* **Imperative code** is straightforward to test. It’s function-first, has no decorators, and can be instantiated directly.
* **Declarative code** requires some setup. Since it uses decorators (`@StoneApp`, `@NodeHttp`, `@UseReact`, etc.), you’ll need to **mock those decorators** to isolate your logic and avoid triggering the full application lifecycle.

This page will walk you through best practices for testing both styles, show you how to mock decorators in declarative modules, and help you maintain testable, reliable code, without depending on platform details.

Because in Stone.js, your domain code doesn’t care where it runs, and neither should your tests.

## Testing Philosophy in Stone.js

In Stone.js, testing isn’t just a task, it’s a reflection of how you design your system.

Thanks to the **Continuum Architecture**, your application is split between:

* **External context**: unpredictable, adapter-specific inputs like HTTP requests or CLI args.
* **Internal context**: your logic, services, and decisions, all of which **can and should be tested**.

This clean separation means your **handlers, components, and services** are completely testable in isolation. If your handler can’t be tested without spinning up a server or parsing JSON manually, you’re doing something wrong.

### What to Test

* Your logic: anything that depends on parameters, state, or injected services.
* Your event handlers: inputs go in (`IncomingEvent`), outputs come out.
* Your render methods (for React/Vue): return valid components based on inputs.

### What NOT to Test

* ❌ Blueprint behavior (e.g. lifecycle hooks, middleware registration).
* ❌ Decorator wiring, it’s framework-level.
* ❌ Platform integration (e.g. “is my CLI adapter running?”), that’s for future integration tests.

### Why it Works

This model works because Stone.js doesn’t blur the lines. **You control your domain**, we take care of the runtime. That’s what allows you to test without setting up servers, configuring routers, or loading environment variables.

If your test has too much setup, ask yourself:

“Am I testing my logic, or the framework?”

Keep it focused. Keep it fast. Keep it pure.

## Testing Imperative Code

In Stone.js, **imperative code is testing paradise**.

No decorators. No magic. Just pure, explicit code that returns values and logs side effects. Whether you’re building an HTTP handler, a CLI tool, or a React component using `defineComponent`, you can test it like any regular function or factory.

### Factory-based Handlers

Let’s say you’ve created an event handler like this:

```ts
export const Application = ({ logger }: AppOptions) => {
  return (event: IncomingEvent): ResponseData => {
    const message = `Hello ${event.get<string>('name', 'World')}!`
    logger.info(message)
    return { message }
  }
}
```

Your test is simple:

```ts
describe('Application', () => {
  let mockedLogger: ILogger
  let app: FunctionalEventHandler

  beforeEach(() => {
    mockedLogger = { info: vi.fn() } as ILogger
    app = Application({ logger: mockedLogger })
  })

  it('should respond with the expected message', async () => {
    const event = { get: () => 'World' } as IncomingEvent
    const response = await app(event)
    expect(response.message).toBe('Hello World!')
    expect(mockedLogger.info).toHaveBeenCalledWith('Hello World!')
  })
})
```

There’s **nothing special** about this test, and that’s exactly the point.

::: tip
Always mock your services (`logger`, `env`, `db`, etc). Your handler should never talk to real infrastructure.
:::

### React with Factory (Imperative)

When using `defineComponent`, you usually return two methods: `handle()` and `render()`.

You can test them separately:

```ts
const app = Application({ logger: mockedLogger })

// Test handler
const response = app.handle(event)
expect(response.message).toBe('Hello World!')

// Test render
const html = renderToString(app.render({ data: response }))
expect(html).toMatchSnapshot()
```

Yes, you can even snapshot test your render output, because it's just a function returning JSX.

::: tip Remember
Stone.js doesn't care about React Server vs Client, `render()` is your domain logic, testable like anything else.
:::

## Testing Declarative Code

Declarative code in Stone.js is powered by decorators like `@StoneApp`, `@NodeHttp`, `@UseReact`, etc. These decorators are evaluated at runtime, perform metadata injection, and connect your class to the Blueprint system.

That’s awesome in production, but in tests, **you want none of it**.

### Why It’s Tricky

When you write:

```ts
@StoneApp()
@NodeHttp()
export class Application implements IEventHandler<IncomingEvent> {
  // ...
}
```

You’re telling Stone.js to bootstrap your class with configuration, lifecycle, and platform logic. In a test, however, you just want to:

1. Instantiate the class manually.
2. Inject mock services.
3. Call `handle()` or `render()`.

But decorators interfere. They expect runtime metadata and might trigger side effects (like adapter registration). That’s why you need to **mock them** before running tests.,

### Strategy: Mocking the Decorators

Here’s how to do it with Vitest:

```ts
vi.mock('@stone-js/core', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    StoneApp: vi.fn(() => vi.fn()),
  }
})
```

You do this for **every decorator** your class uses.

Repeat for:

* `@NodeHttp` or `@NodeConsole`
* `@Browser`
* `@UseReact`

Mocking them ensures that decorators become **no-ops**, your class behaves like any other class.,

### Example: React Declarative Component

```ts
describe('Application', () => {
  let app: Application
  let mockedLogger: ILogger

  beforeEach(() => {
    mockedLogger = { info: vi.fn() } as ILogger
    app = new Application({ logger: mockedLogger })
  })

  it('should handle the incoming event correctly', () => {
    const event = { get: () => 'World' } as ReactIncomingEvent
    const response = app.handle(event)
    expect(response.message).toBe('Hello World!')
    expect(mockedLogger.info).toHaveBeenCalledWith('Hello World!')
  })

  it('should render the message', () => {
    const html = renderToString(app.render({ data: { message: 'Hello World!' } }))
    expect(html).toMatchSnapshot()
  })
})
```

Even with decorators mocked, everything else works the same, you instantiate, inject, test. Clean and simple.,

### Example: Backend Declarative Service

Same strategy, but for a backend service instead of a React component:

```ts
describe('Application', () => {
  let app: Application
  let mockedLogger: ILogger

  beforeEach(() => {
    mockedLogger = { info: vi.fn() } as ILogger
    app = new Application({ logger: mockedLogger })
  })

  it('should handle the incoming event correctly', () => {
    const event = { get: () => 'World' } as IncomingEvent
    const response = app.handle(event)
    expect(response.message).toBe('Hello World!')
  })
})
```

::: important
You’re not bypassing the framework, you’re focusing on what you control. Your class, your logic, your test.
:::

## Test Organization

A good test suite is like a good blueprint: cleanly structured, easy to navigate, and aware of its context. In Stone.js, your project should maintain a clear separation between:

* **Production code** (loaded and bundled at runtime),
* **Test code** (used only during testing).

### Required Structure

The **official Stone.js requirements** is to place all your test files in a dedicated `/tests` folder:

```
/app
  /Application.ts
/tests
  /Application.test.ts
```

This keeps your build clean and your concerns separated.
Stone.js uses the `app/` folder (or any custom input path) as the source of production code, so test files colocated in `app/` can be mistakenly included in your runtime bundle.

### Can I Colocate Test Files?

No, Support for colocated test files **may be added in a future version** of Stone.js.

But for now, **stick to the `tests/` folder**.
It’s clean, safe, and aligns with the continuum principle of separating context.

### Naming Conventions

Use `.test.ts`, `.spec.ts`, or similar extensions, Vitest detects them automatically.
Good examples:

* `Application.test.ts`
* `Logger.spec.ts`

Avoid vague names like `main.test.ts` unless it’s really your app entry point.

### Grouping and Structure Tips

* Use `describe()` blocks to group tests by behavior or module.
* Use `beforeEach()` for common setup.
* Keep tests short, specific, and named by *what* they do, not *how*.

If you’re testing both `handle()` and `render()` in a component, you can split them into focused files:

```
Application.handle.test.ts
Application.render.test.ts
```

## Limitations and What’s Next

Stone.js is designed for **unit testing first**, and it does that exceptionally well thanks to its **clean separation of internal and external context**.

But when it comes to **integration testing**, things are a bit more nuanced.

### What You *Can’t* Do (Yet)

* ❌ You can’t simulate a **full internal context lifecycle** from the outside.
* ❌ You can’t programmatically test the blueprint as it runs through `configure`, `afterConfigure`, and internal lifecycle hooks like `onStart`, `onInit`, or `onStop`.
* ❌ You can’t test how adapters and decorators behave **in real runtime conditions** within a Vitest test suite.
* ❌ You can’t test lifecycle behavior triggered by `IncomingEvent` through Stone’s runtime stack, yet.

Why? Because:

* Decorators don’t execute their full effect outside of the framework’s dimensions.
* The Blueprint lifecycle is dynamic, introspected, and adapter-dependent.
* Adapters are event-driven (HTTP, CLI, Lambda, etc.) and can’t be invoked in Vitest without faking the whole environment.

### Real-World Workaround: Manual Integration Testing with Postman

You can still test your full stack, manually.

If your app exposes a real adapter (e.g. HTTP via `@NodeHttp()`), just run the app and **send real events using Postman, Curl, or any HTTP client**.

This allows you to:

* Validate request/response behavior.
* See logs, status codes, and returned payloads.
* Confirm your Blueprint is wired correctly.
* Trigger the actual internal context lifecycle (`onStart`, `onInit`, etc.).

It's not automated yet, but it’s real integration testing, and great for catching wiring mistakes, decorator bugs, and lifecycle issues.

### What’s Coming

We’re working toward providing official support for:

* 🧪 **Integration test utilities**: programmatically run the full **Blueprint and internal context lifecycle**, including hooks like `onStart`, `onInit`, and `onStop`.
* 🧠 **Runtime-aware test harness**: test classes with decorators *without* mocking, by simulating the application runtime.
* 🧰 Maybe even a **Stone.js test runner**, designed specifically to run isolated, full-context app instances in test environments.

Until then, **unit tests keep your logic rock solid**, and **manual tests** help validate your configuration and runtime behavior.

Think of it this way: unit tests are for your brain, integration tests are for your nerves.


## Best Practices

Whether you write imperative or declarative Stone.js code, 
the goal of testing is the same: **test the effect of your logic, not the glue of the framework**.
Because the framework is already tested, and you don’t need to repeat that.

Here are some essential best practices to keep your test suite clean, fast, and meaningful.

#### Prefer imperative code for testability

* It’s simpler to instantiate.
* No decorators to mock.
* Perfect for handlers, factories, utilities, and even render logic.

If test coverage matters and you don’t need the benefits of decorators, go imperative.

#### Mock everything external

* Use `vi.fn()` or `vi.mock()` to replace:

  * Loggers
  * Environment access
  * HTTP clients
  * Database services

If it wasn’t created in your test, assume it’s external and mock it.

#### Always mock decorators in declarative code

You don’t want decorators to register metadata or execute platform logic in your test. Use `vi.mock()` to replace them with no-op functions.

```ts
vi.mock('@stone-js/core', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    StoneApp: vi.fn(() => vi.fn()),
  }
})
```

This way, your class behaves like a plain class.

#### Separate handler logic from rendering

If you're writing components with both `handle()` and `render()`, test each one in isolation.

```ts
const response = app.handle(event)
expect(response.message).toBe('Hello')

const html = renderToString(app.render({ data: response }))
expect(html).toMatchSnapshot()
```

#### Use consistent test structure

* `beforeEach` for shared setup (e.g., mocking the logger).
* Use `describe()` to group tests by module/class.
* Prefer `*.test.ts` files colocated in a `/tests` directory.

#### Focus on behavior, not implementation

Don't test internal properties. Test:

* The response returned
* The methods called (via mocks)
* The side effects (like logging)

Assert what the user sees, not how it’s done.

#### ❌ Don’t test Blueprint wiring

That’s not your responsibility. Stone.js bootstraps everything at runtime, your test shouldn’t care whether the `defineBlueprintConfig()` works. It’s framework territory.

## Summary

Testing in Stone.js is all about **clarity, control, and context**.

Thanks to the Continuum Architecture, your logic lives in a clean, testable internal context, and your runtime-specific adapters stay out of the way. That means your code can be tested like any pure function or class, using fast and familiar tools like Vitest.

Here’s the TL;DR:

* ✅ **Unit testing is fully supported** with Vitest.
* ✅ **Imperative code** is easy to test, no decorators, no surprises.
* ✅ **Declarative code** is also testable, just mock the decorators.
* ✅ **Render logic** can be tested with snapshot or string-based assertions.
* ⚠️ **Integration testing** is not automated yet, but can be done manually using tools like Postman.
* 🔜 Full-context integration test support (including lifecycle hooks like `onStart`, `onInit`, and `onStop`) is planned for future releases.

So for now, keep your code modular, mock your context, and test what you control. You don’t need a runtime to prove your logic is solid.

Because in Stone.js, logic should be universal, and testable anywhere.
