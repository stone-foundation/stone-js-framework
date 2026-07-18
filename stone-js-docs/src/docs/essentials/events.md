---
title: Events
---

Events are a core building block in Stone.js, enabling modular and loosely coupled applications.  
However, it is important to understand that **not all events are the same**.

Stone.js distinguishes between two major categories:

- **Incoming Events**:  
  These events come from the external world, such as HTTP requests, WebSocket messages, or CLI commands.  
  They represent *intentions* from outside the system and are handled using **Event Handlers**, not listeners or subscribers.  
  To learn more about handling external events, refer to the [`IncomingEvent`](./incoming-event) and [`Event Handlers`](./event-handler) documentations.

- **Internal Events**:  
  These events are triggered *inside* your Stone.js application.  
  For example, when a route is matched, a `RouteEvent` is emitted internally. Internal events allow your modules to communicate, coordinate workflows, and react to changes without creating direct dependencies between them.

This documentation focuses exclusively on **Internal Events**:  
their structure, their behavior, and how you can listen, subscribe, and dispatch them within your application.

All internal events inherit from the core `Event` class, which provides a unified and simple API to:

- Store and retrieve structured metadata.
- Identify the event type.
- Track the event source and timestamp.

By relying on a common internal event model, Stone.js reinforces the **continuum principle**:  
**different modules, one coherent way to react to change.**

In the next sections, you’ll learn how to define listeners, group subscriptions, and create your own custom events to build modular and powerful Stone.js applications.

## Listeners

Listeners are the primary way to react to **internal events** in Stone.js. A listener waits for a specific event to occur and then executes its associated logic.

Listeners promote **low coupling** between parts of your system, the module that emits the event doesn't need to know who will react to it, it simply emits the event into the system.

Stone.js supports multiple ways to define listeners, giving you full flexibility depending on your needs.

### Variants

You can define a listener using one of three shapes:

- **Class-based** (recommended for declarative APIs and introspection)
- **Function-based** (ideal for quick scripts or nano apps)
- **Factory-based** (perfect when you need dependency injection via the container)

Each variant gives you different tradeoffs between simplicity, structure, and flexibility.

::: tabs#class-factory-function
@tab:active Class-based

#### Class-based Listener

Class-based listeners are the preferred way in Stone.js, especially when using the declarative API.  
They are introspectable by the system, easy to organize, and allow constructor-based dependency injection.

```ts
import { ILogger } from '@stone-js/core'
import { RouteEvent, Route } from '@stone-js/router'

export class LogMatchedRouteEventListener implements IEventListener<RouteEvent> {
  private readonly logger: ILogger

  construct({ logger }: { logger: ILogger }) {
    this.logger = logger
  }

  handle(event: RouteEvent) {
    this.logger.info(event.get<Route>('route').uri)
  }
}
```

- `construct` is used to inject services from the container.
- `handle` is automatically called when the event is dispatched.

@tab Function-based

#### Function-based Listener

Function-based listeners are simple functions.  
They are a great choice when you want a lightweight listener without dependency injection.

```ts
const eventListener = (event: RouteEvent) => {
  console.info(event.get<Route>('route').uri)
}
```

- Functions are straightforward but have no automatic dependency injection.
- Use them for lightweight or one-off listeners.

@tab Factory-based

#### Factory-based Listener

Factory-based listeners are functions that **return** the actual event handler.  
This pattern allows you to inject dependencies manually, while keeping flexibility.

```ts
const eventListener = ({ logger }: { logger: ILogger }) => {
  return (event: RouteEvent) => {
    logger.info(event.get<Route>('route').uri)
  }
}
```

- The first function receives injected services.
- It returns the real event handler that will be called when the event occurs.
- Factory-based listeners are especially powerful when you need dynamic setup per listener instance.
:::

### Register

Once your listener is defined, you must **register** it so that Stone.js knows it should react to a specific event.

Stone.js offers two ways to register listeners:

- **Declarative API**, using decorators (recommended for class-based modules)
- **Imperative API**, using blueprint utilities for manual control

No matter which variant you choose (class, function, or factory), the registration process ensures your listeners are properly integrated at runtime.

::: tabs#declarative-imperative
@tab:active Declarative

#### Declarative Registration

