---
title: Outgoing Responses
---

In Stone.js, the `OutgoingResponse` represents the **effect** of your application, the answer to an incoming intention. Just as the `IncomingEvent` expresses what the user or system wants, the `OutgoingResponse` expresses what your domain wants to say back.

It travels in the **reverse direction** of an `IncomingEvent`, moving from the functional domain, through the initialization layer, and finally into the integration layer, where it’s interpreted by an adapter (HTTP, Browser, CLI, etc.).

Responses in Stone.js are fully **context-aware**. They support:

returning plain values (like strings or objects)
```ts
const handler = (event: IncomingEvent): { message: string } => {
  // Handle the event and return a response
  return { message: 'Hello world!' }
}
```

using rich response classes (`OutgoingHttpResponse`, `JsonResponse`, `BinaryFileResponse`, etc.)
```ts
const handler = (event: IncomingEvent): { message: string } => {
  return JsonResponse.create({ content: { message: 'Hello world!' } })
}
```

setting status codes, headers, cookies, and more
```ts
return OutgoingHttpResponse.create({
  statusCode: 200,
  content: { message: 'Hello world!' },
  headers: { "X-Custom-Header": "value" },
}).setCookie("session", "abc123", { httpOnly: true })
```

and handling advanced content negotiation, caching, and preparation logic
```ts
return OutgoingHttpResponse.create({ statusCode: 200 })
  .format({
    default: () => '',
    text: () => 'Hello world!',
    html: () => '<p>Hello world!</p>',
    json: () => ({ message: 'Hello world!' }),
  })
```

::: important
While Stone.js automatically wraps primitive return values in an `OutgoingResponse` for event handlers, Initialization middleware must explicitly return an `OutgoingResponse` or one of its subclasses.
:::

This gives you a unified, declarative or programmatic way to represent everything from a JSON API payload to a file download, a browser redirect, or a CLI output, all part of the same continuum.

In the Continuum, every intention deserves a meaningful effect.

## Using `OutgoingResponse`

The `OutgoingResponse` is the base class for all response types in Stone.js. It’s a lightweight, dimension-neutral response that lets you set content, status codes, and preparation logic, all without tying your app to a specific adapter like HTTP or Browser.

You can use it:
- **explicitly**, via `OutgoingResponse.create(...)`,
- or **implicitly**, by returning a value from your event handler (e.g., `return 'Hello World'`), in which case Stone.js wraps it for you.

### When to Use It
Use `OutgoingResponse` directly when:
- You’re building a response in a CLI, test, simple cloud function, or abstract context.
- You don’t need headers, cookies, or transport-specific behavior.
- You want a clean and portable way to emit content for non-HTTP or non-Browser contexts.

### Static Creation

```ts
const response = OutgoingResponse.create({
  content: 'Operation complete',
  statusCode: 200,
})
```

### API Methods

```ts
response
  .setStatus(201, 'Created')
  .setContent({ message: 'Resource created' })
```

| Method                      | Description                                         |
| --------------------------- | --------------------------------------------------- |
| `setStatus(code, message?)` | Set HTTP-style status code and optional status text |
| `setContent(content)`       | Set the body of the response                        |

Even if it’s not an HTTP response, you can still set a status code and message. This is useful for CLI or other non-HTTP contexts where you want to convey success or failure.

## Using `OutgoingBrowserResponse`

The `OutgoingBrowserResponse` is a frontend-only response type. It mimics the behavior of backend responses, but it’s meant strictly for the **browser environment**, whether you're in a full SPA or using client-side hydration in an SSR app.

This class exists to preserve a **unified API experience** between frontend and backend responses in Stone.js. It allows you to return meaningful responses within a browser-based flow, including redirections, without dealing with transport-specific logic like headers or cookies.

### Example

```ts
import { OutgoingBrowserResponse } from '@stone-js/browser-core'

return OutgoingBrowserResponse.create({
  content: '<h1>Welcome!</h1>',
  statusCode: 200
})
```

