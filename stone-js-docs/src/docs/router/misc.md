---
title: Miscellaneous
next: ../react/
---

This page gathers all the essential router features that don’t belong to a single category, but are still crucial to real-world applications. These include advanced configuration, event hooks, route generation, redirection, navigation, middleware usage, and even runtime inspection of your routing system.

Whether you're debugging, navigating, or dynamically configuring your router, this section is your toolbox.

## Middleware

Middleware are a powerful way to run logic before your route handlers are executed. In Stone.js, middleware can be attached globally (via blueprint) or locally per route.

Router middleware are identical to **initialization middleware**, 
meaning they’re executed in the **initialization dimension** of the incoming event lifecycle.

They’re applied at the **route level** using either:

* a **declarative alias**, if defined with `@Middleware({ alias: 'alias' })`
* or an **imperative function**, passed with `defineMiddleware()`

Once defined, they must be explicitly attached to the route definition using the `middleware` property.

::: tabs#declarative-imperative
@tab:active Declarative
### Declarative Middleware Example

```ts
import { Middleware, IMiddleware, NextMiddleware } from '@stone-js/core';
import { IncomingHttpEvent, UnauthorizedError } from '@stone-js/http-core';

@Middleware({ alias: 'auth' })
export class AuthMiddleware implements IMiddleware<IncomingHttpEvent> {
  handle(event: IncomingHttpEvent, next: NextMiddleware) {
    if (!event.headers.authorization) {
      throw new UnauthorizedError('Unauthorized');
    }
    return next(event);
  }
}
```

Then apply it to a route using its alias:

```ts
@Get('/secure', { middleware: ['auth'] })
getSecureData(event: IncomingHttpEvent) {
  return 'Authorized content';
}
```

@tab Imperative
### Imperative Middleware Example

```ts
import { defineMiddleware, defineRoute } from '@stone-js/router';

const logRequest = (event, next) => {
  console.log('Request received:', event.url);
  return next(event);
};

blueprint.set(
  defineRoute('/log', handler, {
    middleware: [defineMiddleware(logRequest)],
  })
);
```
:::

### Exclude Middleware

You can opt-out from middleware execution, either globally or per route, using the `excludeMiddleware` property:

::: code-tabs#declarative-imperative
@tab:active Declarative

```ts
@Get('/public', { excludeMiddleware: ['auth'] })
```

@tab Imperative

```ts
defineRoute('/public', handler, {
  excludeMiddleware: [defineMiddleware(authMiddleware)],
});
```
:::

This is useful when some routes, like health checks or public endpoints, should bypass default behavior.

## Events

Stone Router is not just reactive, it’s also **eventful**.
It emits specific lifecycle events during the routing process, giving you a chance to hook into the system at runtime.

This is especially useful for logging, analytics, dynamic behavior injection, or debugging route resolution.

### Available Router Events

| Event                | When it triggers                            |
| -------------------- | ------------------------------------------- |
| `RouteEvent.ROUTING` | Right before a route is resolved            |
| `RouteEvent.ROUTED`  | Immediately after a route has been resolved |

These events carry the route object and the incoming event inside their metadata.

### Listening to Router Events (Declarative Listener)

You can create an event listener class and attach it to router events using the `@Listener()` decorator:

```ts
import { RouteEvent } from '@stone-js/router';
import { Listener, IEventListener } from '@stone-js/core';

@Listener({ event: RouteEvent.ROUTING })
export class LogRouting implements IEventListener<RouteEvent> {
  handle(event: RouteEvent) {
    const route = event.get('route');
    console.log('Routing to:', route?.path);
  }
}
```

### Listening to Router Events (Runtime)

You can also subscribe to router events imperatively via the `router.on()` method:

```ts
router.on(RouteEvent.ROUTED, (event: RouteEvent) => {
  const route = event.get('route');
  console.log('Finished routing to:', route?.name);
});
```

This allows full flexibility for dynamic behavior injection, especially useful in multi-tenant or dynamic environments.

## Generate URLs

Sometimes, you need to generate URLs dynamically from your route definitions, whether to build links, redirects, or navigation instructions.
Stone Router provides a straightforward method for this: `router.generate()`.

This method only works with **named routes**, so make sure to define the `name` property in your route definitions.

### `generate()` Method

```ts
const url = router.generate({
  name: 'user.show',
  params: { user: 42 },
});
```

#### Result:

```
/users/42
```

You can also include hash fragments, query strings, and override protocols or domains.

### `GenerateOptions` Interface

