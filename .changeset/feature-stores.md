---
"@stone-js/store": patch
---

feat: a feature's store can be a class, declared like everything else

A store used to be a data definition only: `{ name, state }`, no behaviour. A feature usually wants more. The `competition` module has its client, its service and its store, and the store's actions call the client, which a data object cannot express.

So a store now takes the three forms the framework accepts everywhere else:

```ts
// Declarative: the container builds it, its constructor is auto-wired.
@FeatureStore('competition')
export class CompetitionStore extends StateStore<CompetitionState> {
  constructor ({ competitionClient }) { super({ list: [] }); this.client = competitionClient }
  async load () { this.setState({ list: await this.client.list() }) }
}

// Imperative: the same class, or a factory with the container in hand.
defineStore(CompetitionStore, { name: 'competition' })
defineStore((container) => StateStore.create({ ... }), { name: 'live', isFactory: true })
```

Everything a data store gets, the other forms get too: resolved under `store.<name>`, hydrated from the snapshot before the first render, per-request on the server by default. `@FeatureStore` carries the module blueprint with it, so declaring a store is the whole setup, and `defineStore` declares exactly what the decorator declares: neither paradigm can do what the other cannot. The data form is untouched.
