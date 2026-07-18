---
title: Environment Configuration
---

In Stone.js, configuration is context-aware, and the best place to store contextual settings is outside your code.
While most logic-level configuration lives inside your application’s [**Blueprint**](../architecture/blueprint), 
this page focuses on **environment configuration**: the values that change between development, staging, and production, like API keys, ports, feature flags, and secrets.
Environment variables are the recommended way to supply those values.

Stone.js embraces externalized configuration as a first-class concept in the Continuum Architecture. Configuration is not something you “import”, it’s something you **adapt** from your environment.

To help you do that, Stone.js provides:

- Support for `.env` files (private and public)
- Full type-safe access through the `Env` module
- Public env bundling for frontend deployment
- CI/CD-friendly design for artifact reuse

In short: configuration belongs in your environment, not in your logic, and Stone.js makes that easy to manage.

In this page, we’ll cover:

- How `.env` and `.env.public` files work
- How variables are loaded and bundled
- How to use the `Env` API to access them safely
- How to customize env behavior via `stone.config.mjs`

::: important
`@stone-js/env` is not bundled with Stone.js by default. 
::: 
To use environment configuration, install it with:

```bash
npm install @stone-js/env
```

## The Role of Env in the Continuum

In the Continuum Architecture, configuration is part of the **external context**, it’s unpredictable, environment-specific, and often unknown until runtime. 
That’s why Stone.js doesn’t treat configuration as just a static object, but as a **relationship** between your application and its deployment environment.  

Your application doesn’t **own** its configuration, it **adapts** to it.

This means:

- You should avoid hardcoding values directly into your application.
- Your application logic should ask the environment what it needs to know.
- The system should validate and normalize that input before using it.

The `Env` module acts as the **bridge** between external configuration and internal behavior. It gives your application a reliable and type-safe way to retrieve environment variables, enforce defaults, and catch invalid input early, without leaking domain concerns into the environment.

This aligns perfectly with the core principle of the Continuum:  
> *The domain must not depend directly on its context, but it must be aware that the context is uncertain.*

Environment configuration lets you **embrace that uncertainty**, with structure.

In serverless environments like **AWS Lambda**, environment variables are typically defined in the platform settings (e.g., Lambda console, deployment manifest).  

The `Env` module abstracts *where* they come from, whether from `.env` files, runtime process variables, or injected by your FaaS provider, so you can write universal configuration code that works **anywhere**.

## Working with Environment Variables

Stone.js supports two kinds of environment variable files:

### `.env`, Private Environment
Used for **server-side only** variables. These are sensitive values like database URLs, API keys, or internal feature flags.  
They are **never bundled**, **never exposed**, and only available in the Node.js runtime.

You can define variants like:
- `.env` (default)
- `.env.development`
- `.env.production`
- `.env.staging`

By default, **only `.env` is loaded**, but you can customize this in `stone.config.mjs`.

### `.env.public`, Public Environment
Used for **frontend-safe** variables. These can be shipped to the client or included in your SPA/SSR bundle.  

You can define:
- `.env.public`
- `.env.public.development`
- `.env.public.production`, etc.

These are automatically transformed into JavaScript files during build time, placed inside the `dist/env` folder:

```
dist/
├── env/
│   ├── enviroments.js
│   ├── enviroments.development.js
│   └── enviroments.production.js
```

At runtime, **only `enviroments.js` is loaded**. This lets you create **a single build artifact** and override just that file during deployment, no rebuild required.

This is perfect for CI/CD pipelines where you deploy the same code to multiple environments and just swap out configuration files.

### Example: One Artifact, Many Environments

1. Build your frontend app once.
2. Deploy the artifact to all environments.
3. In your pipeline, overwrite `dist/env/enviroments.js` with:
   - `enviroments.development.js` on staging
   - `enviroments.production.js` in prod

Your frontend will behave accordingly, without touching your code or rebuilding.

::: tip
Stone.js works seamlessly in FaaS environments like Lambda, you can define your variables in the function settings and access them via the `Env` module just like local `.env` files.
:::

