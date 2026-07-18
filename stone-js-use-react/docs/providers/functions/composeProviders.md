# Function: composeProviders()

```ts
function composeProviders<VNode>(
   providers, 
   children, 
   createElement, 
   resolve, 
   baseProps?): VNode;
```

Compose registered providers around a children node, engine-agnostically.

Providers are sorted by ascending priority (lower = outer) and nested so the lowest-priority
provider is the outermost wrapper. `createElement` and `resolve` are supplied by the concrete
engine (React/Vue), keeping this function framework-free.

## Type Parameters

### VNode

`VNode`

## Parameters

### providers

[`MetaViewProvider`](../interfaces/MetaViewProvider.md)\<`unknown`\>[]

The registered providers.

### children

`VNode`

The app node to wrap.

### createElement

(`component`, `props`, ...`children`) => `VNode`

The engine's element factory.

### resolve

(`provider`) => `unknown`

Resolves a provider descriptor to a renderable component (DI-aware).

### baseProps?

`Record`\<`string`, `unknown`\>

Props merged into every provider element (e.g. a shared context).

## Returns

`VNode`

The wrapped node.