```ts
export interface GenerateOptions {
  name: string
  hash?: string
  protocol?: string
  withDomain?: boolean
  query?: Record<string, string>
  params?: Record<string, string>
}
```

#### Example with all options:

```ts
const url = router.generate({
  name: 'user.profile',
  params: { user: 42 },
  query: { lang: 'en' },
  hash: 'settings',
  protocol: 'https',
  withDomain: true,
});
```

#### Result (assuming your route is `user.profile` → `/users/:user`):

```
https://localhost/users/42?lang=en#settings
```

This is especially handy in frontend apps, server-side redirects, or when building hypermedia APIs.

## Navigation

When building frontend applications, you may need to navigate between routes programmatically.
Stone Router provides a `navigate()` method for this purpose.

This method only works in environments that support navigation, such as browsers or SPAs.

::: important
It’s important to note that `navigate()` is not available in backend environments, as they don’t have a navigation context.
:::

### `navigate()` Method

```ts
router.navigate('/users/42');
```

This simple call returns the resolved route URL or navigates in supported environments (e.g., browser or SPA).

If you’re using **named routes**, you can navigate using `NavigateOptions`:

```ts
router.navigate({
  name: 'user.show',
  params: { userId: 42 },
  query: { tab: 'profile' },
});
```

### `NavigateOptions` Interface

```ts
export interface NavigateOptions {
  name: string
  hash?: string
  query?: Record<string, string>
  params?: Record<string, string>
}
```

You can also pass a second argument `replace: boolean` to indicate whether the navigation should replace the current entry in the browser history stack:

```ts
router.navigate({ name: 'user.edit', params: { userId: 42 } }, true);
```

## Redirection

Sometimes, a route doesn’t need to serve an event handler, it just needs to **point somewhere else**.
Whether you’re restructuring your app or managing legacy URLs, Stone Router makes redirection easy with the `redirect` option.

### Static Redirection

To redirect one route to another, simply add the `redirect` option in your route definition:

```ts
[
  {
    path: '/users',
    method: 'GET',
    handler: showUsersHandler,
  },
  {
    path: '/people',
    redirect: '/users',
  }
]
```

This setup will automatically redirect any request to `/people` toward `/users`.

By default, the router performs a **temporary** redirect with **HTTP status 302**.

### Changing Redirect Status Code

If you want a **permanent redirect** (e.g., status 301), you can pass an object instead:

```ts
{
  path: '/people',
  redirect: { 301: '/users' }
}
```

### Dynamic Redirection

For more advanced use cases, you can use a function to determine the redirect dynamically at runtime:

```ts
{
  path: '/people',
  redirect: (route, event) => {
    const isLegacy = true;
    return isLegacy ? { 301: '/users' } : '/home';
  }
}
```

Your function can return either a string or a `{ statusCode: path }` object.
This allows total flexibility, for instance, redirecting based on time, headers, or custom logic.

Redirection works consistently across platforms, and like everything in Stone.js, it’s context-aware.

## Inspections

Stone Router provides a clean API to introspect and analyze the routing layer of your application at runtime.
This can be useful for debugging, monitoring, dynamic navigation, or even building custom tooling.

### Get All Routes

To retrieve all defined routes:

```ts
router.getRoutes(); // => Array<Route>
```

Each item is a `Route` instance, offering full introspection capabilities.

### Check Route Existence

To check if a named route exists:

```ts
router.hasRoute('user.show'); // => true or false
```

You can also check for multiple names:

```ts
router.hasRoute(['user.index', 'user.create']);
```

### Get Current Route

You can retrieve the **current route** at any point during incoming event handling:

```ts
const currentRoute = router.getCurrentRoute(); // => Route
```

Or just get its name:

```ts
const name = router.getCurrentRouteName(); // => 'user.show'
```

Need to verify the current route name?

```ts
router.isCurrentRouteNamed('user.show'); // => true or false
```

### Dump Routes

To export route definitions in a JSON-friendly format (e.g. for debugging or admin UI):

```ts
await router.dumpRoutes(); // => Array<Record<string, unknown>>
```

This gives you a structured list of all route definitions, including names, paths, methods, and options.

### Inspect a Route Instance

Each `Route` instance exposes useful properties:

```ts
route.uri;           // Full URL, e.g., 'http://localhost:3000/users/42'
route.path;          // Path only, e.g., '/users/42'
route.query;         // Parsed query string object
route.hash;          // Hash fragment (e.g., '#tab')
route.method;        // HTTP method, e.g., 'GET'
route.protocol;      // Protocol used, e.g., 'http'
route.domain;        // Domain, if defined
```

Check route characteristics:

```ts
route.hasDomain();      // => true or false
route.isSecure();       // => true if HTTPS
route.isHttpOnly();     // => true if protocol is 'http'
route.isFallback();     // => true if fallback route
route.isStrict();       // => true if strict matching enabled
```

### Get Route Options

You can extract any option used in the route definition:

```ts
route.getOption('path');      // => '/users/:id'
route.getOption('method');    // => 'GET'
route.getOption('strict');    // => true
route.getOption('name');      // => 'user.show'
```

If the option doesn’t exist, it returns `undefined` unless you provide a fallback:

```ts
route.getOption('nonexistent', 'default'); // => 'default'
```

## Printing Routes

When developing or debugging, it’s often helpful to see a full list of all registered routes.
Stone Router provides a CLI command to display them neatly.

### CLI Command

To list all routes defined in your application:

```bash
npx stone router list
```

This command will print a table that includes each route's method, path, name (if defined), and handler type.

Example output:

```
METHOD   PATH                  NAME           HANDLER
GET      /users                user.index     FunctionHandler
POST     /users                user.store     FactoryHandler
GET      /users/:id            user.show      ClassHandler@get
GET      /                     home           FunctionHandler
```

This view makes it easy to:

* Check for duplicate routes
* Spot missing route names
* Confirm handler bindings
* Review overall route coverage

### Use Cases

* Quickly review routes during development
* Document your API endpoints
* Verify generated route structure after group nesting
* Audit routing setup in large applications

## Best Practices

The Stone Router is powerful and flexible, but with great power comes great... routing responsibility.
Here are some practical tips to help you keep your routing clean, maintainable, and continuum-aligned:

#### Prefer Named Routes

Always give your routes a `name`.
This allows you to use programmatic features like `generate`, `navigate`, and `redirect` with confidence and clarity.

```ts
@Get('/users/:id', { name: 'user.show' })
```

#### Use Route Groups for Shared Options

Avoid repetition by grouping routes with shared `path`, `protocol`, `middleware`, or `name` prefixes.

```ts
@EventHandler('/admin', { middleware: ['auth'], name: 'admin' })
```

#### Always Validate Dynamic Parameters

Use either inline or explicit rules to ensure your route parameters are predictable:

```ts
path: '/users/:id(\\d+)' // or
rules: { id: /\d+/ }
```

This avoids accidental matches and improves route resolution clarity.

#### Leverage Model Binding for Cleaner Handlers

Instead of writing boilerplate to fetch models from IDs, use `bindings` to inject them directly:

```ts
bindings: { userId: 'userService@findOneBy' }
```

It keeps your handler logic focused on domain behavior, not plumbing.

#### Avoid Deep Route Nesting

Stone Router supports deep group nesting, but that doesn’t mean you should abuse it.
Set a reasonable `maxDepth` and keep routes flat when possible:

```ts
blueprint.set('stone.router.maxDepth', 2)
```

This improves readability and debuggability.

#### Use `excludeMiddleware` Sparingly

It's better to be precise with your `middleware` configuration than to globally apply then exclude.
Use `excludeMiddleware` only when you have an edge case, not as your primary strategy.

#### Avoid Optional Parameters in the Middle of Paths

Optional segments should always go at the end to avoid ambiguity:

✅ `/users/:id/:tab?`
🚫 `/users/:optional?/settings`

#### Don't Over-Rely on Aliased Paths

Defining multiple paths for the same route (`path: ['/users', '/people']`) is powerful but should be used with moderation, or your routing can quickly become hard to reason about.

#### Dump and Print Routes in Development

Use `router.dumpRoutes()` or `npx stone router list` frequently during development to keep an eye on what’s really going on in your system.

## Summary

Stone Router goes beyond just defining and resolving routes, it empowers you with tools to introspect, adapt, and navigate with precision.
The miscellaneous features complete the routing experience by offering:

* **Middleware support** for fine-grained control at the route level
* **Exclusion mechanisms** for tailoring execution flow
* **Lifecycle events** to hook into the routing process
* **Generation utilities** to create URLs dynamically from route names
* **Programmatic navigation** for frontend only applications
* **Redirection shortcuts** for cleaner aliases and HTTP rewiring
* **Inspection methods** to audit, debug, and validate route behavior
* **CLI printing** for an instant view of your route map

These capabilities make Stone Router not just a router, but a **routing platform**, deeply integrated into the Continuum, fully aware of its context, and ready to operate seamlessly in both backend and frontend applications.

When in doubt, inspect.
When working at scale, name and group.
And when routing feels messy, remember: with Stone.js, everything is a continuum.