This response will be interpreted by the browser adapter, it’s never sent as an HTTP response.

### API Helpers

`OutgoingBrowserResponse` provides status code helpers, useful for guards or logic conditions in middlewares:

```ts
response.is2xx()      // true if 2xx success
response.isError()    // true if 4xx or 5xx
response.isOk()       // true if exactly 200
response.isNotFound() // true if 404
```

These help enforce logic consistency even on the client side.

### Redirecting in the Browser

When you want to programmatically **redirect the user to a new frontend route**, use `RedirectBrowserResponse`. This is typically done in middlewares, for example to protect routes:

```ts
import { RedirectBrowserResponse } from '@stone-js/browser-core'

const authMiddleware = ({ securityService }) => (event, next) => {
  if (!securityService.isAuthenticated(event)) {
    return RedirectBrowserResponse.create({ url: '/login' })
  }

  return next(event)
}
```

This triggers the browser adapter to invoke a frontend router redirect. It:
- **does not** set HTTP headers like `Location`,
- **does not** support 301/302 status codes,
- **does not** output HTML or text fallbacks.

Instead, it signals the adapter to reroute using the frontend’s router (`window.history.pushState()` or SPA-equivalent). It’s perfect for **short-circuiting the pipeline** during initialization or middleware execution.

#### When to Use `RedirectBrowserResponse`

- You’re in a **browser app (SPA/PWA)**, not an HTTP server.
- You want to redirect based on middleware logic.
- You want to unify your redirect logic with backend apps for code symmetry.
- Your app has **multiple routes** managed by a router (not mono-route).


## Using `OutgoingHttpResponse`

The `OutgoingHttpResponse` is the main response class for **HTTP server** environments in Stone.js, including REST APIs, SSR applications, and any backend dealing with HTTP transport.

It extends the base `OutgoingResponse`, and brings full HTTP capabilities:
- status codes and messages,
- headers,
- cookies,
- content negotiation,
- ETag and cache control.

It ensures your API responses are fully formed, properly negotiable, secure, and optimized for client expectations.

### Creating an `OutgoingHttpResponse`

You can create a new HTTP response by using the static `create()` method:

```ts
import { OutgoingHttpResponse } from '@stone-js/http-core'

return OutgoingHttpResponse.create({
  content: { message: 'OK' },
  statusCode: 200,
  headers: { 'X-Powered-By': 'Stone.js' }
})
```

You can also build it progressively with fluent chaining:

```ts
return OutgoingHttpResponse
  .create()
  .setStatus(201, 'Created')
  .setHeader('Location', '/items/42')
```

### Core Capabilities

#### 1. Status Codes and Messages

You can control the status code and status message:

```ts
response.setStatus(404, 'Not Found')
```

If no message is given, it automatically uses standard HTTP messages via the `statuses` package.

**Convenience Methods**:
- `isOk()`, `is1xx()`, `is2xx()`, `is3xx()`, `is4xx()`, `is5xx()`
- `isError()`, `isNotError()`
- `isEmpty()` (e.g., 204, 304)
- `isRedirect()`
- `isUnauthorized()`, `isForbidden()`, `isNotFound()`

These help classify the response easily without manual checks. Useful for middleware or guards.

#### 2. Headers Management

Set, get, append, and remove headers easily:

```ts
response
  .setHeader('X-Custom-Header', 'Hello')
  .appendHeader('Set-Cookie', 'token=123')
  .removeHeader('X-Unwanted-Header')
```

Retrieve headers:

```ts
response.getHeader('X-Custom-Header')
response.getHeaderNames() // All header keys
```

::: tip Special behavior
Automatically manages `Content-Type` charset for text-based types.
:::

#### 3. Content Handling

Set the response content:

```ts
response.setContent({ user: { id: 1 } })
```

The system automatically serializes objects, booleans, or numbers into JSON if needed, 
while respecting blueprint JSON namespace `stone.http.json` settings like `spaces`, `replacer`, and `escape`.

