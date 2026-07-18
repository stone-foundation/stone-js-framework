---
title: Lifecycle
---

In Stone.js, the **lifecycle** represents the sequence of internal events that occur **before, during, and after** the system applies a domain to a context. It allows you to plug into those moments, not to control them, but to observe and instrument them.

A **lifecycle hook** is a function registered to run at a specific point in this process. Hooks give you visibility into what the system is doing internally, whether it's preparing the ephemeral execution context, executing your business logic, handling errors, or finalizing a response.

Lifecycle hooks are **dimension-scoped**, meaning that each dimension in the Continuum Architecture, such as **setup**, **integration**, or **initialization**, defines its own set of hook points, based on its responsibilities.

Stone.js separates the lifecycle into two main categories:

* **Global lifecycle hooks**, which are triggered once during the **lifetime of the global context** (e.g., when the app starts or stops)
* **Per-intent lifecycle hooks**, which are triggered for **each incoming event** (such as an HTTP request or CLI command) and scoped to its **ephemeral execution context**

This distinction is fundamental to how the **Continuum Architecture** works:
Each intention (incoming event) is handled within a short-lived, isolated context, and that context has a lifecycle of its own.

::: info
Hooks exist to observe these lifecycles, not to alter them. 
If you need to intercept, mutate, or short-circuit the flow, you should use [middleware](./middleware.md) instead.
:::

This page focuses specifically on **per-intent hooks**, defined in the **Initialization Dimension**. These hooks allow you to observe the lifecycle of each individual intention, from the moment the ephemeral execution context is created, to when the final response is sent and the ephemeral execution context is destroyed.

Hooks from the **Setup** and **Integration** dimensions, which operate at lower levels of the internal context, are documented separately in their respective pages.

## Initialization Hooks

The following hooks are executed during the lifecycle of each intention (e.g. HTTP request, CLI call, event trigger). These hooks are scoped to the **ephemeral execution context** and allow you to observe its evolution from creation to teardown.

```mermaid
%%{init: {"theme": "base", "themeVariables": {
  "fontSize": "14px",
  "lineColor": "#d35400"
}}}%%
graph TD
  A[onInit]
  B[onHandlingEvent]
  C[Processing Middleware Loop]
  C1[Execute Middleware]
  C2[onProcessingKernelMiddleware]
  C3[onKernelMiddlewareProcessed]
  D[onExecutingEventHandler]
  E[onExecutingErrorHandler]
  F[onPreparingResponse]
  G[onResponsePrepared]
  H[onEventHandled]
  I[onTerminate]

  A --> B
  B --> C
  C --> C2
  C2 --> C1
  C1 --> C3
  C3 --> C
  C --> D
  D --> F
  D --> E
  E --> F
  F --> G
  G --> H
  H --> I
%% Styling for all nodes
    style A stroke-width:4px,fill:#FFFFFF
    style B stroke-width:4px,fill:#FFFFFF
    style C stroke-width:4px,fill:#FFFFFF
    style C1 stroke-width:4px,fill:#FFFFFF
    style C2 stroke-width:4px,fill:#FFFFFF
    style C3 stroke-width:4px,fill:#FFFFFF
    style D stroke-width:4px,fill:#FFFFFF
    style E stroke-width:4px,fill:#FFFFFF
    style F stroke-width:4px,fill:#FFFFFF
    style G stroke-width:4px,fill:#FFFFFF
    style H stroke-width:4px,fill:#FFFFFF
    style I stroke-width:4px,fill:#FFFFFF
```

Below is the full list of per-intent lifecycle hooks provided by the Initialization Dimension.


| Hook Name                      | When It Runs                                     | Typical Use Cases                                                     |
| ------------------------------ | ------------------------------------------------ | --------------------------------------------------------------------- |
| `onInit`                       | When the execution context is created            | Assign trace IDs, inject request-specific services, log start         |
| `onHandlingEvent`              | When the `IncomingEvent` is passed to the kernel | Track when the domain is about to be executed                         |
| `onProcessingKernelMiddleware` | Before each kernel middleware runs               | Log middleware order, start timing, setup middleware-specific context |
| `onKernelMiddlewareProcessed`  | After each kernel middleware completes           | Track execution time, collect metrics, debug effects                  |
| `onExecutingEventHandler`      | Just before the event handler runs               | Attach timing markers, wrap handler in observability logic            |
| `onExecutingErrorHandler`      | If the event handler throws an error             | Log and report exceptions, trigger alerts                             |
| `onPreparingResponse`          | Before preparing the internal response           | Normalize output, enrich response metadata                            |
| `onResponsePrepared`           | After the internal response is finalized         | Validate structure, inject post-processing metrics                    |
| `onEventHandled`               | After the domain logic is complete               | Log successful execution, audit events                                |
| `onTerminate`                  | Just before the execution context is destroyed   | Cleanup, release resources, flush async tasks                         |

## Hook Listener Registration

In Stone.js, hook listeners can be registered in two ways:

- **Declaratively**, using the `@Hook()` decorator on a method
- **Imperatively**, using the `defineHookListener()` utility

Both approaches allow you to attach logic to any hook point in the system. However, the way hook listeners are resolved and executed reflects the architecture's introspective and flexible nature.

::: tabs#declarative-imperative
@tab:active Declarative
### Declarative Registration

You can declare hook listeners by annotating methods with the `@Hook('<hookName>')` decorator. This is the most common and readable way to bind custom behavior to lifecycle stages.

