# Type Alias: ProposalAccessorDecorator()\<T\>

```ts
type ProposalAccessorDecorator<T> = <TFunction>(target, context) => TFunction | undefined;
```

Represents an accessor decorator using the 2023-11 proposal syntax.

A function that decorates a getter or setter method and optionally returns a new implementation.

## Type Parameters

### T

`T` *extends* `Function` = `Function`

The type of the accessor being decorated.

## Type Parameters

### TFunction

`TFunction` *extends* `T`

## Parameters

### target

`TFunction`

The class prototype or static target containing the accessor.

### context

`ClassAccessorDecoratorContext`\<`T`\>

The context object providing metadata about the accessor.

## Returns

`TFunction` \| `undefined`

The original or a modified accessor, or `undefined`.
