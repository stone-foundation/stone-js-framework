---
title: Cookies
---

Stone.js provides a simple, universal API for managing cookies across all environments, Node.js servers and browsers alike.  
In the spirit of the Continuum Architecture, cookie management is fully integrated into the platform layer, offering a **single, context-aware API** regardless of where your code runs.

Cookies can be accessed from incoming events (such as `IncomingHttpEvent` and `IncomingBrowserEvent`) and attached to outgoing responses (`OutgoingHttpResponse`, `OutgoingBrowserResponse`).

You can easily:

- **Read** cookies from incoming events.
- **Set** cookies in outgoing responses.
- **Clear** cookies when needed.

Because the Stone.js Cookie API abstracts the underlying platform differences, you can use exactly the same code on the server and in the browser, no conditions, no special cases.

Here’s a quick glimpse:

```ts
// Reading a cookie from an incoming event
const authToken = event.getCookie('auth_token')?.getValue();

// Setting a cookie on an outgoing response
response
  .setCookie('session', 'abc123', { httpOnly: true })
  .secureCookies(true); // Mark all cookies as secure
```

Now that you know where cookies fit, let's dive into the Cookie API itself.

## Cookie API

Stone.js offers two main classes to work with cookies:

- `Cookie`
- `CookieCollection`

Both are simple, powerful, and fully platform-agnostic.

### Cookie Class

The `Cookie` class represents a single cookie instance.  
You usually won’t need to create `Cookie` objects manually, Stone.js handles that for you, but it’s good to know how they behave.

| Method                                 | Description                                                                           |
| :------------------------------------- | :------------------------------------------------------------------------------------ |
| `getValue()`                           | Retrieve the cookie's value, automatically deserialized if needed.                    |
| `setExpires(date)`                     | Set an expiration date for the cookie.                                                |
| `setSecure(true \| false)`             | Mark the cookie as secure or not.                                                     |
| `cloneWith(value, options?)`           | Create a copy of the cookie with a new value or options.                              |

**Example:**

```ts
// Getting a cookie value
event.cookies.get('userPreferences').getValue();

// Setting a cookie securely
response.cookies.get('userPreferences').setSecure(true);
```

If the cookie value is an object, Stone.js will automatically serialize it safely behind the scenes.

### CookieCollection Class

The `CookieCollection` represents a set of cookies.  
When you use `event.cookies` or `response.cookies`, you are dealing with a `CookieCollection`.

| Method                           | Description                                             |
| :------------------------------- | :------------------------------------------------------ |
| `add(name, value, options?)`     | Add a new cookie.                                       |
| `update(name, value, options?)`  | Update an existing cookie.                              |
| `get(name)`                      | Get a specific cookie by name.                          |
| `getValue(name)`                 | Get a cookie's value directly.                          |
| `has(name)`                      | Check if a cookie exists.                               |
| `remove(name, options?, force?)` | Remove a cookie, optionally forcing immediate deletion. |
| `clear(force?)`                  | Clear all cookies from the collection.                  |
| `all(serialize?)`                | Get all cookies as an object or serialized strings.     |
| `secure(true \| false)`          | Mark all cookies as secure.                             |
| `setOptions(options)`            | Apply global options to all cookies.                    |

**Example:**

```ts
const cookies = event.cookies;
const userPref = cookies.getValue('userPreferences', { theme: 'light' });

response.cookies
  .add('session', 'abc123', { maxAge: 3600 })
  .update('userPreferences', { theme: 'dark' })
```

::: important
You almost never have to think about cookie parsing or formatting yourself, Stone.js does it automatically.
:::

### CookieOptions Type (Quick Overview)

When setting a cookie, you can pass standard options:

| Option     | Type                        | Description                              |
| ---------- | --------------------------- | ---------------------------------------- |
| `expires`  | `Date`                      | Expiration date for the cookie.          |
| `maxAge`   | `number`                    | Max age in seconds.                      |
| `httpOnly` | `boolean`                   | If true, cookie is inaccessible to JS.   |
| `secure`   | `boolean`                   | If true, cookie only sent over HTTPS.    |
| `path`     | `string`                    | Cookie path (default: `/`).              |
| `domain`   | `string`                    | Cookie domain.                           |
| `sameSite` | `'lax' | 'strict' | 'none'` | SameSite policy for cross-site security. |

These are passed when creating or setting cookies, just like in standard HTTP cookies.

Stone.js ensures you interact with cookies in a **typed, structured, and secure** way, no brittle string parsing or manual cookie headers needed.

## Using Cookies

Stone.js abstracts away all cookie handling differences between Node.js and the browser, so you can write your code once and deploy it anywhere.  
Behind the scenes, cookies behave slightly differently depending on the environment, but you almost never have to care.

### Reading Cookies

To access cookies from an incoming event, use the `cookies` collection exposed on the event object.

```ts
const authToken = event.getCookie('auth_token')?.getValue();
```

Or, if you prefer working with the `CookieCollection` directly:

```ts
if (event.hasCookie('isLoggedIn')) {
  const userSession = event.cookies.getValue('session');
}
```

Whether you are in a browser or server context, the same code works seamlessly.

### Setting Cookies

To set cookies in the outgoing response, use the `cookies` collection, or the shortcut methods on the response.

```ts
response
  .setCookie('session', 'abc123', { httpOnly: true })
  .setCookie('theme', 'dark')
  .secureCookies(true); // Force all cookies to be secure
```

In Node.js, cookies are automatically added to the `Set-Cookie` HTTP header.  
In the browser, cookies are pushed into `document.cookie`.

### Clearing Cookies

