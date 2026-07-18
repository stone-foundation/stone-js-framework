---
title: Core Concepts
prev: ../getting-started/deployment
---

To master Stone.js, you need more than syntax, you need to understand the engine.  
This section unveils the **core concepts** behind the framework: how it’s built, how it runs, and why everything in Stone.js is structured around **context and continuity**.

Stone.js is built on the [**Continuum Architecture**](./continuum), which means every piece of your system, from configuration to event handling, flows in sync across environments. But before anything runs, it must be built.

## Build Phase

Stone.js embraces the **latest ECMAScript features**, including decorators, top-level `await`, and more. To unlock these features while ensuring compatibility across platforms, the build process is a key part of the workflow.

Every Stone.js project goes through a build step, not because it's optional, but because it uses the **latest ECMAScript features**. The framework uses **Rollup** and **Babel** to compile backend code, and **Vite** and **Babel** to bundle frontend code. These tools are preconfigured but fully exportable if you need customization.

In dev mode, use `npm run dev` to iterate with live rebuilds.  
For production, run `npm run build` to get a single artifact ready to deploy, to Node.js, a browser, or even a Function-as-a-Service like AWS Lambda.

Everything needed to configure, bootstrap, and launch the app is generated or configurable, and Stone.js gives you full control when you need it, with built-in safety when you don’t.

## Run Phase (At a Glance)

Once built, the runtime takes over. Stone.js applications run through a set of coordinated layers: 
[adapters](./adapter), [middleware](./middleware), [service containers](./container), [handlers](../essentials/event-handler), and [lifecycle hooks](./lifecycle), all bound together by the [Continuum](./continuum).

The runtime is where context becomes king, and Stone.js makes sure your system can handle it dynamically, intelligently, and predictably.

Each runtime concept is explored in detail in the following sections. But first, 
let’s understand what it means to run a system in [**continuum**](./continuum).
