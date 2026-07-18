---
title: Service Container
---

The **Service Container** is Stone.js’s powerful internal dependency injection engine, your system's backstage manager.

It lives in the **Initialization Dimension**, where your system is bootstrapped and prepared to respond to intentions. Within the Continuum Architecture, the service container acts as the **ephemeral internal context**, managing the concrete dependencies that your system needs *right now* to apply its domain logic in the current execution context.

Think of it as the backstage of a play: it doesn’t care about the story (domain), the audience (users), or even the theater (runtime). It just makes sure everyone has their props when they enter the stage.

### Why It Exists

Most applications need to assemble various parts: configs, loggers, services, clients, and helpers. You could wire them together manually... or you could let the Service Container do the job for you.

It provides:

- A clean and automatic way to **register**, **resolve**, and **inject** dependencies
- Support for **singleton** and **factory** lifecycles
- A unified interface for **declarative**, **imperative**, and **explicit** service binding
- Advanced resolution via **destructuring** and **proxy access**

And it does all of this without tying your domain logic to any specific platform or environment.

### Where It Fits in the Continuum

In Stone.js, everything revolves around managing **context**. The container represents the **internal execution context**, tailored and scoped to each system instance. It’s:

- Created during system initialization when an incoming event is received
- Passed into your services and factories
- Destroyed when the system is done processing the event

It is **ephemeral**, which means it lives only for the lifetime of the current event, but it's **universal**, the same mechanism powers your CLI, Lambda, SSR server, or frontend app.

### Core Responsibilities

- **Register services**: via decorators, blueprint configuration, or manual bindings
- **Resolve dependencies**: using `make`, `resolve`, or proxy access
- **Manage lifecycle**: singleton or transient per binding
- **Alias bindings**: make your services portable across build tools and environments

## Accessing the Container

In Stone.js, the **Service Container** is passed to your services so they can resolve their own dependencies. How you access it depends on how your service is defined, **class-based**, **factory-based**, or **function-based** (spoiler: that one’s not allowed).

Let’s break it down.

::: tabs#class-factory-function
@tab:active Class-based
### Class-Based Services

If your service is a class, the container is injected into the constructor. You can receive it either as a single parameter or via destructuring for multiple dependencies.

```ts
import { StoneApp, IContainer } from '@stone-js/core'

@StoneApp()
export class Application {
  constructor(private readonly container: IContainer) {}
}
```

You can also destructure the container to directly access dependencies:

```ts
import { Service } from '@stone-js/core'

interface AdminServiceOptions {
  config: Config;
  userService: UserService;
}

@Service()
export class AdminService {
  constructor({ config, userService }: AdminServiceOptions) {
    // Use config and userService directly
  }
}
```

This works because the container is a **Proxy**, it resolves dependencies as properties.

@tab Factory-based
### Factory-Based Services

Factory functions receive the container as their first argument. You can use it directly or destructure it just like in classes.

```ts
import { defineBlueprintConfig, IContainer, IncomingEvent } from '@stone-js/core'

const Application = (container: IContainer) => {
  return (event: IncomingEvent) => ({ message: 'Hello world!' })
}
```

With destructuring:

```ts
interface ApplicationOptions {
  config: Config;
  userService: UserService;
}

const Application = ({ config, userService }: ApplicationOptions) => {
  return (event: IncomingEvent) => ({ message: config.greeting })
}
```

Factory-based access is ideal when you need dynamic setup or want to pass the container to multiple handlers.

@tab Function-based
### Function-Based Services: Not Allowed

Function-based handlers, that is, direct `(event) => {}` functions, don’t receive the container. Why?

Because there's no place to inject it. They’re not a class, not a factory, and not wrapped in anything.

If you want access to the container in a function-style handler, just wrap it in a factory:

```ts
const handler = ({ config }: IContainer) => {
  return (event) => {
    return { message: config.greeting }
  }
}
```
:::

::: tip
As you can see we don't use `IContainer` directly in the constructor. Instead, we use a custom interface that describes the dependencies we need.  
This is a good practice because it makes your code more readable and maintainable.
:::