```ts
blueprint.set('stone.http.json', {
  spaces: 2,
  escape: true,
  replacer: (key, value) => value,
})
```

**Charset Management**:

```ts
response.setCharset('utf-8')
```

Ensures content types carry the correct charset where appropriate.

#### 4. Cookies Management

Manage HTTP cookies securely and flexibly:

```ts
response
  .setCookie('session', 'xyz', { httpOnly: true })
  .setCookie('theme', 'dark')
  .clearCookie('session')
  .secureCookies(true) // Force Secure attribute on HTTPS
```

Cookies are internally managed through a `CookieCollection` and automatically serialized at preparation.

#### 5. Content Negotiation

You can define a format map:

```ts
return OutgoingHttpResponse
  .create({ statusCode: 200 })
  .format({
    text: () => 'Hello world!',
    default: () => 'Default Content',
    html: () => '<p>Hello world!</p>',
    json: () => ({ message: 'Hello world!' }),
  })
```

During the `onPreparingResponse` stage, Stone.js inspects the `Accept` header from the `IncomingHttpEvent`, and selects the best format.

If no match, it automatically returns a **406 Not Acceptable**.

#### 6. Cache Control and Validation

The `OutgoingHttpResponse` natively supports:
- **ETag** generation
- **Last-Modified** headers
- **Cache Validation**

If an incoming event signals freshness (`If-None-Match` or `If-Modified-Since`), Stone.js automatically transforms the response into a **304 Not Modified**.

You can manually set cache headers:

```ts
response
  .setEtag('abc123')
  .setLastModified(new Date())
```

#### 7. Preparing the Response

Stone.js internally prepares the response during the `onPreparingResponse` stage, 
providing a final opportunity to modify the response before it's sent to the client.

```ts
const onPreparingResponse = ({ event, response }) => {
  // Modify the response before sending
  response.setHeader('X-Prepared', 'true')
}
// Register the hook
blueprint.set('stone.lifecycleHooks.onPreparingResponse', onPreparingResponse)
```

The preparation step:
- Handles content negotiation,
- Serializes cookies,
- Sets charset if missing,
- Calculates and sets `Content-Length`,
- Generates `ETag` if needed,
- Removes `Content-Type` and `Content-Length` for empty responses (204, 304),
- Optimizes HEAD method responses.

And when the response is ready, the hook `onResponsePrepared` is called.

### Example: Typical API Response

```ts
import { OutgoingHttpResponse } from '@stone-js/http-core'

export const handler = async (event) => {
  return OutgoingHttpResponse
    .create()
    .setContent({ hello: 'world' })
    .setStatus(200)
    .setHeader('X-API-Version', '1.0')
}
```

### `RedirectResponse`

Redirect the client with full HTTP semantics (301, 302, 303, 307, 308):

```ts
import { RedirectResponse } from '@stone-js/http-core'

return RedirectResponse.create({ url: '/login', statusCode: 302 })
```

Automatically:
- sets the `Location` header,
- formats fallback HTML/text for better browser compatibility,
- sets caching headers for 301 if needed.

handles `Referrer`-based "go back" behavior (`url: 'back'`):

```ts
return RedirectResponse.create({ url: 'back' })
```

This is useful to redirect users to the previous page they were on.

### `BinaryFileResponse`

The `BinaryFileResponse` class provides a robust way to serve files through HTTP responses, handling all the complexities of file streaming, headers, and browser compatibility.

```ts
import { BinaryFileResponse } from '@stone-js/http-core'

// inline display
return BinaryFileResponse.file({ file: './resume.pdf' })
// download as attachment
return BinaryFileResponse.download({ file: './resume.pdf' })
```

Supports:
- automatic `Content-Disposition`,
- `Content-Length`, `ETag`, and `Last-Modified`,
- optional compression encoding (`.br`, `.gzip`, etc.)

