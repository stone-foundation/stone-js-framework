---
title: Data Fetching
---

Data is the lifeblood of most applications. Whether it's coming from a database, an API, or a service layer, Stone.js gives you multiple ways to fetch, inject, and reuse data, across both frontend and backend, without duplicating logic or coupling view to infrastructure.

This page explores how to handle data fetching properly in a Stone.js + React application, across:

* Page handlers
* Middleware
* Components
* SSR with snapshots

All while staying consistent with the Continuum Architecture.

## Fetching data in `handle()` (the standard way)

The primary and recommended place to fetch data is inside the `handle()` method of a page. This method runs in the **Stone.js lifecycle** and is designed to process the incoming event, validate, call services, and return a structured result.

That result will then be passed to the `render()` method.

```ts
async handle(event: ReactIncomingEvent) {
  const userId = event.get('userId')
  return await this.userService.getUserById(userId)
}
```

You can return:

* `undefined` (if nothing needs to be passed to the view)
* Raw data (Stone.js will wrap it into a response)
* A `ReactOutgoingResponse` for full control

Returning data here ensures it can be snapshotted automatically in SSR mode.

## Fetching data in middleware

Middleware runs before your page handler and can be used to:

* Check access or authentication
* Preload user or context
* Set up shared data across multiple routes

When fetching data in middleware, you **must return a full response** using `reactResponse()` or `reactRedirectResponse()`. You can also use `reactRuntime.snapshot()` to persist data across SSR.

```ts
export const AuthMiddleware = ({ reactRuntime, authService }: { ... }) => {
  return async (event, next) => {
    const user = await reactRuntime.snapshot('user', () => authService.getCurrentUser())
    event.set('user', user)
    return next(event)
  }
}
```

This ensures the user is fetched once and hydrated properly on the client without re-calling the service.

For more informations about the snapshotting data, refer to the [Snapshot](./snapshot) section.

## Fetching data inside components

React components themselves can also fetch data, via `useEffect`, `useQuery`, or any other library. But be careful: this happens **after the Stone.js lifecycle has ended**.

That means:

* No automatic snapshotting
* No server-side fetching (unless you replicate it)
* Increased risk of duplicate fetches

This is why Stone.js recommends keeping data fetching **outside the component** when possible, and **passing it in as props** via the `render()` method or via the `StoneContext`.

If you really must fetch inside the component:

* Use `useEffect()` responsibly
* Wrap it in suspense if needed
* Avoid coupling it with container services

## Snapshotting Data (SSR)

In Stone.js, a **snapshot** is a mechanism that captures and transfers data across execution dimensions, from server to browser, during SSR (Server-Side Rendering).

Imagine the lifecycle like this:

1. Your page receives an incoming event (e.g. browser request)
2. It processes the request on the **server** and returns data
3. That data is serialized into the **HTML response**
4. On the **client**, Stone.js restores the data to **hydrate** the page
5. The page renders, **without fetching again**

This mechanism is called a **snapshot**, and it ensures that the system doesn’t double-fetch, keeps server and client in sync, and improves performance.

### Why does it matter?

Traditional SSR frameworks often suffer from this trap:

* The server fetches data to render HTML
* The client then re-fetches the **same data** during hydration

Stone.js avoids that entirely.

Snapshots are the **bridge between the functional and view dimensions**.
They’re what allow SSR apps to feel like SPA apps, **without waste**.

And the best part?
If you return raw data from your page’s `handle()` method, **Stone.js snapshots it automatically.**

```ts
handle() {
  return { message: 'Hello from the server!' }
}

// No re-fetch on client, snapshot is restored
```

No extra code, no configuration, no ceremony.

### Automatic Snapshotting in `handle()`

In Stone.js, every page’s `handle()` method is part of the **functional dimension**.
When this method returns raw data, like an object, array, or primitive, and your app is running in **SSR mode**, Stone.js:

1. Executes `handle()` on the server
2. Serializes the return value into a **snapshot**
3. Injects the snapshot into the HTML response
4. On the client, during hydration, restores the snapshot to avoid re-fetching

This means:

* No duplication of data fetching logic
* No extra network requests
* And no mismatch between server-rendered and client-hydrated content

#### Example

