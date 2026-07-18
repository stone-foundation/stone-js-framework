---
title: Introduction
shortTitle: Documentation
next: ./getting-started/
---

**Stone.js** is a bold, next-generation **JavaScript** and **TypeScript** framework, fully modern, proudly **cloud-native friendly**, and designed to help you build scalable systems that run smoothly across environments like local machines, containers, edge networks, serverless platforms, and the browser.

It’s built on the [**Continuum Architecture**](./architecture/continuum.md), a unified design that lets you use a **single API** and **one mindset** to build backend services, frontend apps, serverless functions, and even command-line tools, all with the same codebase, same logic, and same developer experience.

No more jumping between frameworks, paradigms, or runtimes. Whether you're building an API, a web UI, a CLI, 
or deploying to serverless platforms, ****Stone.js** adapts to your context, not the other way around.**

Oh, and forget `node_modules`. **Stone.js** is modern, modular, and minimal, powered by **ESNext**, **TypeScript**, and the freedom to choose between [**declarative**](./architecture/paradigms.md#declarative-api) (decorators) or [**imperative**](./architecture/paradigms.md#imperative-api) (functional) APIs.

> **One framework. One brain. Infinite possibilities.**

## The Problems

::: warning 😔
Modern frameworks promise productivity, but often deliver pain.
:::

You juggle tools for backend, frontend, CLI, cloud functions, and SSR, each with its own philosophy, structure, deployment complexity, and learning curve. You rewrite the same logic five times just to fit the tool, instead of focusing on what matters: your **business domain**.

Frameworks force you to choose your **context** too early: the routing style, the transport, the data-fetching strategy, the deployment target, the view library. And when any of these change? You patch. You bend. You break.

There’s no standard for handling events across environments, so you end up duplicating logic for HTTP, CLI, FaaS, and the browser. Every platform means rewriting boilerplate that should have been abstracted away.

Most frameworks offer **tools**, not **architecture**.
And under all of that, there’s a deeper issue:
**Context is treated as a constant, not a variable.**

That’s not developer freedom, that’s architectural debt.

## Our Philosophy

**Stone.js** is built on a simple truth:

We do not create applications, 
we create systems that allow them to emerge,
because an application is not an object, it’s an action: the act of applying your domain to a real context, to meet a need.  
Most frameworks ask you to choose your context up front, are you building for Node? The browser? Serverless? CLI? React? Vue?  
You end up adapting the same logic again and again, just to fit into different runtimes or APIs.

**Stone.js** takes a different path.

It’s built on the [Continuum Architecture](./architecture/continuum.md), 
where the **domain** (your business logic) and the **context** (your environment) are not layered in hierarchy, but linked in a **continuum**.
The domain is not ignorant of the context, it is **uncertain** of it. 
And the context is not a constant, it is a **variable**: it moves through space and evolves over time.

**Stone.js** embraces that uncertainty.

It orchestrates the connection between domain and context **dynamically at runtime**, resolving intention into action, wherever your code runs.
Your domain doesn’t belong to a framework, it belongs to the problem it was meant to solve.

And your context?

It doesn’t ask to be chosen, it arrives when the moment comes. 
You don’t adapt your logic to the world, you let the world adapt to your logic.

Because in the continuum: 

**The domain stays ready, the context stays open, and the application happens, when the two align.**

## Why Stone.js?

Because the modern stack shouldn’t stack complexity.
And because most frameworks were built for the past.

- They split frontend and backend like opposing camps, each with their own tools, patterns, and gotchas.
- They enforce one paradigm, declarative or imperative, and good luck switching mid-project.
- They work **somewhere**, but not **everywhere**.
- Need to handle CLI, HTTP, FaaS, or browser events? Get ready to reinvent the wheel.
- Your business logic ends up tangled in platform-specific glue and fragile `process.env` hacks.

It’s not flexibility, it’s fragmentation.

**Stone.js** solves the **context problem** with a clean, modular, cloud-friendly architecture. Here’s what makes it different:

- **Run anywhere**, from local dev to the edge, serverless, or browser.
- [**Continuum Architecture**](./architecture/continuum.md), the domain logic and the context are linked in a **continuum**.
- **Context-awareness**, let Stone.js choose the platform when it actually matters.
- **Cloud-native friendly**, deploy to FaaS, containers, or edge without a rewrite.
- **Zero `node_modules` bloat**, just build, ship, and go.
- **ESNext & ESM-native**, no legacy baggage, no transpiler traps.
- **Universal API**, one flow for frontend, backend, CLI, SSR, same logic, everywhere.
- **Two paradigms**, decorators or functions? Your call. Mix them freely.
- **Micro to macro**, start small, scale huge, without switching tools.
- **TS/JS first**, fully typed, fully flexible, fully future-proof.

In short: **Less boilerplate. More power. Real freedom.**

## API Styles

**Stone.js** lets you build the way that fits you best:

::: tip 😌
**Declarative** when you want it, **imperative** when you need it.
:::

### **Declarative**

Use modern decorators with ES6 classes to configure your app with clarity and structure.

```ts
import { NodeHttp } from '@stone-js/node-http-adapter'
import { IncomingEvent, IEventHandler, StoneApp } from '@stone-js/core'

@NodeHttp()
@StoneApp()
export class Application implements IEventHandler<IncomingEvent> {
  handle(event: IncomingEvent): { message: string } {
    return { message: 'Hello world!' }
  }
}
```

### **Imperative**

Go functional and dynamic when you need full control.

```ts
import { defineStoneApp, IncomingEvent } from '@stone-js/core'
import { nodeHttpAdapterBlueprint } from '@stone-js/node-http-adapter'

// Define your handler as a function
export const handler = (event: IncomingEvent) => ({ message: 'Hello world!' })

// Create your app with the Node HTTP adapter
export const Application = defineStoneApp(handler, {}, [nodeHttpAdapterBlueprint])
```

Short on time? You only need one paradigm to build your app.
Pick the one that fits your style, forget the rest, or mix and match later.
Stone.js doesn’t judge, doesn’t lock you in, and definitely doesn’t ghost you when you switch sides. 😄

## Open Source and Community

**Stone.js** is proudly open source, built with ❤️ by developers, for developers.

Our mission is to create a strong, vibrant community that values simplicity, context-awareness, and elegant architecture. Contributions, discussions, and feedback are all welcome, let’s build the future together.

Published under the [MIT License](https://mit-license.org), Stone.js stands on the shoulders of giants, using market standards, best practices, and the wonderful libraries available on [npmjs](https://www.npmjs.com).

## Target Audience

**Stone.js** is made for:

- **Solo devs** who want to ship fast without choosing a stack but a continuum.
- **Startups** that need to scale without rewriting from scratch.
- **Enterprises** looking to standardize frontend/backend logic and reduce tech fragmentation.
- **Platform engineers** who care about clean architecture, testability, and deployment portability.
- **Framework hoppers** tired of reinventing the wheel with every new context.

## **Stone.js** Is Not a Framework. It’s a Foundation.

Frameworks solve specific problems (e.g., routing, rendering, API handling). **Stone.js** gives you a model to solve **your** problems, in your context, at your pace.

With its **event abstraction**, **adapter layer**, and **context-awareness** structure, **Stone.js** allows you to define how and where you want to apply logic, making it adaptable and scalable over time.

It’s not just a tool you use today, it’s an architectural foundation you can grow on tomorrow.

::: tip Beyond Tools
**Stop choosing tools. Start designing systems.**  
**Stop adapting your logic. Start owning your context.**
:::

::: info Javascript vs TypeScript
TypeScript is used throughout the documentation for clarity and type safety.  
If you prefer JavaScript, just remove the types in the examples, they will work just as well.
:::

Welcome to **Stone.js**, a place where dreams come true.