Use `file()` for inline display or `download()` for attachment behavior.

You can configure how the file is served by setting the `stone.http.files.download` namespace in your blueprint:

```ts
blueprint.set('stone.http.files.download', {
  root: './public',
  extensions: ['pdf', 'jpg', 'png'],
})
```

Stone.js use the `send` package under the hood to handle file streaming and serving. So you can refer to its documentation for more advanced options.

### `JsonResponse`

Shortcut for returning structured JSON:

```ts
import { JsonResponse } from '@stone-js/http-core'

return JsonResponse.create({ content: { hello: 'world' } })
```

Automatically:
- sets `Content-Type: application/json`,
- serializes safely with optional escaping,
- supports custom blueprint options (replacer, spacing, etc.).

### `JsonpResponse`

Legacy-safe JSON wrapped in a callback:

```ts
import { JsonpResponse } from '@stone-js/http-core'

return JsonpResponse
  .create({ content: { hello: 'world' } })
  .setCallback('myCallback')
```

Sets:
- `application/javascript` as content type,
- fallback for `<`, `>`, `&` escaping,
- secure comment prefix to prevent JSONP abuse.

::: tip Use case
Use it **only when supporting older or cross-domain clients without CORS**.
:::

## Factory Utilities and Status Decorators

Stone.js provides powerful shortcuts to help you create **properly structured `OutgoingHttpResponse` instances** without manually building everything by hand.

This improves **readability**, **consistency**, and **maintainability** across your application.

You can use:
- **Factory Utilities** for **dynamic**, runtime-defined responses,
- **Decorators** for **static**, declarative, handler-based responses.

Each approach fits a different use case, use the right one depending on your context.

### Factory Utilities

Factory utilities allow you to create ready-to-use responses dynamically at runtime.  
They abstract away the boilerplate of instantiating and preparing `OutgoingHttpResponse` or its subclasses.

Available utilities:

| Factory Function                 | Creates                                            | Default Status Code |
| -------------------------------- | -------------------------------------------------- | ------------------- |
| `createHttpResponse()`           | `OutgoingHttpResponse`                             | 200                 |
| `okHttpResponse()`               | `OutgoingHttpResponse` (200 OK)                    | 200                 |
| `noContentHttpResponse()`        | `OutgoingHttpResponse` (204 No Content)            | 204                 |
| `badRequestHttpResponse()`       | `OutgoingHttpResponse` (400 Bad Request)           | 400                 |
| `unauthorizedHttpResponse()`     | `OutgoingHttpResponse` (401 Unauthorized)          | 401                 |
| `forbiddenHttpResponse()`        | `OutgoingHttpResponse` (403 Forbidden)             | 403                 |
| `notFoundHttpResponse()`         | `OutgoingHttpResponse` (404 Not Found)             | 404                 |
| `methodNotAllowedHttpResponse()` | `OutgoingHttpResponse` (405 Method Not Allowed)    | 405                 |
| `serverErrorHttpResponse()`      | `OutgoingHttpResponse` (500 Internal Server Error) | 500                 |
| `unavailableHttpResponse()`      | `OutgoingHttpResponse` (503 Service Unavailable)   | 503                 |
| `htmlHttpResponse()`             | `OutgoingHttpResponse` (HTML content)              | 200                 |
| `jsonHttpResponse()`             | `JsonResponse` (JSON content)                      | 200                 |
| `jsonpHttpResponse()`            | `JsonpResponse` (JSONP content)                    | 200                 |
| `fileHttpResponse()`             | `BinaryFileResponse` (File download/inline)        | 200                 |
| `redirectHttpResponse()`         | `RedirectResponse` (HTTP redirection)              | 302                 |
| `emptyHttpResponse()`            | `OutgoingHttpResponse` (204 empty JSON)            | 204                 |

#### Example of Use

