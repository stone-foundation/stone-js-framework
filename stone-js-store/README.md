# Stone.js · Store

> Application state written once, read by any view engine. Vanilla core, SSR hydration built in, and
> no knowledge of React, Vue, Svelte or the DOM.

Part of **[Stone.js](https://stonejs.dev)**, the reference implementation of the
[Continuum Architecture](https://evens-stone.github.io/continuum-manifesto/manifesto): write your
domain once, and the context (runtime, protocol, caller) applies to it at run time.

- **Agnostic**: runs during server rendering, in the browser and in React Native, unchanged.
- **Hydration is not glue**: the state the server rendered is adopted *before* the first render.
- **Request-isolated by default**: two visitors rendering at once never see each other's state.
- **A container citizen**: reached with `useContainer()` in a component, injected into a service.

## Install

```bash
npm i @stone-js/store
```

## Enabling it

Like every Stone.js module, one of two ways.

```ts
import { Store, defineStore } from '@stone-js/store'
import { StoneApp } from '@stone-js/core'

@Store({ stores: [defineStore({ name: 'tasks', state: { items: [], filter: 'all' } })] })
@StoneApp({ name: 'my-app' })
export class Application {}
```

```ts
import { defineStoneApp, defineConfig } from '@stone-js/core'
import { defineStore, storeBlueprint } from '@stone-js/store'

export const Application = defineStoneApp({ name: 'my-app' }, [storeBlueprint])

export const AppConfig = defineConfig((blueprint) => blueprint.set('stone.store.stores', [
  defineStore({ name: 'tasks', state: { items: [], filter: 'all' } })
]))
```

## Using it

Every store is registered as `store.<name>`, so anything with the container reaches it.

```ts
// in a component, on any view engine
const tasks = useContainer().make<IStore<Tasks>>('store.tasks')

// in a service, through the constructor
constructor ({ 'store.tasks': tasks }: { 'store.tasks': IStore<Tasks> }) { this.tasks = tasks }
```

```ts
tasks.getState()
tasks.setState({ filter: 'done' })                       // merges, like a component's setState
tasks.setState((s) => ({ items: [...s.items, task] }))   // or from the current state
tasks.select((s) => s.items.length)                      // read a derived value now
tasks.watch((s) => s.items.length, (n) => render(n))     // watch it, told only when it changes
tasks.reset()
```

`watch` compares before notifying, which is the difference that matters: a selector building a fresh
object is never equal to itself, so a naive subscription re-renders forever. Select values, or pass
your own comparison as the third argument.

## SSR hydration

Nothing to wire. Stone.js already ships a keyed, XSS-safe snapshot channel, and a store reads its
state out of it when it is registered, which is **before** the first render. Hydrating in an effect
afterwards is what produces the flash of empty state that hand-rolled integrations suffer from.

The state is merged over the initial state, so a snapshot written before a key existed still hydrates
into a usable state instead of an incomplete one.

This module never imports a view layer: it reads the snapshot through the container, duck-typed. A Vue
or Svelte layer registering the same binding gets hydration with nothing to add here.

## Request isolation

`perRequest` defaults to `true`, and the default is the point. A store held as a process-wide
singleton leaks one visitor's state into the next visitor's page during server rendering, and nothing
in development reveals it because there is only ever one request at a time. Stone.js gives an
ephemeral container per event, so honouring it costs nothing.

```ts
defineStore({ name: 'flags', state: { beta: false }, perRequest: false })   // genuinely process-wide
```

## Documentation

Full documentation: **[stonejs.dev/docs/extensions/store](https://stonejs.dev/docs/extensions/store)**.

## License

MIT