```ts
import { Hook } from '@stone-js/core';

export class LifecycleLogger {
  @Hook('onInit')
  logInit() {
    console.log('Execution context initialized.');
  }

  @Hook('onTerminate')
  cleanup({ event }) {
    console.log(`Event ${event.fingerprint(true)} ended`)
  }
}
```

**Where to declare hooks:**

- In the **application entrypoint class**
- In a **ServiceProvider** (we’ll see this in a later section)
- In **any other class**, but note the following:

Hook-decorated methods are **not tied to the class instance**. They are resolved **by reflection**, and may be invoked even if the class is never instantiated. Avoid using `this` or relying on instance state.

This ensures that hooks remain introspectable, context-agnostic, and safe to execute in isolated scopes.

@tab:active Imperative

### Imperative Registration

Hooks can also be registered using the blueprint utilities. This approach is useful when you want full control over listener setup, for example, when registering hooks conditionally, injecting them dynamically, or composing from external libraries.

```ts
import { defineHookListeners } from '@stone-js/core'

export const logInitListener = () => console.log('Init triggered')
export const logTerminateListener = ({ event }) => {
  console.log(`Event ${event.fingerprint(true)} ended`)
}

export const appLifecycleHooks = defineHookListeners({
  onInit: [logInitListener],
  onTerminate: [logTerminateListener],
})
```

You can also register hooks directly on the `blueprint` instance. 
This approach is useful when you have access to the blueprint during application setup:

```ts
blueprint.add('stone.lifecycleHooks.onInit', [logInitListener])
```

This method attaches the listener directly to the context lifecycle under the `stone.lifecycleHooks.<hookName>` namespace.

**Use this approach when:**

- You need to register hooks **outside class structures**
- You want to **compose hooks dynamically**
- You are building **framework extensions or plugins**
:::

## Hook vs. Middleware

In Stone.js, both **hooks** and [**middleware**](./middleware) allow you to react to different stages of the context lifecycle, but they serve **fundamentally different purposes**.

Understanding this distinction is key to writing clear, maintainable, and continuum-aligned systems.

### Hooks: Observers

Hooks are passive. They are triggered automatically by the framework at well-defined execution points. They cannot interrupt the flow, short-circuit execution, or return alternative results. They exist **outside the pipeline**, and their purpose is to **observe and instrument** the context.

- Listen to internal events
- Measure performance
- Collect analytics
- Log execution
- Extend features in a modular way
- React to success/failure states

Hooks do not mutate the [`IncomingEvent`](../essentials/incoming-event), the [`OutgoingResponse`](../essentials/outgoing-response), or the execution pipeline. They are safe, side-effect-free tools for **observability, diagnostics and feature extension**.

### Middleware: Participants

Middleware are active. They are part of the execution pipeline and can:

- Short-circuit the flow
- Modify the [`IncomingEvent`](../essentials/incoming-event) or [`OutgoingResponse`](../essentials/outgoing-response)
- Apply validation, authentication, or business-specific rules
- Catch and transform errors
- Inject data into the context

Middleware lives **inside the dimensions**, especially in the [**Setup**](./blueprint), [**Integration**](./adapter), and **Initialization** dimensions, and is responsible for shaping the behavior of the context.

They define **how** intentions are interpreted, and **what** happens in response.

### Comparison Table

| Feature                    | Hook                          | Middleware                         |
|----------------------------|-------------------------------|------------------------------------|
| Role                       | Observer                      | Participant                        |
| Execution scope            | Outside the pipeline          | Inside the pipeline                |
| Can mutate context?        | No                            | Yes                                |
| Can short-circuit flow?    | No                            | Yes                                |
| Access to `next()`         | No                            | Yes                                |
| Purpose                    | Monitoring, logging, metrics  | Behavior, transformation, control  |
| Typical usage              | Tracing, audit logs, cleanup  | Auth, validation, response shaping |

## Summary

Lifecycle hooks in Stone.js provide a structured, dimension-aware way to **observe** the internal evolution of the context, from system startup to per-intent execution and teardown.

They are:

- **Dimension-scoped**: Each hook is bound to a specific phase of the continuum
- **Passive**: Hooks cannot modify or interrupt the flow, they listen, they don’t act
- **Safe and isolated**: Hook execution is side-effect-tolerant and does not depend on class instantiation
- **Crucial for instrumentation**: Ideal for logging, tracing, performance measurement, debugging, and system introspection

In this documentation, we focused specifically on the **Initialization Dimension**, where per-intent hooks are triggered for each ephemeral execution context.

Hooks are registered using:

- `@Hook()` decorators for declarative class-based listeners
- `defineHookListener` for flexible, imperative registration

And most importantly:

- Use **hooks** when you want to observe what’s happening.  
- Use **middleware** when you want to control what happens.
- If your code **returns**, **transforms**, or **decides**, it’s middleware.  
- If your code just **records**, **measures**, or **responds after the fact**, it’s a hook.

To go deeper:
- Explore [**Setup Hooks**](./blueprint#setup-hooks) to instrument blueprint construction
- Explore [**Integration Hooks**](./adapter#integration-hooks) to track adapter-level behavior
- See the [**Middleware**](./middleware) documentation to learn how to intercept and control flow across dimensions

The more you align your instrumentation strategy with the Continuum, the more modular, observable, and resilient your application will become.
