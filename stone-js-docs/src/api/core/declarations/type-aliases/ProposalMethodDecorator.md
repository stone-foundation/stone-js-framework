# Type Alias: ProposalMethodDecorator()\<T\>

```ts
type ProposalMethodDecorator<T> = <TFunction>(target, context) => TFunction | undefined;
```

Represents a method decorator using the 2023-11 proposal syntax.

A function that decorates a class method and optionally returns a new method implementation.

## Type Parameters

### T

`T` *extends* `Function` = `Function`

The type of the method being decorated.

## Type Parameters

### TFunction

`TFunction` *extends* `T`

## Parameters

### target

`TFunction`

The class prototype or static target containing the method.

### context

`ClassMethodDecoratorContext`\<`T`\>

The context object providing metadata about the method.

## Returns

`TFunction` \| `undefined`

The original or a modified method, or `undefined`.
