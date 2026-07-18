# Function: methodDecoratorLegacyWrapper()

```ts
function methodDecoratorLegacyWrapper<T>(decorator): MethodDecorator;
```

Wraps a method decorator to ensure compatibility with both legacy and 2023-11 proposal contexts.

This wrapper enforces that the decorator is only applied in a valid 2023-11 proposal context
and throws appropriate errors for unsupported usage.

## Type Parameters

### T

`T` *extends* `Function` = `Function`

The type of the method being decorated.

## Parameters

### decorator

[`ProposalMethodDecorator`](../../../declarations/type-aliases/ProposalMethodDecorator.md)\<`T`\>

The method decorator function conforming to the 2023-11 proposal.

## Returns

`MethodDecorator`

A legacy-compatible `MethodDecorator` that works with TypeScript's expectations.

## Throws

If the decorator is used outside the 2023-11 context or on invalid targets.