## Registering Services

In Stone.js, services can be registered in three main ways, depending on your style and needs:

- **Declarative API**, Clean and class-friendly
- **Imperative API**, Blueprint-based and flexible
- **Explicit API**, Full manual control (for advanced use)

All these methods inject your service into the **Service Container**, making it available for resolution anywhere in the system.

::: tabs#declarative-imperative
@tab:active Declarative
### Declarative API

This is the easiest and most elegant way to register a service, just decorate your class.

#### `@Stone()`, The Foundation

Use the `@Stone()` decorator to register any class into the container. It’s the most generic form, like placing a foundational stone in your app.

```ts
import { Stone } from '@stone-js/core'

@Stone()
export class LoggerService {
  constructor(private readonly container: IContainer) {}
}
```

#### `@Service()`, The Specialized Shortcut

Prefer this when registering actual services. It behaves the same as `@Stone()`, but it's semantically clearer.

```ts
import { Service } from '@stone-js/core'

@Service()
export class UserService {
  constructor(private readonly container: IContainer) {}
}
```

By default, both decorators register your service as a **singleton**. If you want a new instance each time (i.e. a **factory**), set `singleton: false`:

```ts
@Service({ singleton: false })
export class TempService {}
```

You can also add an alias:

```ts
@Stone({ alias: 'logger' })
export class LoggerService {}
```