When using a class-based listener, you can register it declaratively using the `@Listener` decorator.

```ts
import { Listener } from '@stone-js/core'
import { RouteEvent } from '@stone-js/router'

@Listener({
  event: RouteEvent.ROUTE_MATCHED
})
export class LogMatchedRouteEventListener implements IEventListener<RouteEvent> {}
```

- `@Listener` associates your class with a specific event type.
- The listener will be automatically discovered and activated by the system during initialization.

This is the cleanest and most continuum-aligned way to register listeners.

@tab Imperative

#### Imperative Registration

For more manual or dynamic control, you can register listeners imperatively using `defineBlueprintConfig` and `defineEventListener`.

##### Function-based example

```ts
export const AppBlueprint = defineBlueprintConfig((blueprint) => {
  blueprint.set(defineEventListener(
    LogMatchedRouteEventListener,
    RouteEvent.ROUTE_MATCHED
  ))
})
```

- This method works for class-based or function-based listeners.
- You specify the listener and the event type manually.

##### Factory-based example

```ts
export const AppBlueprint = defineBlueprintConfig((blueprint) => {
  blueprint.set(defineEventListener(
    LogMatchedRouteEventListener,
    RouteEvent.ROUTE_MATCHED,
    true
  ))
})
```

- By passing `true` as the third parameter, you tell Stone.js to treat the listener as a factory.
- This enables manual dependency injection at runtime.
:::

## Subscribers

While listeners handle a **single event**, subscribers allow you to **subscribe to multiple events** within the same module.

A subscriber receives the `EventEmitter` instance and can programmatically attach multiple event handlers inside a single `subscribe` method.  
This pattern is especially useful when you need to manage several related events together.

Like listeners, subscribers in Stone.js can be defined in three variants.

### Variants

You can define a subscriber using one of three shapes:

- **Class-based** (recommended for declarative APIs and introspection)
- **Function-based** (ideal for quick scripts or nano apps)
- **Factory-based** (perfect when you need dependency injection via the container)

::: tabs#class-factory-function
@tab:active Class-based

#### Class-based Subscriber

Class-based subscribers are ideal for maintaining structure and leveraging dependency injection.

```ts
import { RouteEvent, Route } from '@stone-js/router'
import { IEventSubscriber, ILogger, EventEmitter } from '@stone-js/core'

export class RouteEventSubscriber implements IEventSubscriber {
  private readonly logger: ILogger

  construct({ logger }: { logger: ILogger }) {
    this.logger = logger
  }

  subscribe(eventEmitter: EventEmitter) {
    eventEmitter.on(RouteEvent.ROUTE_MATCHED, (event: RouteEvent) => {
      this.logger.info(event.get<Route>('route').uri)
    })
  }
}
```

- `construct` injects dependencies.
- `subscribe` is called automatically, passing the `EventEmitter`.

@tab Function-based

#### Function-based Subscriber

Function-based subscribers are simple functions that receive the `EventEmitter` directly.

```ts
const subscribe = (eventEmitter: EventEmitter) => {
  eventEmitter.on(RouteEvent.ROUTE_MATCHED, (event: RouteEvent) => {
    console.info(event.get<Route>('route').uri)
  })
}
```

- Lightweight and quick to implement.
- No dependency injection, perfect for small tasks or nano apps.

@tab Factory-based

#### Factory-based Subscriber

Factory-based subscribers allow you to inject services before subscribing.

```ts
const subscribe = ({ logger }: { logger: ILogger }) => (eventEmitter: EventEmitter) => {
  eventEmitter.on(RouteEvent.ROUTE_MATCHED, (event: RouteEvent) => {
    logger.info(event.get<Route>('route').uri)
  })
}
```

- First function receives services.
- Second function receives the `EventEmitter`.
- Very powerful when you need full control over dependencies.
:::

### Register

After defining your subscriber, you need to **register** it so that Stone.js can activate it during the initialization process.

Stone.js provides two ways to register subscribers:

- **Declarative API**, using decorators (recommended for class-based modules)
- **Imperative API**, using blueprint utilities for manual control

Subscribers behave similarly to listeners during registration but are attached to the system at the subscription level rather than the individual event level.

::: tabs#declarative-imperative
@tab:active Declarative

#### Declarative Registration