## Using the `Env` API

The `Env` module provides a rich set of utilities to retrieve and validate environment variables.  
However, **you should never call `Env` utilities directly inside your application logic.**

```mermaid
%%{init: {"theme": "base", "themeVariables": {
  "fontSize": "14px",
  "lineColor": "#d35400"
}}}%%
flowchart LR
    A[External context] --> B[Env]
    B --> C[Setup dimension]
    C --> D[Blueprint]
%% Styling for all nodes
    style A stroke-width:4px,fill:#FFFFFF
    style B stroke-width:4px,fill:#FFFFFF
    style C stroke-width:4px,fill:#FFFFFF
    style D stroke-width:4px,fill:#FFFFFF
```

Instead, you should use `Env` utilities **only at configuration time**, to pass validated values into the system via the **Blueprint**.

This guarantees a clean separation of concerns:
- `Env` reads from the **external context**
- The `Blueprint` defines the **internal context**
- Your domain stays free of environmental assumptions

### Accessing Env Variables via Blueprint

Here’s how you inject a secret from your `.env` file into the system:

```ts
import { getString } from '@stone-js/env'

blueprint.set('stone.secret', getString('APP_SECRET', 'no-secret'))
```

This ensures:
- The value is loaded from the external context
- It is validated (or fallback is used)
- It is injected once, during initialization
- Your domain code never touches the `Env` module

::: important
This is the **only supported way** to use environment variables in a Stone.js app.
:::

### API Overview

The main function is `get()`, but Stone.js provides specialized helpers for many types:

| Function     | Description                                                 |
| ------------ | ----------------------------------------------------------- |
| `getString`  | Get a string, with optional format (`url`, `host`, `email`) |
| `getNumber`  | Get a number                                                |
| `getBoolean` | Get a boolean (`true`, `false`, `1`, `0`)                   |
| `getArray`   | Parse a comma-separated list (`value,value2`)               |
| `getObject`  | Parse a `key:value,key2:value2` pair list                   |
| `getJson`    | Parse JSON string (`{ "key": "value" }`)                    |
| `getEmail`   | Validate email format                                       |
| `getUrl`     | Validate URL format                                         |
| `getHost`    | Validate IP or URL                                          |
| `getEnum`    | Ensure value is one of a list                               |
| `custom()`   | Provide your own validation logic                           |