```ts
export class ProfilePage implements IComponentEventHandler<ReactIncomingEvent> {
  constructor(private readonly userService: UserService) {}

  async handle(event: ReactIncomingEvent) {
    return await this.userService.getProfile()
  }

  render({ data }: RenderContext<{ name: string }>): React.ReactNode {
    return <h1>Hello, {data.name}</h1>
  }
}
```

If the page is rendered on the server, the result of `handle()` is **automatically snapshotted** and **reused on the client**, no need to fetch again.

### Manual Snapshotting

Automatic snapshots work great inside a page’s `handle()` method, but sometimes, you're not in `handle()`.

You may be fetching data from:

* Middleware
* Route bindings
* Services
* Custom pipelines
* Layouts

In these cases, **you are responsible** for snapshotting the data manually if you want it to be reused on the client.

#### Why?

Because outside the `handle()` method, Stone.js has no way of knowing whether the data you're fetching:

* Needs to be hydrated on the client
* Should be serialized into the HTML

::: info
Without a manual snapshot, the data will be lost after the server response. And the client will have to re-fetch it.
:::

#### Example: Middleware with snapshot

```ts
const authMiddleware = ({ reactRuntime, userService }) => async (event: ReactIncomingEvent, next: NextMiddleware) => {
  const user = await reactRuntime.snapshot('user', () => userService.getById(id))
  event.setUserResolver(() => user)
  return await next(event)
}
```

Here, the user is fetched once on the server and snapshotted, so it’s already available on the client after hydration.

Without the `snapshot()`, the browser would fetch the data again.

### Manual Snapshot Techniques

Stone.js offers **three** ways to manually snapshot data during SSR:

#### 1. `reactRuntime.snapshot()`

This is the **recommended and context-aware** method for most use cases.

```ts
const user = await reactRuntime.snapshot('user', () => userService.getById(id))
```

What it does:

* Executes the handler if running on the server
* Snapshots the result using a unique key
* On the client, returns the snapshotted value if available
* Falls back to the handler if not

It is:
- Automatically scoped to the request
- Safe to use in any SSR-aware logic: middleware, layouts, services
- Works in both server and browser

#### 2. `@Snapshot()` Decorator

This is the **declarative shortcut** for snapshotting data inside your services.

```ts
@Service({ alias: 'userService' })
export class UserService {
  @Snapshot()
  async getById(id: string) {
    return await this.userRepository.getById(id)
  }
}
```

Stone.js will automatically:

* Generate a stable key based on the method name + arguments
* Snapshot the result during SSR
* Retrieve it from the snapshot store on the client

It provides:
- Minimal syntax
- Works out of the box in route bindings and services
- You can add your custom unique key name as first argument `@Snapshot('user')`

#### 3. `ISnapshot` Service

This is the **low-level API** for accessing the raw snapshot store.

```ts
const snapshot = container.make<ISnapshot>('snapshot')

if (isServer()) {
  const user = await userService.getById(id)
  snapshot.set('user', user)
  return user
} else {
  return snapshot.get('user') ?? await userService.getById(id)
}
```

Use this when:

* You need full control over snapshot logic
* You want to write fallback strategies manually
* You’re outside of the React runtime (e.g., background job or system task)

It provides:
- Maximum control
- You must manage scope, naming, and fallback manually
- Not scoped per request, so take care in SPA mode

In most cases, prefer `reactRuntime.snapshot()` or `@Snapshot()` for simplicity, correctness, and contextual awareness.

### When to Use What

Depending on where you are in the application lifecycle, different snapshot strategies apply.
Here’s a practical guide to help you decide.

| Location      | Typical Use Case                       | Snapshot Method                            | Notes                                             |
| ------------- | -------------------------------------- | ------------------------------------------ | ------------------------------------------------- |
| `handle()`    | Standard page data fetching            | None (automatic)                           | Data is snapshotted by Stone.js                   |
| Middleware    | Auth, guards, route-specific logic     | `reactRuntime.snapshot()`                  | Must return a full response                       |
| Service       | General-purpose business logic         | `@Snapshot()` decorator                    | Use when called from routes, middleware or layout |
| Route Binding | Pre-handler data resolution            | `@Snapshot()` or `reactRuntime.snapshot()` | Not snapshotted by default                        |
| React Page    | Local state setup                      | Use `render({ data })`                     | Data already injected from `handle()`             |
| Component     | Interactive or reactive fetch (client) | None                                       | Use `useEffect()`, no SSR sync                    |
| Layout        | Shared layout data                     | `reactRuntime.snapshot()`                  | Snapshot once, reuse across pages                 |