You’ll learn more about aliases in the [Aliases](#aliases) section.

@tab Imperative
### Imperative API

For more control, or for programmatic setups, use the `defineBlueprintConfig()` function. You register services in the `stone.services` namespace.

```ts
import { defineBlueprintConfig } from '@stone-js/core'

export const mainBlueprint = defineBlueprintConfig((blueprint) => {
  blueprint.add('stone.services', [
    { module: LoggerService, isClass: true },
    { module: TempService, isClass: true, singleton: false, alias: 'temp' }
  ])
})
```

You can also register factory-based services:

```ts
const TempService = (container: IContainer) => {
  return {
    doSomething: () => {/* ... */}
  }
}

blueprint.add('stone.services', [
  { module: TempService, isFactory: true }
])
```
:::

### Explicit API (Advanced Use)

If you want **full control**, you can interact directly with the container. This is only allowed inside a **Service Provider**, not in runtime code.

Here are your options:

#### Bind a constant or instance:

```ts
container.instance('apiUrl', 'https://api.example.com')
```

#### Bind a singleton resolver:

```ts
container.singleton('logger', (container) => new LoggerService(container))
```

#### Bind a factory (new instance each time):

```ts
container.binding('temp', (container) => new TempService(container))
```

#### Conditional bindings (only if not already bound):

```ts
container.instanceIf('apiUrl', 'https://api.example.com')
container.singletonIf('logger', (c) => new LoggerService(c))
container.bindingIf('temp', (c) => new TempService(c))
```

As demonstrated in these examples, the container is passed directly to the class constructor. Since the container is proxied, this enables the destructuring dependency injection (DI) pattern to function seamlessly.

::: tip
Remember: declarative and blueprint-based bindings are preferred for most apps. Explicit binding is for custom infrastructure, service providers, or deep-level modules.
:::

## Resolving Services

Once your services are registered, it’s time to use them. The Stone.js Service Container offers several ways to **resolve** dependencies, from classic methods to some truly elegant tricks using destructuring and proxies.

### `make()`, Classic Resolution

Use `make()` to resolve a registered binding by its name or class.

```ts
const config = container.make('config')
const logger = container.make(LoggerService)
```

If the binding doesn’t exist, `make()` throws an error. Use it when you expect the service to already be bound.

### `resolve()`, Auto-Binding Included

Use `resolve()` when you're not sure if a service is registered. It tries to resolve the binding, and if it doesn't exist, it **automatically binds and returns** it.

```ts
const logger = container.resolve(LoggerService)
```

This is particularly useful for classes that haven’t been registered manually, they’ll be auto-bound as singletons by default.

You can also control that behavior:

```ts
const temp = container.resolve(TempService, false) // Bind as factory instead
```

### Destructuring Resolution

Because the container is a Proxy, you can **destructure** multiple dependencies at once, clean and elegant, especially in constructor or factory parameters.

::: tabs#class-factory-function
@tab:active Class-based
```ts
@Service()
export class AdminService {
  constructor({ config, logger }: { config: Config; logger: Logger }) {
    logger.info(`AdminService started with config: ${config.appName}`)
  }
}
```

@tab Factory-based
It works the same for factory-based services:

```ts
const handler = ({ config, logger }: { config: Config; logger: Logger }) => {
  return (event) => logger.info(`Handling ${event.type}`)
}
```
:::

::: tip
This is our favorite method, readable, intuitive, and type-safe in TypeScript.
:::

### Proxy-Based Resolution

Want to access services like properties? Go for it, the container is a Proxy!

```ts
const logger = container.logger
const userService = container.userService
```

This works thanks to `Proxy.get`, which intercepts property access and calls `make()` under the hood.

::: important
But don’t get carried away, only one-level property resolution is supported. No `container.services.user`, just `container.userService`.
:::

### Factory Access

Need a factory instead of a direct instance? Use:

```ts
const factory = container.factory('myService')
const instance = factory()
```

This is useful for passing service creators around without resolving them yet.

## Aliases

In Stone.js, you can assign **aliases** to your services, alternate names used when resolving a service. This is more than just syntactic sugar. It’s a **best practice** that safeguards your app against name mangling (like minification during bundling), Facilitates destructuring DI, and improves long-term flexibility.

### Why Use Aliases?

Class names can change. Builds can obfuscate. But **aliases** stay consistent.

- Facilitate destructuring DI
- Ensure your code still works after bundling or uglifying
- Make service names friendlier or more descriptive
- Abstract away implementation details

### Setting Aliases

You can set aliases **declaratively**, **imperatively**, or **explicitly**.

::: tabs#declarative-imperative
@tab:active Declarative
#### Declarative (via decorator)

```ts
import { Service } from '@stone-js/core'

@Service({ alias: 'userService' })
export class UserService {}
```

Or with the more generic `@Stone()`:

```ts
@Stone({ alias: ['logger', 'logService'] })
export class LoggerService {}
```

@tab Imperative
#### Imperative (via blueprint config)

```ts
blueprint.add('stone.services', [
  { module: UserService, isClass: true, alias: 'userService' },
  { module: LoggerService, isClass: true, alias: ['logger', 'logService'] }
])
```
:::

#### Explicit (via container method, inside a Service Provider only)

```ts
container.alias(UserService, ['userService', 'usr'])
```

You can assign multiple aliases at once by passing an array.

### Resolving by Alias

Once aliased, you can use the alias anywhere you'd use the class:

```ts
const logger = container.make('logger')
const userService = container.resolve('userService')
```

This also works with destructuring:

```ts
interface HandlerOptions {
  logger: Logger
  userService: UserService
}

const handler = ({ logger, userService }: HandlerOptions) => (event) => {
  logger.info('Handling request')
}
```

Aliases are just keys mapped to real bindings. They’re lightweight, powerful, and totally worth using.

### Always Alias

For every registered service, give it an alias. Whether it’s class-based, factory-based, or even just a plain object, an alias guarantees consistency.

Especially important when:

- Doing destructuring DI
- Using `resolve()` with auto-binding
- Writing frontend code that goes through a build step
- You want to decouple class names from usage

## Checking Bindings

Sometimes you need to know if a service is already registered in the container before resolving or binding it. Maybe you're writing fallback logic, conditional registration, or just debugging your setup.

Stone.js gives you two methods for this, and they’re functionally identical:

```ts
container.has('myService')
container.bound('myService')
```

### Which One to Use?

- `has`, Feels like you're querying a map or dictionary.  
- `bound`, Feels like you're asking “has this been bound already?”

Choose whichever fits your mental model. Under the hood, they do the same thing.

```ts
if (container.has('config')) {
  const cfg = container.make('config')
}
```

```ts
if (!container.bound('logger')) {
  container.singleton('logger', () => new LoggerService())
}
```

### Use Cases

- Registering conditionally with `instanceIf`, `singletonIf`, or `bindingIf`
- Avoiding duplicate bindings when initializing
- Writing fallbacks for dev/test environments
- Debugging container state

::: tip
Need to inspect everything? Use `container.getBindings()` and `container.getAliases()` to peek inside the internals.
:::

## Best Practices

The Service Container in Stone.js is simple by design, but with great power comes great… opportunity for mistakes. Here are the best ways to use it effectively (and avoid common traps).

#### 1. **Prefer Declarative Binding When Possible**

Use `@Service()` or `@Stone()` decorators for most use cases.

- It's clean, readable, and auto-registers the class
- Works well with destructuring
- Encourages a modular, testable architecture

```ts
@Service({ alias: 'userService' })
export class UserService {}
```

#### 2. **Use the Imperative API for Conditional or Dynamic Setup**

Blueprint config (`defineBlueprintConfig`) is great when you need to:

- Register services dynamically based on environment or feature flags
- Set `isFactory`, `singleton`, or `alias` explicitly
- Avoid decorators (e.g. in a shared module or external lib)

#### 3. **Use Explicit API in Infrastructure Code Only**

Explicit binding (`container.singleton`, `container.binding`, etc.) is for advanced use:

- Inside **Service Providers**
- During system bootstrapping or testing
- For edge cases like external libraries, raw values, or mocking

Avoid using it **inside event handlers or business logic**, it breaks the dependency model and can lead to hidden side effects.

#### 4. **Alias Everything**

Always give your services an alias, even if you're registering them by class.

- Keeps your app safe from class name changes or build minification
- Makes services easier to resolve consistently across dimensions

```ts
@Service({ alias: 'logger' })
export class LoggerService {}
```

#### 5. **Use `resolve()` Over `make()` for Auto-Binding**

If you’re not 100% sure the service is already registered, use `resolve()`:

```ts
const logger = container.resolve('logger')
```

`resolve()` will auto-bind and return the service if it’s not already present. `make()` will throw if it’s missing.

#### 6. **Destructure Whenever You Can**

Destructuring the container is the cleanest way to get multiple services at once.

```ts
interface HandlerOptions {
  logger: Logger
  userService: UserService
}

const handler = ({ logger, userService }: HandlerOptions) => (event) => {
  logger.info('Handling request')
}
```

Works in factories, class constructors, and even service providers with basic binding modules.

#### 7. **Don’t Bind During Runtime**

Avoid calling `container.instance()` or similar methods during request/event handling. All bindings should happen:

- At boot time
- In a blueprint
- Inside a service provider

Runtime bindings are hard to track and often lead to inconsistent behavior.

## Summary

The **Service Container** is the beating heart of Stone.js’ initialization flow. It powers your application behind the scenes by managing service lifecycles, resolving dependencies, and keeping your system loosely coupled and easy to evolve.

Let’s recap what you’ve learned:

- The container lives in the **Initialization Dimension** as the **ephemeral internal context**.
- It supports **class-based** and **factory-based** services, but **not** raw function-based handlers.
- You can register services through:
  - **Declarative decorators** (`@Stone`, `@Service`)
  - **Blueprint configuration** (`defineBlueprintConfig`)
  - **Explicit bindings** (`singleton`, `binding`, `instance`), for power users
- Services can be resolved using:
  - `make()`, strict resolution
  - `resolve()`, with fallback auto-binding
  - **Destructuring**, elegant and type-safe
  - **Proxy access**, clean syntax, but only one level deep
- Aliases are your friends. They protect your code from name changes and build processes.
- The container offers both **flexibility** and **discipline**. Follow the best practices and it will stay clean, efficient, and predictable.

Stone.js doesn’t just inject dependencies, it injects clarity into your architecture.
