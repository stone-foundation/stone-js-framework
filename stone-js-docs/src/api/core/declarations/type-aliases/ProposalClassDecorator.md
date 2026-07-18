# Type Alias: ProposalClassDecorator()\<TClass\>

```ts
type ProposalClassDecorator<TClass> = <TFunction>(target, context) => TFunction | undefined;
```

Represents a class decorator using the 2023-11 proposal syntax.

A function that decorates a class and optionally returns a new constructor.

## Type Parameters

### TClass

`TClass` *extends* [`ClassType`](ClassType.md) = [`ClassType`](ClassType.md)

The type of the class constructor being decorated.

## Type Parameters

### TFunction

`TFunction` *extends* `TClass`

## Parameters

### target

`TFunction`

The class constructor to be decorated.

### context

`ClassDecoratorContext`\<`TClass`\>

The context object providing metadata about the class.

## Returns

`TFunction` \| `undefined`

The original or a modified class constructor, or `undefined`.
