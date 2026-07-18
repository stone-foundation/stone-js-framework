# Function: isViewProvider()

```ts
function isViewProvider<T>(value): value is MetaViewProvider<T>;
```

Type guard for [MetaViewProvider](../interfaces/MetaViewProvider.md).

## Type Parameters

### T

`T` = `unknown`

## Parameters

### value

`unknown`

The value to test.

## Returns

`value is MetaViewProvider<T>`

True if it is a view provider descriptor.
