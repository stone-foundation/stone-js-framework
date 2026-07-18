---
title: Definitions
---

Before using the router, you need to define your routes.

Stone.js separates **route definitions** from **route instances**. A **route definition** is a blueprint describing the path, method, handler and options for a route. The router uses these definitions to create `Route` instances, which are then matched against incoming events.

There are three main ways to define routes:

* **Declaratively** – via decorators on a class-based event handler.
* **Imperatively** – via blueprint utilities like `defineRoute()` or `defineRoutes()`.
* **At runtime** – using the router instance once initialized.

Each approach has its own use case, but all integrate seamlessly into the Continuum. Whether you’re building an API, a frontend app, or a serverless function, defining routes is consistent and context-aware.

## Static Route Definitions

Static route definitions are declared at setup time, before the application starts.

Stone.js supports two primary ways to define routes statically:

* **Declaratively**, using decorators on class-based event handlers
* **Imperatively**, using functions like `defineRoute()` or `defineRoutes()`

Both approaches are evaluated during the setup phase and are ideal for most use cases. They provide introspection, better tooling, and full compatibility with the blueprint system.

Use static definitions when your routes are known in advance and don’t depend on runtime conditions.


::: tabs#declarative-imperative
@tab:active Declarative
### Declarative Definitions

The declarative approach allows you to define routes using class decorators, providing a clean, organized structure, perfect for modular and introspectable code.

In Stone.js, you declare routes by decorating a class with `@EventHandler()`. This marks the class as a valid event handler for incoming events. The router also offers an alias: `@Controller()`, for those more comfortable with traditional controller-based naming, but **`@EventHandler()` is preferred**, as it stays true to the Continuum philosophy.

Once the class is decorated, you define your route handlers using HTTP method decorators. Here's a summary of them:

| Decorator     | Description                                      |
| ------------- | ------------------------------------------------ |
| `@Get()`      | Defines a route that handles `GET` requests.     |
| `@Post()`     | Defines a route that handles `POST` requests.    |
| `@Put()`      | Defines a route that handles `PUT` requests.     |
| `@Patch()`    | Defines a route that handles `PATCH` requests.   |
| `@Delete()`   | Defines a route that handles `DELETE` requests.  |
| `@Options()`  | Defines a route that handles `OPTIONS` requests. |
| `@Match()`    | Defines a route for a specific method manually.  |
| `@Any()`      | Matches any HTTP method.                         |
| `@Fallback()` | Used to define a fallback route.                 |

Each decorator accepts:

* A **path** as the first argument (e.g., `/users/:id`)
* An optional **options object** as the second argument (we’ll cover options in detail later)

### Example

```ts
import { IncomingHttpEvent } from '@stone-js/http-core';
import { EventHandler, Get, Post, Put, Delete } from '@stone-js/router';

@EventHandler()
export class MyController {
  @Get('/users')
  getUsers(event: IncomingHttpEvent): unknown {
    // Handle GET /users
  }

  @Post('/users')
  createUser(event: IncomingHttpEvent): unknown {
    return event.response.json({ user: {} });
  }

  @Put('/users/:id')
  updateUser(event: IncomingHttpEvent): unknown {
    // Handle PUT /users/:id
  }

  @Delete('/users/:id')
  deleteUser(event: IncomingHttpEvent): unknown {
    // Handle DELETE /users/:id
  }
}
```

This approach is recommended for most Stone.js applications. It offers maximum readability, supports introspection, and aligns naturally with the setup dimension.

@tab Imperative

### Imperative Definitions

If you prefer functional composition or need more dynamic control over route registration, you can define routes imperatively using blueprint utilities.

The router provides two main utilities for this:

* `defineRoute()` – to define a single route
* `defineRoutes()` – to define multiple routes at once

These functions can be passed to the `blueprint.set()` method, making them part of your app’s setup phase.

### Example: Single Route

```ts
import { defineRoute } from '@stone-js/router';
import { IncomingHttpEvent } from '@stone-js/http-core';

const handler = (event: IncomingHttpEvent) => {
  // Handle GET /users
};

blueprint.set(defineRoute('/users', handler, { method: 'GET' }));
```

### Example: Multiple Routes

