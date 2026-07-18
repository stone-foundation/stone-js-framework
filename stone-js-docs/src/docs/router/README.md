---
title: Router
prev: ../essentials/logging
---

The Stone Router is a simple yet powerful routing library for both backend and frontend applications. It allows you to define routes, match incoming events, and manage middleware in a clean, context-aware, and efficient way.

By default, Stone.js applications are **mono-routed**, you typically only need a single event handler. But when your application requires **multiple route definitions**, dynamic segments, grouping, or advanced middleware logic, you can enable the full Router by installing the `@stone-js/router` package.

The router lives in the **initialization dimension** of the [Continuum Architecture](../architecture/continuum). 
It’s globally available, fully integrated into the [service container](../architecture/container), 
and seamlessly interoperates with all other parts of the system.

Once enabled, you’ll primarily work with **route definitions** (the blueprint), while the Router handles instantiation and resolution of actual `Route` objects behind the scenes. That means you can focus on the “what” of your application’s routes, not the “how”.

## Install and Activate

To get started, install the router module:

::: code-tabs#package-manager
@tab:active npm

```bash
npm install @stone-js/router
```

@tab yarn

```bash
yarn add @stone-js/router
```

@tab pnpm

```bash
pnpm add @stone-js/router
```
:::

Stone.js does not enable the router by default. You must opt-in using either the declarative or imperative API.

::: tabs#declarative-imperative
@tab:active Declarative
### Declarative Activation

Use the `@Routing()` decorator alongside your main `@StoneApp()` application class:

```ts
import { StoneApp } from '@stone-js/core';
import { Routing } from '@stone-js/router';

@Routing()
@StoneApp()
export class Application {}
```

This is the preferred approach for class-based applications and ensures the router is registered early in the setup phase.

@tab Imperative
### Imperative Activation

You can also activate the router by imperatively registering the routing blueprint:

```ts
import { routerBlueprint } from '@stone-js/router';

blueprint.set(routerBlueprint);
```

This is useful in functional or dynamically composed applications.
:::

## Accessing the Router

Once activated, the `Router` instance is created internally and injected into the **service container**. You can retrieve it using the standard container API from anywhere in your application:

```ts
const router = container.make('router'); // => Router
```

Each time an incoming event is processed and a route is matched, the **current `Route` instance** is also injected into the container:

```ts
const currentRoute = container.make('route'); // => Route
```

::: important
The `route` binding is only available after the router has matched a route for the current incoming event. If you try to access it too early (e.g., in the onInit hook), it may not be defined yet.
:::

## Context-Aware by Design

As with all components in Stone.js, the router is fully **context-aware**. It doesn’t care whether you're running in a Node server, on a serverless function, in a browser SPA, or in an SSR context. Define your routes declaratively or imperatively, and the router will do the rest.

You can also configure it globally, both at **setup time** (e.g. via decorators or blueprint config) and at **runtime** (e.g. dynamic route registration).

This makes the Stone Router ideal for:

* Cloud-native apps with dynamic route needs
* Backend APIs with fine-grained control
* Frontend SPAs and SSR apps with deep linking
* Multitenant or subdomain-based routing
* Any project where context determines behavior
