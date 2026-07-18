---
title: Middleware
---

The flexibility and modularity of Stone.js lie in its middleware system. 
Middleware intercepts incoming data, allowing for inspection, filtering, transformation, and rejection before it reaches its destination. 
For instance, middleware can verify if a user is authenticated, permitting the request to proceed if authenticated or rejecting it otherwise.

Middleware is essential within the Stone.js ecosystem and is utilized across all levels of the **Continuum architecture**:

- [**Configuration Middleware (Pipes)**](#configuration-middleware): Ensures dynamic and adaptive configuration at the configuration layer.
- [**Integration Middleware**](#integration-middleware): Transforms platform inputs into Stone.js events and vice versa at the integration layer.
- [**Initialization Middleware**](#initialization-middleware): Intercepts, transforms, filters, validates, and rejects events as necessary at the initialization layer, applicable globally across functionalities.
- [**Feature Middleware**](#feature-middleware): Intercepts, transforms, filters, validates, and rejects events at the feature layer, applicable either globally or to specific features via the Router and routes.

## Definitions

A middleware in Stone.js is a class that must have a `handle` method, which can be synchronous or asynchronous, 
and be decorated with `@Middleware()`. This decorator binds the middleware automatically to the service container, 
giving it access to services within the container through its constructor.

Each middleware receives a passable as the first parameter of the `handle` method, which contains the data to be transformed. 
Note that the passable differs across layers. 
Refer to the specific documentation for each layer for detailed information on using middleware; here, we provide a brief overview.

::: important
The service container is initialized at the initialization layer, so middleware at lower layers cannot access it since it doesn't exist there. Only middleware at or above the initialization layer can use the services provided by the container.
:::

Here is an example of middleware from the initialization and feature layer:

::: code-tabs#js

@tab:active JavaScript

```js
import { HttpError } from '@stone-js/http-core'
import { Middleware } from '@stone-js/core/decorators'

@Middleware()
export class AuthMiddleware {
  constructor ({ config }) {
    this.config = config
  }

  handle (event, next) {
    if (!event.hasHeader('Authorization')) {
      throw new HttpError(401, 'Unauthorized')
    }

    return next(event)
  }
}
```

@tab TypeScript

```ts
import { Config } from '@stone-js/config'
import { Middleware } from '@stone-js/core/decorators'
import { IncomingHttpEvent, HttpError } from '@stone-js/http-core'

interface CustomBinding {
  config: Config
}

@Middleware()
export class AuthMiddleware {
  private readonly config: Config

  constructor ({ config }: CustomBinding) {
    this.config = config
  }

  handle (
    event: IncomingHttpEvent,
    next: (event: IncomingHttpEvent) => IncomingHttpEvent
  ): IncomingHttpEvent {
    if (!event.hasHeader('Authorization')) {
      throw new HttpError(401, 'Unauthorized')
    }

    return next(event)
  }
}
```
:::

By convention, middleware is registered in the `app/middleware` directory. 
However, since middleware is defined using decorators, you are free to organize them as you see fit, 
as long as they reside in the `app` directory of your application.

## Registration

Middleware can be registered implicitly or explicitly. Implicit registration is done using decorators, 
while explicit registration is handled through configuration files in the `config` directory.

### Configuration Middleware

Here, we give just an overview to facilitate a general understanding of Configuration Middleware within Stone.js. 
For a deeper understanding, please refer to the section on [adaptive configurations](../architecture/blueprint).

#### Implicit Registration

Registered via the `@StoneApp()` decorator:

```js
@StoneApp({
  builder: {
    pipes: [MigrationMiddleware]
  }
})
export class Application {}
```

#### Explicit Registration
Registered in `config/app.mjs`:
```js
export const appOptions = {
  builder: {
    pipes: [
      MigrationMiddleware
    ]
  }
}
```

### Integration Middleware

Here, we give just an overview to facilitate a general understanding of Integration Middleware within Stone.js. 
For a deeper understanding, please refer to the section on adapters.

#### Simultaneous Registration
Define and register middleware, specifying `adapter` for the integration layer, `input` or `output` type, and platform (e.g., `NODE_HTTP_PLATFORM`):
```js
import { Middleware } from '@stone-js/core/decorators'
import { NODE_HTTP_PLATFORM } from '@stone-js/node-adapter'

@Middleware({
  type: 'input',
  layer: 'adapter',
  platform: NODE_HTTP_PLATFORM
})
export class BodyMiddleware {}
```

#### Implicit Registration
Registered via the adapter decorator:
```js
@StoneApp()
@NodeHttpAdapter({
  middleware: {
    input: [BodyMiddleware],
    output: [SendFileMiddleware]
  }
})
export class Application {}
```

#### Explicit Registration
Registered in the adapter configuration file (e.g., `config/node-http.adapter.mjs`):
```js
export const nodeHttpAdapterOptions = {
  adapters: [{
    app: {
      mapper: {
        input: {
          middleware: [BodyMiddleware]
        },
        output: {
          middleware: [SendFileMiddleware]
        }
      }
    }
  }]
}
```

### Initialization Middleware

#### Simultaneous Registration
Define and register middleware, specifying `kernel` for the initialization layer and `input`, `output`, or `terminate` type:
```js
import { Middleware } from '@stone-js/core/decorators'

@Middleware({
  type: 'input',
  layer: 'kernel'
})
export class AuthMiddleware {}
```

#### Implicit Registration
Registered via the `@StoneApp()` decorator:
```js
@StoneApp({
  kernel: {
    middleware: {
      event: [AuthMiddleware],
      response: [CORSMiddleware],
      terminate: [TerminateMiddleware]
    }
  }
})
export class Application {}
```

#### Explicit Registration
Registered in `config/app.mjs`:
```js
export const appOptions = {
  app: {
    kernel: {
      middleware: {
        event: [AuthMiddleware],
        response: [CORSMiddleware],
        terminate: [TerminateMiddleware]
      }
    }
  }
}
```

### Feature Middleware

Here, we give just an overview to facilitate a general understanding of Feature Middleware within Stone.js. 
For a deeper understanding, please refer to the section on [router](../../cookbook/router/).

#### Simultaneous Registration
Define and register middleware, specifying `router` for the feature layer:
```js
import { Middleware } from '@stone-js/core/decorators'

@Middleware({
  layer: 'router'
})
export class AuthMiddleware {}
```

#### Implicit Registration
Registered via the `@RouterProvider()` decorator for common middleware:
```js
import { RouterProvider } from '@stone-js/router/decorators'

@RouterProvider({
  middleware: [AuthMiddleware]
})
export class Application {}
```

Registered via route decorators for specific functionalities:
```js
import { Controller, Get } from '@stone-js/router/decorators'

@Controller()
export class UserController {
  @Get({
    path: '/users',
    middleware: [AuthMiddleware]
  })
  getUsers() {}
}
```

#### Explicit Registration
Registered in `config/router.mjs`:
```js
export const routerOptions = {
  router: {
    middleware: [AuthMiddleware]
  }
}
```

## Middleware Alias

Stone.js allows the use of aliases for middleware, eliminating the need to import classes for registration. Aliases apply only to initialization and feature middleware.

```js
import { Middleware } from '@stone-js/core/decorators'

@Middleware({
  alias: ['auth', 'authMiddleware']
})
export class AuthMiddleware {}
```

Registering via alias:
```js
import { RouterProvider } from '@stone-js/router/decorators'

@RouterProvider({
  middleware: ['auth']
})
export class Application {}
```

## Sorting Middleware

Stone.js allows specifying execution priority for middleware using an object literal with `priority` and `pipe` properties.

```js
import { RouterProvider } from '@stone-js/router/decorators'

@RouterProvider({
  middleware: [{ priority: 1, pipe: 'auth' }]
})
export class Application {}
```

## Middleware Parameters

Additional parameters can be passed to middleware, useful for scenarios like permission checks.

```js
import { Middleware } from '@stone-js/core/decorators'

@Middleware({
  alias: ['hasPermission']
})
export class HasPermissionMiddleware {
  handle(event, next, permissions) {
    // handle logic
  }
}
```

Using middleware with parameters:
```js
import { Controller, Get, Post } from '@stone-js/router/decorators'

@Controller()
export class UserController {
  @Get({
    path: '/users',
    middleware: [{ priority: 1, pipe: 'hasPermission', params: ['LIST_USER_PERMISSION'] }]
  })
  getUsers() {}

  @Post({
    path: '/users',
    middleware: [{ priority: 1, pipe: 'hasPermission', params: ['SAVE_USER_PERMISSION'] }]
  })
  saveUser({ event }) {}
}
```

## Conclusion

Stone.js's flexibility and modularity offer extensive possibilities with middleware, making it a vital component of the framework. Understanding and effectively utilizing middleware is crucial for harnessing the full potential of Stone.js.