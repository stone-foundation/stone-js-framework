# Interface: NodeConsoleAdapterAdapterConfig

Configuration interface for the Node Cli Adapter.

Extends the `AdapterConfig` interface from the Stone.js framework and provides
customizable options specific to the Node Cli platform. This includes
alias, resolver, middleware, hooks, and various adapter state flags.

## Extends

- `AdapterConfig`

## Properties

### commands

```ts
commands: MetaCommandHandler<IncomingEvent, unknown>[];
```

The commands that the Node Cli adapter will handle.