When using a class-based subscriber, you can register it declaratively using the `@Subscriber` decorator.

```ts
import { Subscriber, IEventSubscriber } from '@stone-js/core'

@Subscriber()
export class RouteEventSubscriber implements IEventSubscriber {}
```

- `@Subscriber()` marks the class as an event subscriber.
- The system will automatically instantiate it, inject its dependencies, and call its `subscribe` method with the `EventEmitter`.

@tab Imperative

#### Imperative Registration

If you prefer or need manual control, you can register subscribers imperatively using `defineBlueprintConfig` and `defineEventSubscriber`.

##### Function-based example

```ts
export const AppBlueprint = defineBlueprintConfig((blueprint) => {
  blueprint.set(defineEventSubscriber(RouteEventSubscriber))
})
```

- Suitable for both class-based and function-based subscribers.
- Gives you full control over registration.

##### Factory-based example

```ts
export const AppBlueprint = defineBlueprintConfig((blueprint) => {
  blueprint.set(defineEventSubscriber(RouteEventSubscriber, true))
})
```

- Passing `true` tells Stone.js to treat the subscriber as a factory.
- Allows manual dependency injection for subscriber setup.
:::

## Custom Events

Stone.js doesn't limit you to built-in events. 
You can define your own **custom events** to propagate domain-specific changes inside your application, fully aligned with the internal event system.

Creating custom events allows your modules to communicate through clear, typed messages, without creating tight coupling between them.

### Event Object

To define a custom event, you simply extend the core `Event` class provided by Stone.js.

Here’s a typical custom event:

```ts
import { Event } from '@stone-js/core'

export class MyCustomEvent extends Event {
  /**
   * MyCustomEvent name.
   *
   * @event MyCustomEvent#MY_CUSTOM_EVENT
   * @returns {string}
   */
  static get MY_CUSTOM_EVENT() {
    return 'MY_CUSTOM_EVENT'
  }

  /**
   * Create a MyCustomEvent.
   *
   * @param metadata - Event metadata.
   */
  constructor(metadata: Record<string, unknown>) {
    super({ type: MyCustomEvent.MY_CUSTOM_EVENT, metadata })
  }
}
```

Key points:
- You define a **static getter** (e.g., `MY_CUSTOM_EVENT`) to return the event type.
- The event type must be a **static constant** to ensure compatibility with bundlers and minifiers, especially on the frontend.
- You pass your event data into the event's **metadata** object when constructing it.

#### Why use a static getter for the event type?

In frontend builds (or aggressive bundling scenarios), class names can be mangled or renamed.  
Using a static string getter ensures that your event names remain **stable**, **predictable**, and **safe**, even after minification.

### Listener

Listening to custom events works exactly the same way as for built-in internal events.  
You simply define a listener and associate it with your custom event type.

Here’s a class-based listener example for `MyCustomEvent`:

```ts
import { MyCustomEvent } from './events/MyCustomEvent'
import { Listener, IEventListener } from '@stone-js/core'

@Listener({
  event: MyCustomEvent.MY_CUSTOM_EVENT
})
export class LogMyCustomEventListener implements IEventListener<MyCustomEvent> {
  handle(event: MyCustomEvent) {
    console.log(event.metadata)
  }
}
```

- The `@Listener` decorator binds this class to the `MY_CUSTOM_EVENT` event type.
- When `MyCustomEvent` is emitted, the `handle` method will be called automatically.
- You can access the event data through the `metadata` object or use the `get()` method for deep path access.

For example, if your metadata is structured:

```ts
{
  user: {
    id: 123,
    name: 'Alice'
  }
}
```

You can safely retrieve nested data like this:

```ts
const userId = event.get<number>('user.id')
```

This approach ensures that even complex event payloads stay easy to navigate and type-safe.

### Dispatcher

Once your custom event is defined, you need to **dispatch** it inside your application when the appropriate action occurs.

In Stone.js, event dispatching is done via the `EventEmitter`, which is available for dependency injection through the service container
under the `events` and `eventEmitter` aliases.

Here’s how you dispatch a custom event:

```ts
import { Service } from '@stone-js/core'
import { MyCustomEvent } from './events/MyCustomEvent'

@Service()
export class UserService {
  private readonly events: EventEmitter

  construct({ events }: { events: EventEmitter }) {
    this.events = events
  }

  saveUser(user: Record<string, unknown>) {
    this.events.emit(new MyCustomEvent({ user }))
  }
}
```

Key points:
- Inject the `EventEmitter` with the `events` alias, using the `construct` method.
- Create an instance of your custom event, passing in the metadata (your data payload).
- Emit the event using the `emit()` method.
- Your data is wrapped, so you can access it through the `event.get('user')` method in the listener.

#### Why dispatch custom events?

Dispatching custom events allows your system to stay modular:  
- The module emitting the event doesn't need to know who will handle it.
- Other parts of the application can subscribe and react without direct dependencies.
- You make your application easier to extend, test, and maintain.

#### Always Wrap Your Event Data

When creating a custom event, **always wrap your payload inside a key**.

Since the `metadata` property must always be an object, it is important to define a structured key when passing your event data.  
For example, instead of passing the object directly:

```ts
new MyCustomEvent(user)
```

You should wrap it like this:

```ts
new MyCustomEvent({ user })
```

This practice offers several advantages:

- You can easily retrieve the user with:

  ```ts
  event.get('user')
  ```

- You avoid ambiguity if you later expand the event payload.
- You maintain a consistent event structure across your application.

Also, remember:
- You **cannot inject primitive values** (like a string, number, or boolean) directly into the event metadata.  
  You must always wrap them:

  ```ts
  new MyCustomEvent({ name: 'Stone' })
  ```

Following this wrapping convention guarantees a predictable, safe, and continuum-aligned event model.

Stone.js strongly recommends **always wrapping your event data inside a named object key** at the creation phase.

## Best Practices

When working with internal events in Stone.js, following a few simple best practices will help you keep your system clean, modular, and future-proof.

#### Listeners

- **Use factory-based listeners** only when you need dynamic dependencies injected at runtime.

- **Keep listener methods small and focused**.  
  Each listener should handle only one clear responsibility per event.

- **Avoid side effects** inside listeners.  
  If needed, emit new events rather than chaining direct method calls between modules.

- **Return early when necessary**.  
  If a listener must ignore certain events based on conditions, check quickly and exit.

#### Subscribers

- **Use subscribers when handling multiple related events** together.  
  It keeps your blueprint clean and groups logic by business concern.

- **Keep subscription setup simple and readable**.  
  Prefer chaining a few related `on` calls rather than mixing unrelated events in the same subscriber.

- **Inject dependencies cleanly**.  
  Always prefer injecting services via `construct`, even in subscribers, instead of fetching manually inside the `subscribe` method.

#### Custom Events

- **Always define your event type as a static getter**.  
  Never rely on class names directly, use constants to guarantee stability after bundling and minification.

- **Design metadata explicitly**.  
  Keep your event payloads small, predictable, and documented.

- **Use the `get()` method** for safe, deep retrieval of nested metadata properties.

- **Always wrap your event data with a key** when creating custom events.  
  Never pass raw objects or primitives directly; always use a structured key, like `new MyCustomEvent({ user })`.  
  This keeps your metadata consistent, predictable, and easy to access via `event.get()`.

- **Clone events if necessary**.  
  If a module needs to modify an event without affecting the original, use the `clone()` method.

- **Dispatch events instead of tight coupling**.  
  Instead of calling other modules directly, emit events to express changes and let other parts of your system react appropriately.

## Summary

In Stone.js, internal events are the backbone of modular, decoupled application design.  
They allow different parts of your system to **react to changes** without creating tight dependencies.

- **Listeners** are used to handle a single event at a time.
- **Subscribers** allow you to organize multiple related event reactions inside one module.
- **Custom Events** enable you to define your own domain-specific events and propagate structured data across your system.

Listeners and subscribers can be defined using classes, functions, or factories, giving you full flexibility depending on your application's size and needs.  
Class-based (declarative) patterns are preferred for introspection, clarity, and maintainability.

Every internal event is an instance of the `Event` class, ensuring a consistent API for accessing metadata, event type, and origin.

By following Stone.js’s event system best practices, you can create applications that are highly modular, adaptable, and aligned with the **Continuum Architecture** philosophy:  
**same principles, everywhere, all the time.**
