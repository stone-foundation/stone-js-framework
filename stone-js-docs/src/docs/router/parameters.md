---
title: Parameters
---

Sometimes you need dynamic segments in your route paths, like `/users/:id`, to capture values directly from the URL. These segments are called **route parameters**.

Stone.js Router supports powerful and expressive parameter handling for both `path` and `domain` segments. You can define parameters that are required, optional, repeatable, or even validated by regex rules.

All route parameters are automatically extracted and made available via the `event.params` object inside your event handler.

Stone Router gives you flexible syntax choices, sensible defaults, and powerful configuration options, all while keeping routing simple and intuitive.

## Dynamic Parameters

Dynamic parameters allow you to define flexible routes that match variable values in the path or domain. Stone Router supports two syntaxes:

* `/users/:id`, **Colon-based** (preferred in this documentation)
* `/users/{id}`, **Brace-based**

Both are supported and behave identically, but **you should stick to one style for consistency**. We'll use the colon syntax throughout.

### Path Parameters

To define dynamic segments in the path, use a colon followed by the parameter name:

```ts
{
  path: '/users/:id/articles/:slug',
}
```

This route will match:

* `/users/12/articles/javascript`
* `/users/john/articles/stone.js`

And extract:

```ts
event.params // => { id: '12', slug: 'javascript' }
```

### Prefixed Parameters

You can add a prefix to your parameters directly in the path:

```ts
{
  path: '/users/user-:id/articles/article-:slug',
}
```

This will match:

* `/users/user-12/articles/article-javascript`
* `/users/user-john/articles/article-stone.js`

And extract:

```ts
event.params // => { id: '12', slug: 'javascript' }
```

### Global Path Prefix

You can define a global prefix that is automatically prepended to **all route paths**:

```ts
// Setup time
blueprint.set('stone.router.prefix', 'v1');

// Runtime
router.configure({ prefix: 'v1' });
```

For example, defining a path `/users/:id` becomes accessible as `/v1/users/:id`.

This is especially useful for versioning APIs.

### Domain Parameters

To define dynamic segments in the **domain**, you must use **brace-based** syntax:

```ts
{
  domain: '{subDomain}.example.com',
}
```

This will match:

* `dev.example.com` → `{ subDomain: 'dev' }`
* `admin.example.com` → `{ subDomain: 'admin' }`

Route parameters in the domain are extracted the same way and made available via `event.params`.

::: important
Colon syntax (`:subDomain.example.com`) is **not supported** for domain segments.
:::


## Strict Segment

By default, Stone Router is forgiving. Route matching is:

* **Case-insensitive**
* **Slash-tolerant** (trailing slashes are ignored)

For example, a route defined as `/articles/javascript/functions` will match:

* `/ARTICLES/JavaScript/FUNCTIONS/`
* `/articles/javascript/functions`
* `/articles/javascript/functions/`

This default behavior improves flexibility, but sometimes, you want precision.

### Enabling Strict Mode

To enforce strict matching, **case-sensitive** and **exact slash position**, you can enable the `strict` option:

#### Per Route

```ts
{
  path: '/Articles/JavaScript/Functions',
  strict: true,
}
```

Only matches `/Articles/JavaScript/Functions` exactly (with case and no trailing slash).

#### Globally (Setup Time)

```ts
blueprint.set('stone.router.strict', true);
```

#### Globally (Runtime)

```ts
router.configure({ strict: true });
```

This ensures **all** routes are matched strictly across your app, helping you avoid unintentional matches in critical APIs.

## Optional Parameters

Optional parameters allow a route to match whether a given segment is present or not.

You define an optional parameter by adding a `?` at the end of its name:

```ts
{
  path: '/users/:id/articles/:slug?',
  domain: '{subDomain?}.example.com',
}
```

This route will match all of the following:

* `/users/12/articles/javascript`
* `/users/12/articles`
* `/users/12/articles/`

And extract:

```ts
event.params // => { id: '12', slug: 'javascript' } // or slug: undefined
```

For the domain:

* `dev.example.com` → `{ subDomain: 'dev' }`
* `example.com` → `{ subDomain: undefined }`

### Important Notes

* Optional parameters must always be **at the end** of the path or domain.
* If an optional parameter is not present, its value will be `undefined` (unless a default is configured, more on that later).
* Optional segments cannot be followed by required segments, as it would make matching ambiguous.

Bad example (don’t do this):

```ts
// ❌ Ambiguous! Don't place required params after optional ones
path: '/users/:slug?/edit/:id'
```

Stick to clean, predictable structures to avoid routing chaos.

## Repeatable Parameters

Repeatable parameters let you match **multiple path or domain segments** using a single parameter.
This is useful when a parameter can contain slashes (`/`) or repeat multiple times.

Stone Router supports two types of repeatable parameters:

* **Required repeatable** → `+`
* **Optional repeatable** → `*`

### Required Repeatable Parameters (`+`)

A required repeatable parameter must match **one or more segments**.

```ts
{
  path: '/articles/:slug+',
  domain: '{subDomain+}.example.com',
}
```

Matches:

* `/articles/javascript/functions/arrow-function`
* `/articles/javascript/functions`
* `/articles/javascript`

But **not** `/articles`

Extracts:

```ts
event.params.slug // => "javascript/functions/arrow-function"
event.params.subDomain // => "dev.admin"
```

Domain examples:

* `dev.example.com` → `subDomain: 'dev'`
* `admin.dev.example.com` → `subDomain: 'admin.dev'`
* `www.admin.dev.example.com` → `subDomain: 'www.admin.dev'`

### Optional Repeatable Parameters (`*`)

An optional repeatable parameter can match **zero or more segments**.