```ts
import { defineRoutes } from '@stone-js/router';
import { IncomingHttpEvent } from '@stone-js/http-core';

const handler = (event: IncomingHttpEvent) => {
  // Handle request here
};

const definitions = [
  ['/users', handler, { method: 'GET' }],
  ['/users', handler, { method: 'POST' }],
  ['/users/:id', handler, { method: 'PUT' }],
  ['/users/:id', handler, { method: 'DELETE' }],
]

blueprint.set(defineRoutes(definitions));
```

This approach gives you maximum control and works great for:

* Function-based modules
* Applications with dynamic setup
* When combining multiple route definitions from different modules or conditions

Use imperative definitions when you want flexibility, especially in non-class-based designs or external integrations.
:::

## Runtime Definition

In some scenarios, you may need to define routes dynamically, after the application has started. This is called **runtime route definition** and is handled directly through the `router` instance.

Unlike static routes, runtime routes are registered after the router has been initialized. That’s why the only valid place to define them is in a **service provider’s `boot()` method**, where the `router` is guaranteed to be available.

::: tabs#runtime-definitions
@tab:active Fluent
### Chained Route Definitions

The router provides a fluent API (a chaining-style method) for registering routes dynamically. You can call methods like `.get()`, `.post()`, `.put()` and so on, directly on the router instance, the first argument is the path, and the second is the handler function or a route definition options:

```ts
import { Router } from '@stone-js/router';
import { IncomingHttpEvent } from '@stone-js/http-core';
import { Provider, IServiceProvider, IContainer } from '@stone-js/core';

@Provider()
export class MyServiceProvider implements IServiceProvider {
  constructor(private readonly container: IContainer) {}

  boot() {
    const router = this.container.make<Router>('router');

    router
      .get('/users', (event: IncomingHttpEvent) => {})
      .post('/users', (event: IncomingHttpEvent) => {})
      .put('/users/:id', (event: IncomingHttpEvent) => {})
      .delete('/users/:id', (event: IncomingHttpEvent) => {});
  }
}
```

You may refer to this as the **fluent API** or **chained method API**.

@tab Option
### Option-Based Definitions (`define`)

If you prefer a fine-grained structure at runtime, the router also exposes a `define()` 
method that accepts an array of route definition options. This is similar to the static `defineRoutes()` method but allows you to define routes at runtime:

```ts
const definitions = [
  { method: 'GET', path: '/users', handler: (event: IncomingHttpEvent) => {} },
  { method: 'POST', path: '/users', handler: (event: IncomingHttpEvent) => {} }
];

router.define(definitions);
```

@tab Collection
### Collection-Based Registration

For even more control, you can work directly with `Route` and `RouteCollection` classes:

```ts
import { Route, RouteCollection } from '@stone-js/router';

const routes = RouteCollection.create();

routes
  .add(Route.create({ method: 'GET', path: '/users', handler: (event) => {} }))
  .add(Route.create({ method: 'POST', path: '/users', handler: (event) => {} }));

router.setRoutes(routes);
```

This method is useful if you need to manipulate routes manually or store them in collections before applying them.
:::

### Handler Variants with `defineEventHandler`

You can register any handler type (class-based, factory-based, or function-based) using the `defineEventHandler()` utility:

```ts
defineEventHandler(MyClassHandler, false, 'getAll'); // class-based
defineEventHandler(MyFactoryHandler, true);          // factory-based
defineEventHandler(MyFunctionHandler);               // function-based
```

**Example:**

```ts
import { defineEventHandler } from '@stone-js/router';

router.get('/users', defineEventHandler(MyFactoryHandler, true));
```

This utility ensures consistent handler behavior across all dimensions and integrates with dependency injection.

## Definition Object

Every route in Stone.js is defined using a **route definition object**, which specifies how and when a route should match, and how it should behave. This object is used across all route registration APIs, whether declarative, imperative, fluent, or collection-based.

You can set options in any route using the appropriate API:

### Setting Options
You can set options in any route using the appropriate API:


::: code-tabs#router-apis
@tab:active Declarative
```ts
// Declarative API
@Get('/users', { name: 'user.list' })
list() {
  // Handle GET /users
}
```
@tab Imperative
```ts
// Imperative API
defineRoute('/users', handler, { name: 'user.list' })
defineRoutes([
  ['/users', handler, { name: 'user.list' }]
])
```
@tab Fluent
```ts
// Fluent API
router.get('/users', {
  name: 'user.list',
  handler: defineEventHandler(handler),
})
```
@tab Option
```ts
// Option-based API
const definitions = [
  {
    path: '/users',
    method: 'GET',
    name: 'user.list',
    handler: defineEventHandler(handler),
  },
]

router.define(definitions)
```
@tab Collection
```ts
// Collection-based API
routes.add(Route.create({
  path: '/users',
  method: 'GET',
  name: 'user.list',
  handler: defineEventHandler(handler),
}))
```
:::

### Route Definition Properties

| Property            | Type                               | Description                                                              |
| ------------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| `path`              | `string \| string[]`               | Required. The route path(s). Can be a single or multiple values (alias). |
| `method`            | `HttpMethod`                       | HTTP method for the route (`GET`, `POST`, etc.).                         |
| `methods`           | `HttpMethod[]`                     | An array of HTTP methods for the same path and handler.                  |
| `name`              | `string`                           | Named route identifier (used for redirection, generation, etc.).         |
| `fallback`          | `boolean`                          | If true, the route will act as a fallback when no other route matches.   |
| `strict`            | `boolean`                          | Enforces strict segment matching.                                        |
| `protocol`          | `string \| string[]`               | Limits matching to specific protocols (`http`, `https`, etc.).           |
| `domain`            | `string \| string[]`               | Limits matching to specific domains.                                     |
| `defaults`          | `Record<string, unknown>`          | Default values for route parameters.                                     |
| `rules`             | `Record<string, RegExp \| string>` | Validation rules for dynamic parameters.                                 |
| `bindings`          | `Record<string, Binding>`          | Automatically binds parameters to models or resolvers.                   |
| `middleware`        | `Pipe[]`                           | Middleware to apply to this route.                                       |
| `excludeMiddleware` | `Pipe[]`                           | Middleware to explicitly exclude for this route.                         |
| `redirect`          | `string \| object \| Function`     | Redirect instructions when this route is matched.                        |
| `handler`           | `Function \| Class \| Factory`     | Required. The handler to execute when the route matches.                 |
| `children`          | `RouteDefinition[]`                | Child routes for nested matching. Applies only to the option-based API   |

Let’s now explore some of the most used and powerful route options in more detail:

### method / methods

Use `method` to assign a single HTTP verb, or `methods` for an array of verbs.

::: code-tabs#router-apis
@tab:active Imperative
```ts
// Imperative
defineRoute('/users/me', handler, { method: 'GET' })
defineRoute('/users/posts', handler, { methods: ['PUT', 'PATCH'] })
```
@tab Option
```ts
// Option-based
router.define([
  { path: '/users/me', method: 'GET', handler },
  { path: '/users/posts', methods: ['PUT', 'PATCH'], handler },
])
```
:::

Note: `methods` is only available via option-based, or imperative APIs—**not** in declarative, fluent or collection-based APIs.

### name

Use `name` to assign a unique identifier to the route. This name can be used later for redirection, inspection, and URL generation.

::: code-tabs#router-apis
@tab:active Declarative
```ts
// Declarative
@Get('/users/me', { name: 'user.me' })
```
@tab Imperative
```ts
// Imperative
defineRoute('/users/me', handler, { name: 'user.me' })
```
@tab Fluent
```ts
// Fluent
router.get('/users/me', {
  name: 'user.me',
  handler: defineEventHandler(handler),
})
```
@tab Option
```ts
// Option
router.define([
  { path: '/users/me', method: 'GET', name: 'user.me' },
])
```
@tab Collection
```ts
// Collection
routes.add(Route.create({
  path: '/users',
  method: 'GET',
  name: 'user.list',
}))
```
:::

### alias (multiple paths)

To create route aliases, you can provide an array of strings as the `path`:

::: code-tabs#router-apis
@tab:active Declarative
```ts
// Declarative
@Get(['/users/me', '/me'], { name: 'user.me' })
```
@tab Imperative
```ts
// Imperative
defineRoute(['/users/me', '/me'], handler, { name: 'user.me' })
```
@tab Fluent
```ts
// Fluent
router.get(['/users/me', '/me'], {
  name: 'user.me',
  handler: defineEventHandler(handler),
})
```
@tab Option
```ts
// Option
router.define([
  { path: ['/users/me', '/me'], method: 'GET', name: 'user.me' },
])
```
:::