#### Key takeaways:

* Use `handle()` for most SSR-friendly data needs, it just works.
* Use `reactRuntime.snapshot()` when you’re outside of `handle()` but still in the SSR pipeline.
* Use `@Snapshot()` when you want automatic snapshotting from your service methods.
* Avoid `ISnapshot` unless you need complete control.

## State Management

Once you’ve fetched data, you often need to hold it somewhere, between components, across views, or through user interaction. That’s where **state management** comes in.

In Stone.js, state lives in the **View**, not in the functional dimension. Stone.js doesn't provide its own state system, because React already gives you everything you need.

You can use:

* `useState`, `useReducer`, `useContext` (for local and shared state)
* External tools like Zustand, Redux, or Jotai (manually integrated)
* `StoneContext` for accessing application-wide context (services, event, data)

But there’s one thing you **shouldn’t do**...

### ❌ Don't use the DI container for reactive state

The container in Stone.js is **not a state store**.

It’s designed to resolve and inject **services**, things like authentication, database access, routing, not reactive values.

Storing mutable state (e.g. current user, UI flags, language) in the container can lead to:

* Memory leaks
* SSR inconsistencies
* Hard-to-track bugs
* Snapshot breakage

::: important
Use the container to **resolve services**, not to **store values**.
:::

### Use `StoneContext` for shared application context

The `StoneContext` is a React context automatically provided by Stone.js. It gives you access to key app-level objects in any React component, **after render**, inside the DOM.

```ts
export interface StoneContextType {
  data: any                  // Data returned from handle()
  container: IContainer      // Access to services
  event: ReactIncomingEvent  // The current incoming event (browser or server)
}
```

To access it:

```tsx
import { useContext } from 'react'
import { StoneContext } from '@stone-js/use-react'

export const ProfileButton = () => {
  const { data, event, container } = useContext(StoneContext)
  const router = container.resolve(Router)

  return (
    <button onClick={() => router.navigate('/profile')}>
      Hello, {data.user.name}
    </button>
  )
}
```

::: tip Magic
This lets you stay inside the React ecosystem while still accessing Stone.js context.
:::

You can:

* Use `container.resolve(...)` to access services
* Read the incoming event (e.g., query parameters, headers)
* Get the `data` from your page’s `handle()` method

All without prop-drilling or breaking encapsulation.

### Can I use Zustand, Redux, or other state libraries?

Yes! But they are not officially integrated **yet**. You can install them and use them like in any React app:

```ts
import create from 'zustand'

const useStore = create(set => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 }))
}))
```

You’re also free to create a Stone.js wrapper package (e.g. `@stone-js/use-redux`) if you want deeper DI or context integration.

::: tip
As always: keep your state **outside Stone.js** and **inside React**.
:::

## Hydration in SSR and the Role of Snapshots

When using **SSR** in Stone.js, rendering happens in **two phases**:

1. On the **server**, the page is fully rendered to HTML
2. On the **client**, that HTML is **hydrated** into a live React application

Stone.js handles this entire process for you, no extra configuration required.

But hydration is not just about the DOM. It's also about **data continuity** between server and client.
That’s where **snapshots** and **StoneContext** come in.

### How hydration works in Stone.js

When a page is requested in SSR mode:

* The `handle()` method is executed on the server
* The returned data is **snapshotted**
* The `render()` method generates the HTML
* On the client, that HTML is hydrated using React’s `hydrateRoot()`
* Stone.js injects the snapshotted data into the React tree via `StoneContext`

This avoids:

* Re-fetching data on the client
* UI flickers
* Out-of-sync states between server and browser

### What APIs are used under the hood?

Depending on the runtime environment:

| Context               | React API used                          |
| --------------------- | --------------------------------------- |
| Server (SSR/SOR)      | `renderToString()`                      |
| Browser (SSR-hydrate) | `hydrateRoot()` from `react-dom/client` |
| Browser (SPA/CSR)     | `createRoot()`                          |

Stone.js chooses the correct one **based on your adapters** (`@Browser`, `@NodeHttp`, etc.).