```ts
import { jsonHttpResponse } from '@stone-js/http-core'

export const handler = (event) => {
  return jsonHttpResponse(
    { message: 'Hello world!' },
    200,
    { 'X-Custom-Header': 'value' }
  )
}
```

This creates a `JsonResponse`, sets the content, status code, and headers in one simple call.

::: tip
Prefer factory utilities in middlewares, functionnal handlers, or when the response characteristics depend on runtime conditions.
:::

### Status Decorators

For **static** and **declarative** responses, Stone.js offers decorators that automatically **wrap your handler’s return value** inside the right `OutgoingHttpResponse` subclass.

Available decorators:

| Decorator                  | Response Created                         |
| -------------------------- | ---------------------------------------- |
| `@HttpResponse()`          | `OutgoingHttpResponse`                   |
| `@OkHttpResponse()`        | `OutgoingHttpResponse` (200 OK)          |
| `@NoContentHttpResponse()` | `OutgoingHttpResponse` (204 No Content)  |
| `@JsonHttpResponse()`      | `JsonResponse`                           |
| `@JsonpHttpResponse()`     | `JsonpResponse`                          |
| `@HtmlHttpResponse()`      | `OutgoingHttpResponse` with HTML content |
| `@FileHttpResponse()`      | `BinaryFileResponse`                     |
| `@RedirectHttpResponse()`  | `RedirectResponse`                       |

Each decorator accepts optional arguments:
- `statusCode` (default depending on decorator)
- `headers` (default `{}`)

#### Example of Use

```ts
import { StoneApp } from '@stone-js/core'
import { JsonHttpResponse } from '@stone-js/http-core'

@StoneApp()
export class Application {
  @JsonHttpResponse(200, { 'X-Custom-Header': 'value' })
  handler (event) {
    return { message: 'Hello world!' }
  }
}
```

- Your handler stays clean: it just returns plain data.
- Stone.js wraps it automatically inside a `JsonResponse`.
- The status code and headers are enforced declaratively.

### Which One Should You Use?

| Situation                                             | Recommendation            |
| ----------------------------------------------------- | ------------------------- |
| Response shape is **static**                          | Use **decorators**        |
| Response depends on **runtime conditions**            | Use **factory utilities** |
| Want **maximum readability** in class handlers        | Use **decorators**        |
| Want **maximum flexibility** in functions/middlewares | Use **factories**         |

::: important
**Do not mix both approaches** for the same handler, it could lead to unexpected behavior.
:::

## Built-in HTTP Middleware

In Stone.js, most HTTP behaviors are **explicit**. You must enable and configure them **yourself** through the Blueprint system.

To help you cover common web requirements easily, Stone.js provides **official built-in middleware** for:

- CORS handling,
- Response compression,
- Serving static files.

These are powerful, highly customizable, and fully integrated with the Continuum Architecture.

#### CORS (Cross-Origin Resource Sharing)

By default, **CORS is disabled** in Stone.js, keeping the system as strict and secure as possible out of the box.

If your application needs CORS (e.g., APIs accessed by a frontend app from another domain), Stone.js provides the official `CORSHeadersMiddleware`.

###### Enabling CORS

To enable CORS:

```ts
import { defineBlueprintMiddleware } from '@stone-js/core'
import { CORSHeadersMiddleware } from '@stone-js/http-core'

blueprint.set(
  defineBlueprintMiddleware(CORSHeadersMiddleware)
)
```

::: important
The `CORSHeadersMiddleware` is a **Blueprint Middleware**.
:::

###### Configuring CORS

You can configure CORS behavior via the `stone.http.cors` namespace in the Blueprint:

```ts
blueprint.set('stone.http.cors', {
  origin: ['https://myfrontend.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['X-Custom-Header'],
  maxAge: 86400,
  successStatus: 204,
  preflightStop: true
})
```

###### CORS Options Reference