Each alias shares the same handler and configuration.

### protocol

Restrict a route to specific protocols, like `http`, `https`, or custom schemes:

::: code-tabs#router-apis
@tab:active Declarative
```ts
// Declarative
@Get('/users/me', { protocol: ['http', 'https'] })
```
@tab Imperative
```ts
// Imperative
defineRoute('/users/me', handler, { protocol: ['http', 'https'] })
```
@tab Fluent
```ts
// Fluent
router.get('/users/me', {
  protocol: ['http', 'https'],
  handler: defineEventHandler(handler),
})
```
@tab Option
```ts
// Option
router.define([
  { path: '/users/me', method: 'GET', protocol: ['http', 'https'] },
])
```
@tab Collection
```ts
// Collection
routes.add(Route.create({
  path: '/users',
  method: 'GET',
  protocol: ['http', 'https'],
}))
```
:::

### fallback

Fallback routes are special routes that catch unmatched requests:

::: code-tabs#router-apis
@tab:active Declarative
```ts
// Declarative
@Fallback()
// Or
@Get('/fallback', { fallback: true })
```
@tab Imperative
```ts
// Imperative
defineRoute('/fallback', handler, { fallback: true })
```
@tab Fluent
```ts
// Fluent
router.get('/fallback', {
  fallback: true,
  handler: defineEventHandler(handler),
})
```
@tab Option
```ts
// Option
router.define([
  { path: '/fallback', fallback: true },
])
```
@tab Collection
```ts
// Collection
routes.add(Route.create({
  path: '/fallback',
  fallback: true
}))
```
:::

Only one fallback should be defined per route group or domain/protocol combo to avoid ambiguity.

## Group Route Definitions

Route groups allow you to share common options, like `middleware`, `path` prefixes, `name` prefixes, or `protocols`, across multiple routes without repeating yourself.

Stone.js merges route group options intelligently:

* **Strings** (e.g. names, paths) are joined with `.` or `/`
* **Booleans** are merged as-is
* **Numbers** are merged as-is
* **Functions** are merged as-is
* **Objects** are shallow-merged using spread
* **Arrays** are concatenated

This enables clean, composable routing structures at any depth. Groups can be nested, scoped, and reused across the entire router API.

Let’s explore how grouping works across all supported APIs.

### Static Grouping

::: tabs#declarative-imperative
@tab:active Declarative
#### Declarative API

In the declarative approach, you can group routes directly inside a class decorated with `@EventHandler()` (or `@Controller()` as an alias).

```ts
import { EventHandler, Get } from '@stone-js/router';

@EventHandler('/api', { name: 'app', protocol: 'http' })
export class MyEventHandler {
  @Get('/hello', { name: 'hello' }) // => /api/hello, name: app.hello
  hello() {
    return 'Hello World';
  }

  @Get('/goodbye', { name: 'goodbye' }) // => /api/goodbye, name: app.goodbye
  goodbye() {
    return 'Goodbye World';
  }
}
```

All options provided at the class level (group-level) will be merged with the child routes. This is the cleanest and most readable way to group routes declaratively.

@tab Imperative
#### Imperative API

When using `defineRoutes`, you can define groups by nesting route definitions using the `children` property:

```ts
import { defineRoutes } from '@stone-js/router';

blueprint.set(defineRoutes([
  {
    path: '/api',
    name: 'app',
    protocol: 'http',
    children: [
      {
        path: '/hello',
        method: 'GET',
        name: 'hello',
        handler,
      },
      {
        path: '/goodbye',
        method: 'GET',
        name: 'goodbye',
        handler,
      }
    ]
  }
]));
```

The final paths will be `/api/hello` and `/api/goodbye` and the names will be `app.hello` and `app.goodbye`.
:::

### Runtime Grouping

::: tabs#runtime-definitions
@tab:active Fluent
#### Fluent API

The router provides a `group()` method that applies shared options to all subsequent routes in the chain.