### What should I do to support hydration?

Mostly: **nothing**.

If you:

* Use `handle()` to return data
* Use `render()` to return JSX
* Consume data from the `RenderContext` or `StoneContext`

…you’re already hydrated and hydrated correctly.

### Lazy loading and hydration

If your page is lazy-loaded (via `@Page()` or `definePage()` with `lazy: true`), Stone.js defers loading the module **until the route is matched**.

This works with SSR hydration too, only the code needed for the current page is loaded.

### Suspense and limitations

Stone.js doesn’t yet implement full Suspense or React Server Components.

However:

* You can use `<Suspense />` in your client-rendered components (CSR or hydrated SSR)
* You cannot use streaming or partial hydration (yet)

These features may be added in a future release, they require additional adapter-level support.

## Best Practices

Data fetching in Stone.js is context-aware by design. Here’s how to use it effectively across SSR, SOR, and SPA applications.

#### Use `handle()` for initial data

If your data is required at page load time, the cleanest place to fetch it is in the `handle()` method of your page.

* It’s automatically snapshotted in SSR
* It integrates with the lifecycle
* It’s passed to the `render()` method via `RenderContext.data`

```ts
handle(event: ReactIncomingEvent) {
  return this.profileService.getCurrentUser()
}
```

#### Use `reactRuntime.snapshot()` outside `handle()`

If you’re in middleware, a layout, or a service that runs outside the page handler:

* Use `reactRuntime.snapshot()` to avoid double-fetching in SSR
* Scope your key carefully (e.g. `'user.profile'`, `'auth.token'`)

```ts
const profile = await reactRuntime.snapshot('user.profile', () => this.profileService.get())
```

#### Use the `@Snapshot()` decorator for services

Want to hide the snapshot logic entirely? Use the decorator, ideal for services used in route bindings or middlewares.

```ts
@Snapshot()
getById(id: string) {
  return this.userRepository.find(id)
}
```

#### Don’t fetch in components if you need SSR sync

Components rendered via React don’t run until the client is live. That means `useEffect()` fetches will never be snapshotted.

Use component fetches only for:

* Reactive state
* Interactive behavior
* Client-only concerns

#### Use `StoneContext` to access services

Avoid passing the container or router manually into components. Instead, use:

```ts
const { container } = useContext(StoneContext)
const router = container.resolve(Router)
```

This ensures your components remain portable and loosely coupled to the framework.

#### Never use the service container for reactive state

The service container is for:

* Instantiating services
* Providing architectural structure
* Managing shared stateless dependencies

It is not designed for global mutable state.

Use React’s own tools (`useState`, `useReducer`, or libraries like Zustand) for reactive client state.

#### Snapshot only when needed

If your data is:

* Fetched in `handle()` → already snapshotted ✅
* Used only on the server → no need to snapshot ❌
* Used across SSR boundary → use snapshot() or `@Snapshot()` ✅
* Never snapshot sensitive data (e.g. passwords, tokens) ❌
* Avoid snapshotting large objects or arrays unnecessarily ❌

::: important
Snapshotting too much can bloat HTML and affect hydration performance.  
So be mindful of what you snapshot and don't overdo it.
:::

## Summary

Stone.js provides a unified, context-aware approach to data fetching that adapts to all dimensions, SSR, CSR, and SOR, without requiring separate strategies or mental models.

Thanks to the Continuum Architecture:

* You can fetch data in the **functional dimension** using `handle()` or services.
* You can render it in the **view dimension** using React components.
* And you can hydrate it **automatically** through snapshots, bridging both worlds.

### Key takeaways:

* Use `handle()` to fetch data for your pages, it will be snapshotted in SSR.
* Use `reactRuntime.snapshot()` in middleware, layouts, or services when needed.
* Use the `@Snapshot()` decorator to snapshot service methods transparently.
* Use `StoneContext` to access runtime context in React components.
* Don't use the container for reactive state, keep state local or use a store.
* Lazy loading works seamlessly with data fetching and hydration.

Stone.js does not reinvent data fetching, it simplifies it by aligning it with architectural boundaries and runtime awareness.

When you fetch, render, and hydrate in sync, your app feels seamless.
That’s not just SSR done right, it’s the **continuum in action**.