You can read more about the specific functions in the [API Reference](https://www.npmjs.com/package/@stone-js/env).

### Required by Default

All `Env` functions throw an error if:
- The variable is **missing**
- The value is **invalid** for its type

To avoid this, you must provide a default:

```ts
import { getString, getNumber } from '@stone-js/env'

getString('APP_NAME', 'StoneApp')   // Safe: fallback provided
getNumber('PORT')                   // Unsafe: throws if PORT is missing or invalid
```

This fail-fast behavior helps catch misconfiguration **before your app starts**, which is exactly what you want.

### Env Helpers

Stone.js provides helper functions to inspect the current environment:

| Helper              | Description                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------- |
| `isProduction()`    | Returns `true` if the current env is `production` or `prod` according to `NODE_ENV` variable |
| `isNotProduction()` | Returns `true` if not in production                                                          |
| `isTesting()`       | Returns `true` if in `test` or `testing` mode                                                |
| `isBrowser()`       | Returns `true` if the code is running in the browser                                         |

These can help you set defaults conditionally:

```ts
const db = isProduction()
  ? getString('DB_PROD_URL')
  : getString('DB_DEV_URL', 'mongodb://localhost/dev')

blueprint.set('db.url', db)
```

### Clearing Cached Env Values

The `Env` module caches resolved values for performance.  
In test environments, you may need to reset it to avoid contamination:

```ts
import { clearCache } from '@stone-js/env'

beforeEach(() => clearCache())
```

## Customizing Env File Loading

Stone.js gives you full control over how `.env` and `.env.public` files are loaded and expanded.  
This is done through the `dotenv` configuration inside your `stone.config.mjs` file.

This setup lets you:
- Specify multiple env file paths
- Expand variable references like `${API_HOST}`
- Override values programmatically
- Ignore system-level environment values

### Where to Configure

Edit your `stone.config.mjs` file and update the `dotenv` section:

```js
// stone.config.mjs
import { defineConfig } from '@stone-js/cli'

export default defineConfig({
  dotenv: {
    options: {
      expand: true,
      override: true,
      ignoreProcessEnv: false
    },
    private: {
      path: ['.env.production', '.env'],
      default: true,
      override: true
    },
    public: {
      production: {
        path: '.env.public.production',
        default: true,
        override: true
      },
      staging: {
        path: '.env.public.staging'
      }
    }
  }
})
```

### Configuration Options

#### `options` (applies to all files)

| Option             | Description                                     |
| ------------------ | ----------------------------------------------- |
| `expand`           | Enable `${VAR}` expansion                       |
| `override`         | Allow file values to override existing env vars |
| `ignoreProcessEnv` | Ignore system `process.env` entirely            |

#### `private`

Specify how `.env` files are loaded for the server. You can provide:
- A string path or array of paths
- `default: true` to use this config by default
- `override: true` to overwrite existing values

#### `public`

This is a mapping per environment (`development`, `production`, etc.).

Each entry must point to a `.env.public.*` file that will be bundled and transformed into `enviroments.<env>.js`.

### Best Practices

#### Use the Blueprint, Not Direct Env Access

Never call `getString()` or `getNumber()` directly inside your domain or handler logic.  
All configuration should go through the `Blueprint`:

```ts
// Good
blueprint.set('db.host', getString('DB_HOST'))

// Bad
const dbClient = createClient({ url: getString('DB_HOST') })
```

This ensures a clean separation between external context and internal behavior, as encouraged by the Continuum Architecture. 
And a single source of truth for your configuration, the `Blueprint`.

#### Validate and Fail Fast

All `Env` functions throw an error when a required variable is missing or invalid, **unless you provide a fallback**.

Always validate on startup:

```ts
getNumber('MAX_RETRIES')         // throws if invalid or missing
getNumber('MAX_RETRIES', 3)      // safe fallback
```

This guarantees your app won’t start with an invalid configuration.

#### Never Hardcode Configuration

Avoid hardcoded strings or numbers for things like ports, credentials, feature flags, or URLs.  
Use `.env` or `.env.public` instead.

Hardcoding breaks portability, testability, and surprises future-you 😄.

#### Use `.env.public` Sparingly and Deliberately

Only put values in `.env.public` that are:
- Safe to expose to the browser
- Needed by your frontend (e.g. public API URL, brand name, etc.)

Never include secrets, internal paths, or server-only settings.

#### Reuse Build Artifacts with `enviroments.js`

Take advantage of the Stone.js bundling mechanism:

- Build once
- Deploy anywhere
- Just replace `dist/env/enviroments.js` in CI/CD

This approach improves deployment speed and consistency across environments.

#### Reset Env Cache in Tests

If you're mocking environment variables during tests, make sure to reset the cache:

```ts
import { clearCache } from '@stone-js/env'

beforeEach(() => clearCache())
```

## Summary

Stone.js embraces configuration as an external, mutable part of the system, something that should be adapted, not hardcoded.

Here’s what you need to remember:

- Use **`.env`** for private, backend-only variables, not bundled, not exposed
- Use **`.env.public`** for safe-to-share variables needed in the frontend, bundled into `enviroments.js`
- Never access `Env` directly in your domain code, always inject values through the **Blueprint**
- All `Env` functions validate and fail fast unless you provide a default
- You can customize how `.env` files are loaded via `stone.config.mjs`
- Public env files enable **single-artifact CI/CD** by allowing runtime config replacement
- Works out-of-the-box in **FaaS environments** like AWS Lambda, no need for extra setup

In the Continuum, configuration is just another expression of **context**,  
and `Env` is the clean, structured way to bind that context into your application.