```ts
{
  path: '/articles/:slug*',
  domain: '{subDomain*}.example.com',
}
```

Matches:

* `/articles/javascript/functions/arrow-function`
* `/articles/javascript/functions`
* `/articles/javascript`
* `/articles`

Extracts:

```ts
event.params.slug // => can be "javascript/functions" or undefined
event.params.subDomain // => can be "admin.dev" or undefined
```

### Notes

* Repeatable parameters **consume slashes** in the value (e.g., `functions/arrow-function`)
* Use repeatable params only when your routing requires deep flexibility (like nested paths or subdomains)
* Don’t mix repeatable and non-repeatable parameters of the same name

## Default Parameters

Default parameters let you assign fallback values when a parameter is **optional and not provided** in the route.
They’re especially useful to ensure consistency and reduce conditional logic in your handlers.

### Local Defaults (Per Route)

Use the `defaults` option in your route definition:

```ts
{
  path: '/users/:id/articles/:slug?',
  domain: '{subDomain?}.example.com',
  defaults: {
    slug: 'default-article',
    subDomain: 'dev',
  }
}
```

Given the following requests:

* `example.com/users/12/articles/javascript`
  → `params = { id: '12', slug: 'javascript', subDomain: 'dev' }`

* `example.com/users/12/articles`
  → `params = { id: '12', slug: 'default-article', subDomain: 'dev' }`

* `admin.example.com/users/12/articles`
  → `params = { id: '12', slug: 'default-article', subDomain: 'admin' }`

### Global Defaults

To apply defaults across all routes:

#### Setup Time

```ts
blueprint.set('stone.router.defaults', { id: 23 });
```

#### Runtime

```ts
router.configure({ defaults: { id: 23 } });
```

This is useful when you want fallback values globally for common parameters like `lang`, `locale`, `version`, or `tenant`.

### Important Notes

* Defaults only apply to **optional parameters**
* If a value is explicitly present in the URL, it overrides the default
* Defaults do **not** work for required or repeatable parameters

## Validation Rules

Stone Router supports built-in validation for route parameters using **regex rules**.
This lets you enforce format constraints directly in your route definitions.

There are three levels of validation:

* **Implicit Rules**, inline regex in the path or domain
* **Explicit Rules**, using the `rules` option
* **Global Rules**, applied to all routes

### Implicit Rules

Add regex patterns directly inside your path or domain parameters:

```ts
{
  domain: '{subDomain([a-z]+)}.example.com',
  path: '/users/:id(\\d+)/articles/:slug(.+)?',
}
```

This matches:

* `admin.example.com/users/42/articles/stone-router` ✅
* `admin.example.com/users/abc/articles/stone-router` ❌ (fails `id` validation)

**Syntax Notes:**

* Use parentheses `()` after the parameter name
* Escape backslashes in strings (`\\d+` not `\d+`)
* Works with optional params too (e.g., `:slug(.+)?`)

### Explicit Rules

Define all regex constraints in a clean object with the `rules` property:

```ts
{
  domain: '{subDomain}.example.com',
  path: '/users/:id/articles/:slug?',
  rules: {
    id: /\d+/,
    slug: /.+/,
    subDomain: /^[a-z]+$/,
  }
}
```

**Benefits:**

* More readable and maintainable
* No need to escape backslashes
* Easy to reuse and refactor

### Global Validation Rules

You can enforce validation patterns across all routes for common parameters like `id`, `lang`, or `env`.

#### Setup Time

```ts
blueprint.set('stone.router.rules', {
  id: /\d+/,
  lang: /^[a-z]{2}$/,
});
```

#### Runtime

```ts
router.configure({
  rules: {
    id: /\d+/,
    lang: /^[a-z]{2}$/,
  },
});
```

These rules will apply to **all parameters with matching names**, unless overridden locally.

## Best Practices

Here are some practical tips to master parameter usage with Stone Router:

#### Stick to One Syntax

* Prefer `:param` over `{param}` in paths for consistency and clarity
* Use `{param}` only when defining **domain** parameters

#### Keep Optional Parameters at the End

* Always define optional parameters (`:slug?`) **after** required ones
* Avoid ambiguous routes like `/users/:slug?/edit/:id`, they lead to confusion and bugs

#### Use Defaults Strategically

* Define default values for optional parameters to simplify handler logic
* Use global defaults sparingly—only for truly universal parameters (like `lang`, `tenant`, or `env`)

#### Validate Inputs at the Edge

* Enforce expected formats using validation rules directly in the route (e.g., `:id(\\d+)`)
* Combine **implicit** and **explicit** rules when needed, but prefer explicit for complex routes

#### Avoid Overusing Repeatable Parameters

* Repeatable params (`+`, `*`) are powerful but can reduce clarity
* Use them only when slashes are meaningful data (e.g., nested paths, categories)

#### Use Global Config for Consistency

* Set global `prefix`, `strict`, `defaults`, and `rules` in one place using `blueprint.set()` or `router.configure()`
* This ensures uniform behavior and avoids surprises across routes

## Summary

Route parameters in Stone Router give you powerful control over how URLs are matched, parsed, and processed.

You can define:

* **Dynamic segments** in paths and domains
* **Optional** (`?`) and **repeatable** (`+`, `*`) parameters
* **Default values** for missing optional parameters
* **Regex validation rules** at the route or global level

These parameters are always available in `event.params`, giving you full access to the dynamic data of your request context.

When in doubt:

* Use **colon syntax** (`:id`) for paths, and **brace syntax** (`{sub}`) for domains
* Keep **optional parameters last**, and use **default values** for cleaner code
* Use **validation rules** to guard your routes and avoid writing logic downstream

Stone Router makes advanced parameter matching feel simple, just define what you need, and the router handles the rest.
