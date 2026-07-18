---
title: Binding
---

Most of the time, route parameters are used to fetch models from a database or external API. With **route model binding**, Stone Router can handle this for you, automatically resolving models and injecting them into your route handlers.

In short: instead of manually fetching a `User` from `params.id`, Stone Router can fetch the `User` for you and inject it directly into `params.user`.

Goodbye boilerplate. Hello clean handlers.

## Local Binding

You can define bindings directly in the route definition using the `bindings` option.

::: tabs#declarative-imperative
@tab:active Declarative

### Declarative API

First, create a service with a method that resolves the model:
```ts
import { Service } from '@stone-js/core';

@Service({ alias: 'userService' })
export class UserService {
  findOneBy(key: string, value: any) {
    // Fetch the user from DB or API
  }
}
```

Then, define your event handler with the `bindings` option:

```ts
import { EventHandler, Get } from '@stone-js/router';
import { IncomingHttpEvent } from '@stone-js/http-core';

@EventHandler()
export class MyController {
  @Get('/users/:id(\\d+)', { bindings: { id: 'userService@findOneBy' } })
  getUser(event: IncomingHttpEvent): unknown {
    return event.params.id; // this is now a full User model
  }
}
```

@tab Imperative

First, define a factory-based service:
```ts
const userService = () => {
  return {
    findOneBy(key: string, value: any) {
      // Fetch the user from DB or API
    }
  }
}

blueprint.set(defineService(userService, true, { alias: 'userService' }))
```

Then, define your route definition with the `bindings` option:

```ts
import { IncomingHttpEvent } from '@stone-js/http-core';

const definition = {
  method: 'GET',
  path: '/users/:id(\\d+)',
  bindings: { id: 'userService@findOneBy' },
  handler: (event: IncomingHttpEvent) => {
    return event.params.id; // this is now a full User model
  }
}
```
:::

### How it Works

* `bindings` takes an object where each **parameter key** maps to a **service method**
* The value must be in the format: `serviceAlias@methodName`
* The method must accept **two arguments**: the parameter name and value
* It must return the resolved model or `undefined`

Stone Router will call this method before your handler and replace the parameter value with the resolved result.

### Custom Binding Key

Sometimes you want to inject the resolved model into a **different parameter name** than the one used in the URL.

You can do that with the `@` symbol in the path definition:

```ts
{
  path: '/users/:user@id(\\d+)',
  bindings: { user: 'userService@findOneBy' },
  handler: (event) => {
    console.log(event.params.user); // Resolved model
    console.log(event.params.id); // Still available too (raw ID)
  }
}
```

* `user@id` means:

  * Use `id` as the **raw parameter**
  * Inject the resolved model under `params.user`

### Optional Parameters

If the bound parameter is **optional**, and no value is present in the request, Stone Router **won’t call the service method** and will simply inject `undefined`.

However, if the parameter is required and no model is found, an **error will be thrown**.

```ts
{
  path: '/users/:user@id(\\d+)?',
  bindings: { user: 'userService@findOneBy' },
  handler: (event) => {
    // event.params.user is either the model or undefined
  }
}
```

## Global Binding

If you want to apply the same model binding logic across multiple routes, you don’t have to repeat yourself.
Stone Router supports **global bindings** to automatically resolve parameters system-wide.

### Setup Time

Use the `blueprint.set` method to declare bindings before the app starts:

```ts
blueprint.set('stone.router.bindings', {
  user: 'userService@findOneBy',
  post: 'postService@findOneBy',
});
```

This means that *any* route with `:user` or `:post` will automatically resolve the associated model, as long as the route includes the matching parameter.

### Runtime

You can also define or override global bindings at runtime using `router.configure()`:

```ts
router.configure({
  bindings: {
    user: 'userService@findOneBy',
    post: 'postService@findOneBy',
  },
});
```

This is handy for dynamic apps or multi-tenant setups where bindings may change based on configuration or environment.

### Notes

* Global bindings apply to all matching parameter names across all routes.
* Local `bindings` always take precedence over global ones.
* Just like local bindings, the resolver methods must accept `(key: string, value: any)` and return the model (or `undefined`).

## Best Practices

Stone Router’s binding system is powerful, but with great power comes great responsibility. Here’s how to get the most out of it:

#### Use Binding for Models, Not Logic

Bindings are ideal for fetching entities like users, posts, products, etc.
Avoid using them to perform business logic or side effects. Keep it clean and predictable.

#### Prefer Local Bindings When Specific

If a route needs a unique way to fetch a model, define the binding locally in that route.
This makes the behavior explicit and easier to debug.

```ts
bindings: { user: 'customUserService@resolveSuspendedUser' }
```

#### Use Global Bindings for Common Entities

If the same parameter shows up everywhere (`:user`, `:post`), define a global binding in `blueprint.set()` or `router.configure()`.
It keeps routes DRY and consistent.

#### Always Handle `undefined`

Bindings return `undefined` when the model isn’t found.
Your handlers should expect that, especially for optional parameters.

```ts
import { isEmpty } from '@stone-js/core';
import { NotFoundError } from '@stone-js/core-http';

if (isEmpty(event.get('user'))) {
  throw new NotFoundError('User not found');
}
```

#### Use Aliases for Services

Make sure the services you bind are registered with a clean `alias` using the `@Service({ alias })` decorator.
It avoids verbose class names and helps with maintainability.

#### Keep Resolution Methods Small and Focused

Binding resolution methods should:

* Take `(key, value)` as arguments
* Return the resolved model or `undefined`
* Avoid heavy logic or side effects

## Summary

Stone Router’s binding system allows you to automatically resolve route parameters into fully-loaded models.
Instead of receiving an ID, your handler can receive the actual object, cleaner, safer, and faster to code.

You can bind models:

* **Locally**, per route, using the `bindings` option
* **Globally**, across all routes, via `blueprint.set()` or `router.configure()`
* With **custom parameter keys** like `:user@id` to decouple URL naming from variable naming

The binding system supports:

* Optional parameters
* Regex-based route params
* Service aliases with method names (`'userService@findOneBy'`)
* Consistent injection via `event.params`

Handle `undefined` when needed, throw smart errors, and keep your resolution logic minimal.

Stone Router takes care of the boilerplate, so you can focus on your domain logic, not your plumbing.  
Feel the power of the Continuum! 😎

