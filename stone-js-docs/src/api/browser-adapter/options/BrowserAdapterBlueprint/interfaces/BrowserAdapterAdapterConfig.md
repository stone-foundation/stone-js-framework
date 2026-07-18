# Interface: BrowserAdapterAdapterConfig

Configuration interface for the Browser Adapter.

Extends the `AdapterConfig` interface from the Stone.js framework and provides
customizable options specific to the Browser platform. This includes
alias, resolver, middleware, hooks, and various adapter state flags.

## Extends

- `AdapterConfig`

## Properties

### events

```ts
events: string[];
```

Browser-specific events that the adapter should listen for.