You can explicitly clear a cookie with `clearCookie(name)` or `remove(name)`:

```ts
response.clearCookie('session');
response.cookies.remove('session');
```

Internally, this marks the cookie for deletion by setting an expired date.

You can also forcibly remove a cookie from the collection (without touching the client) using the `force` flag:

```ts
response.clearCookie('session', {}, true);
response.cookies.remove('theme', {}, true);
```

### Signing, Unsigning, and Serialization

Stone.js can **sign cookies** to ensure they have not been tampered with.

- If a **secret** is configured, cookies will be signed automatically when serialized.
- When reading cookies, signed cookies are verified and rejected if they have been altered.
- Complex cookie values (like objects) are automatically serialized into strings using a safe format.

Example:

```ts
response.setCookie('settings', { lang: 'en', theme: 'dark' });
```

Even though you're setting an object, Stone.js serializes it transparently.

### Cookie Configuration

You can configure default cookie behavior globally through the **blueprint**, using two separate namespaces:

- `stone.http.cookie` → for **backend HTTP cookies**.
- `stone.browser.cookie` → for **frontend browser cookies**.

This separation is especially important when building **SSR (Server-Side Rendering)** apps, where you handle both environments simultaneously.

**Available settings:**

```ts
cookie: {
  /**
   * The secret used for signing cookies (only for backend).
   */
  secret: string
  /**
   * Additional cookie options.
   */
  options: CookieOptions
}

/**
 * Options for configuring a cookie.
 */
export interface CookieOptions {
  path?: string
  expires?: Date
  domain?: string
  maxAge?: number
  secure?: boolean
  httpOnly?: boolean
  sameSite?: CookieSameSite
}
```

**Examples:**

```ts
// Configure frontend browser cookies
blueprint.set('stone.browser.cookie.maxAge', 36000);

// Configure backend HTTP cookies
blueprint.set('stone.http.cookie.secret', 'my-secret');
```

**Important notes:**

- **Backend (`stone.http.cookie`)**:
  - You can set a `secret` to sign and verify cookies securely.
  - If no secret is set, Stone.js will fallback to using the global `stone.secret` value if available.
- **Frontend (`stone.browser.cookie`)**:
  - Never set a `secret` here.  
  - Signing cookies in the browser is insecure because the secret would be exposed to the user.
  - Frontend cookies should only configure options like `maxAge`, `path`, `secure`, and `sameSite`.

Stone.js enforces this separation to **protect your application security** and **follow best practices** when handling cookies across environments.

## Best Practices

Managing cookies correctly is crucial for both security and user experience.  
Here are some best practices to follow when using Stone.js Cookie API:

#### Always Use Event and Response APIs

Instead of manually reading `document.cookie` or setting `Set-Cookie` headers yourself, always use:

- `event.cookies`
- `event.getCookie()`
- `event.hasCookie()`
- `response.cookies`
- `response.setCookie()`
- `response.clearCookie()`

Stone.js ensures that cookies are parsed, signed, serialized, and secured properly across environments, don't bypass this layer.

#### Sign Sensitive Cookies on the Backend

When dealing with authentication tokens, sessions, or other sensitive data:

- Always sign cookies by setting a `stone.http.cookie.secret` in the blueprint.
- Signed cookies prevent tampering: if someone tries to alter a cookie, Stone.js will detect it and reject the value.

**Do not attempt to sign cookies in the browser**, secrets must stay on the server side.

#### Secure Your Cookies

For production environments:

- Always use `secure: true` to ensure cookies are transmitted over HTTPS.
- Mark sensitive cookies as `httpOnly: true` so they are not accessible via JavaScript.

Stone.js lets you easily enforce security for all cookies using:

```ts
response.secureCookies(true);
```

Or by setting `secure: true` globally via the blueprint.

```ts
blueprint.set('stone.http.cookie.secure', true);
```

#### Prefer JSON-Serializable Values

Stone.js automatically serializes and deserializes objects stored in cookies.  
However, prefer using **small, simple, JSON-serializable values** to avoid bloated cookies.

Example:

```ts
response.setCookie('settings', { theme: 'dark', lang: 'en' });
```

No manual serialization needed, just pass your object, Stone.js handles it safely.

#### Separate Backend and Frontend Configurations

If you are building an SSR application:

- Configure backend cookies under `stone.http.cookie`.
- Configure browser cookies separately under `stone.browser.cookie`.
- Never set a `secret` in `stone.browser.cookie`, only in `stone.http.cookie`.

This separation keeps your system flexible, secure, and continuum-compliant.

By following these practices, you ensure your cookies are secure, portable, and work seamlessly across all Stone.js deployment targets.

## Summary

The Stone.js Cookie API gives you a simple, structured, and secure way to work with cookies, across both Node.js servers and browsers, without ever worrying about platform differences.

In Stone.js:

- You **read** cookies from incoming events (`event.cookies`, `event.getCookie()`).
- You **set** cookies in outgoing responses (`response.cookies`, `response.setCookie()`).
- You **clear** cookies easily (`response.clearCookie()`).
- You **configure** cookie behavior globally via the blueprint (`stone.http.cookie`, `stone.browser.cookie`).
- You **sign** sensitive backend cookies safely, while keeping frontend cookies simple and clean.
- You use the **same code** in both frontend and backend applications thanks to the Continuum Architecture.

Stone.js handles all the heavy lifting behind the scenes: parsing, serializing, signing, securing, so you can focus on what really matters: building modern, cloud-native applications without friction.

**One Cookie API to rule them all.**  
**Anywhere. Any platform. Any app.**
