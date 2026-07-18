# Function: defineViewProvider()

```ts
function defineViewProvider<T>(module, options?): MetaViewProvider<T>;
```

Declare a view provider that wraps the application root (imperative substrate).

## Type Parameters

### T

`T` = `unknown`

## Parameters

### module

`T`

The provider component (or factory).

### options?

[`ViewProviderOptions`](../interfaces/ViewProviderOptions.md)

Composition and prop options.

## Returns

[`MetaViewProvider`](../interfaces/MetaViewProvider.md)\<`T`\>

A normalized [MetaViewProvider](../interfaces/MetaViewProvider.md).