```ts
router
  .group('/api', { name: 'app', protocol: 'http' })
  .get('/hello', { name: 'hello', handler })        // => /api/hello
  .get('/goodbye', { name: 'goodbye', handler })    // => /api/goodbye
```

To remove the active group and reset the scope, use `noGroup()`:

```ts
router
  .group('/api', { name: 'app' })
  .get('/hello', { name: 'hello', handler })     // => /api/hello
  .noGroup()
  .get('/hello', { name: 'hello', handler })     // => /hello
```

You can switch groups as needed:

```ts
router
  .group('/api/v1', { name: 'v1' })
  .get('/hello', { name: 'hello', handler })     // => /api/v1/hello
  .group('/api/v2', { name: 'v2' })
  .get('/hello', { name: 'hello', handler })     // => /api/v2/hello
```

@tab Option
#### Option-based API

Grouping also works with the `router.define()` API, using the `children` field exactly as with the static imperative API:

```ts
router.define([
  {
    path: '/api',
    name: 'app',
    protocol: 'http',
    children: [
      {
        path: '/hello',
        method: 'GET',
        name: 'hello',
        handler,
      },
      {
        path: '/goodbye',
        method: 'GET',
        name: 'goodbye',
        handler,
      }
    ]
  }
]);
```

As always, group-level options are automatically merged with children.
:::

### Limiting Group Depth

To avoid overly deep and unreadable routing trees, Stone Router allows you to set a **group depth limit**.

You can configure the `maxDepth` value globally:

```ts
// Setup time
blueprint.set('stone.router.maxDepth', 2);

// Runtime
router.configure({ maxDepth: 2 });
```

This prevents merging group options beyond the configured level. If `maxDepth` is set to `2`, nested groups beyond the second level will no longer inherit or merge parent options.

Set it to `0` to disable the depth limit entirely.

## Best Practices

Here are some tips to keep your route definitions clean, efficient, and maintainable across all APIs:

#### Prefer Declarative for Clarity

* Use the **declarative API** (`@EventHandler`, `@Get`, etc.) for most static routes.
* It promotes introspection, modularity, and better structure.
* Reserve **imperative or runtime** definitions for dynamic or plugin-based use cases.

#### Group Routes to Avoid Repetition

* Always use route groups (`group`, `children`, or decorator options) when routes share common prefixes, middleware, or protocols.
* This improves consistency and reduces duplication.

#### Use `name` for Maintainability

* Naming routes lets you reference them easily in redirections, links, or route-based logic.
* Use dot notation to reflect structure: e.g., `api.users.create`.

#### Avoid Over-Nesting

* Keep route group nesting shallow.
* Use `maxDepth` to prevent unintentional deep merges and preserve readability.

#### Don’t Overuse Runtime Definitions

* Runtime definitions are powerful but should be limited to plugin modules, dynamic loading, or advanced use cases.
* For all known-at-setup routes, stick to static registration.

#### Understand the API Strengths

| API Style        | Best For                                  |
| ---------------- | ----------------------------------------- |
| Declarative      | Most apps, clear structure, IDE-friendly  |
| Imperative       | Dynamic conditions, functional-driven setups |
| Fluent           | Runtime logic, adaptive app structure     |
| Option-based     | Bulk registration, JSON-style configs     |
| Collection-based | Manual `Route` control, advanced filters  |

#### Use `defineEventHandler` for All Handler Types

* This utility ensures consistency when using function-based, factory-based, or class-based handlers.
* It’s especially useful when registering routes imperatively or at runtime.

## Summary

In Stone.js, defining routes is simple, flexible, and context-aware.

You can choose from several route definition styles, **declarative**, **imperative**, **fluent**, **option-based**, or **collection-based**, depending on your application’s structure and runtime needs. Behind the scenes, all of them produce the same powerful `Route` instances that integrate into the Continuum.

Routes can be grouped, composed, and extended with middleware, bindings, validation rules, and more. With clean merging logic, support for nesting, and route, level configuration, you can express complex routing trees with minimal repetition.

When in doubt:

* Use **declarative** definitions for structure.
* Use **imperative** or **option** APIs when you need flexibility.
* Use **groups** to reduce boilerplate.
* Use **named routes** for maintainability.

No matter the style, the Stone Router ensures consistency, modularity, and portability across all dimensions of your application.