| Option             | Type                  | Description |
|--------------------|------------------------|-------------|
| `origin`            | `string \| string[]`    | Allowed origins (`*` for any). |
| `methods`           | `string \| string[]`    | Allowed HTTP methods. |
| `maxAge`            | `number \| null`        | Cache duration (seconds) for preflight results. |
| `credentials`       | `boolean`               | Allow credentials (cookies, auth headers). |
| `exposedHeaders`    | `string \| string[]`     | Headers exposed to browsers. |
| `allowedHeaders`    | `string \| string[]`     | Request headers clients are allowed to use. |
| `successStatus`     | `number`                 | Status for successful OPTIONS preflight (default 204). |
| `preflightStop`     | `boolean`                | If true, stop further processing for OPTIONS preflight requests. |

#### Compression

Compressing HTTP responses can drastically improve performance by reducing payload size.

Stone.js provides `CompressionMiddleware` to handle automatic Gzip or Deflate compression based on client support.

###### Enabling Compression

Register the middleware like this:

```ts
import { defineMiddleware } from '@stone-js/core'
import { CompressionMiddleware } from '@stone-js/http-core'

blueprint.set(
  defineMiddleware(CompressionMiddleware)
)
```

::: important
The `CompressionMiddleware` is an **Initialization Middleware**.
:::

Stone.js will automatically compress responses when the client supports it (based on `Accept-Encoding` headers).

You don’t need to manually compress responses, it happens transparently during the response lifecycle.

#### Static Files

Need to serve static assets (e.g., images, CSS, JavaScript)?  
Stone.js offers `StaticFileMiddleware` for this purpose.

It’s flexible, fast, and respects Continuum rules by staying independent from your domain logic.

###### Enabling Static Files Serving

Register the middleware:

```ts
import { defineMiddleware } from '@stone-js/core'
import { StaticFileMiddleware } from '@stone-js/http-core'

blueprint.set(
  defineMiddleware(StaticFileMiddleware)
)
```

::: important
The `StaticFileMiddleware` is an **Initialization Middleware**.
:::

###### Configuring Static Files

Control where the files are served from and how compression is applied:

```ts
// Set the root directory for static assets
blueprint.set('stone.http.files.rootDir', './public')

// Configure default compression encoding mappings
blueprint.set('stone.http.files.defaultCompressionEncoding', {
  '.br': 'br',
  '.brotli': 'br',
  '.gzip': 'gzip',
  '.gz': 'gzip'
})
```

- `rootDir` points to your static assets folder relative to your app root.
- `defaultCompressionEncoding` maps file extensions to content-encoding strategies if pre-compressed versions are available (e.g., `index.html.gz`).

If a compressed version of a file exists, Stone.js can serve it directly to optimize bandwidth.

## Best Practices

Building responses in Stone.js is powerful, but to maximize **clarity**, **flexibility**, and **portability**, you should follow some important best practices.

#### Let Stone.js Infer Responses in Event Handlers

In your **event handlers**, you don't need to manually create a response unless you want to customize it.
**Just return your data as-is**, and Stone.js will automatically infer the correct `OutgoingResponse` based on your platform (HTTP, Browser, Console, etc.).

Example:

```ts
export class Application {
  handler(event: IncomingEvent): { message: string } {
    // Just return the data
    return { message: 'Hello, world!' }
  }
}
```

Stone.js will automatically wrap the return value into the appropriate `OutgoingResponse` subclass based on the active Adapter.

::: important
Only use explicit response creation when you need to customize headers, status codes, or other response properties.
:::

#### Always Return Explicit Responses in Middleware

Middleware has a different role: it manipulates the **flow** of the application.
In **middleware**, you must **always return an explicit response**:
- Use factory utilities like `jsonHttpResponse()`, `redirectHttpResponse()`, etc.
- Or manually create a response instance if needed (`OutgoingHttpResponse.create({...})`).

Example:

```ts
const authMiddleware = () => (event: IncomingHttpEvent, next: NextMiddleware) => {
  if (!event.hasHeader('Authorization')) {
    return unauthorizedHttpResponse({ error: 'Missing Authorization Header' })
  }
  return next(event)
}
```

This ensures that the system knows exactly when the pipeline is short-circuited and how to format the outgoing response properly.

#### Choose Declarative or Imperative, Not Both

- Use **Status Decorators** (`@JsonHttpResponse`, `@HtmlHttpResponse`, etc.) when your response shape (status code, headers) is **static and predictable**.
- Use **Factory Utilities** (`jsonHttpResponse()`, `redirectHttpResponse()`, etc.) when your response depends on **runtime conditions** (e.g., different statuses, dynamic headers).
- **Never mix** both styles for the same event handler.  
  Mixing declarative and imperative response shaping can cause unexpected behavior and complicate debugging.

Pick the right approach once per event handler.

#### Prefer Built-in Factory Utilities

Always use **provided factory utilities** (e.g., `okHttpResponse`, `serverErrorHttpResponse`) instead of manually creating responses with `OutgoingHttpResponse.create(...)`.

Factories keep your code shorter, safer, and future-proof.

#### Configure CORS, Compression, and Static Files at Blueprint Level

- Register all middleware like `CORSHeadersMiddleware`, `CompressionMiddleware`, and `StaticFileMiddleware` during the **blueprint configuration phase**, not inside handlers.
- Always configure their behavior using **Blueprint namespaces** like `stone.http.cors`, `stone.http.files.rootDir`, etc.

Keeps your application **domain logic pure** and your **integration logic centralized**.

#### Control CORS Explicitly

- Never allow `"*"` (wildcard origin) in production unless strictly necessary.
- Set precise `origin`, `methods`, and `allowedHeaders` to avoid security vulnerabilities.
- Always enable `credentials: true` only when needed.

Proper CORS settings protect your APIs against cross-site security attacks.

#### Serve Static Files Efficiently

- Prefer **pre-compressed** versions of your files (`.br`, `.gzip`) if possible.
- Configure `stone.http.files.defaultCompressionEncoding` to match file extensions with their compression types.
- Keep the `rootDir` outside your main source code folder to isolate static assets cleanly.

This dramatically improves performance for frontend apps and assets.


Follow these practices and your Stone.js application will be **stronger**, **cleaner**, **more extensible**, and **easier to maintain**.

## Summary

`OutgoingResponse` is how your application sends responses in Stone.js.

You can create responses:

- **Declaratively** with decorators like `@JsonHttpResponse()`
- **Imperatively** with factory utilities like `jsonHttpResponse()`
- **Manually** with `OutgoingResponse.create()` if you need full control (rare)

Stone.js automatically handles preparing, wrapping, and sending responses across platforms (backend, frontend, serverless, etc.).

#### Quick How-To

| Situation                | Use                            |
|:--------------------------|:-------------------------------|
| Static response (fixed status, headers) | **Decorators** |
| Dynamic response (runtime decisions) | **Factory utilities** |
| Advanced custom control  | **Manual creation** (rare) |

Prefer **decorators** or **factory utilities** for clean, simple code.

#### Built-in Response Types

| Type                       | When to Use |
|:----------------------------|:------------|
| `OutgoingResponse`          | Base class (low-level) |
| `OutgoingBrowserResponse`   | Frontend-only responses |
| `OutgoingHttpResponse`      | Standard backend HTTP responses |
| `JsonResponse`, `JsonpResponse` | API responses (JSON/JSONP) |
| `RedirectResponse`          | Redirections |
| `BinaryFileResponse`        | Serving files |

Stone.js wraps your domain output cleanly based on where you deploy.

#### Final Tips

- Let Stone.js infer responses in **event handlers**.
- Always return an **explicit response** in **middleware**.
- Register CORS, Compression, Static Files **through Blueprint**.
- Keep your **domain logic pure**, no HTTP pollution inside handlers.

You now master how responses flow in Stone.js, from your domain back to the world.  
Simple, clean, and continuum-aligned.
