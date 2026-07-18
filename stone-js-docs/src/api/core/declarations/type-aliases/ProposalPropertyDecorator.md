# Type Alias: ProposalPropertyDecorator()

```ts
type ProposalPropertyDecorator = (target, context) => (initialValue) => unknown | undefined;
```

Represents a property decorator using the 2023-11 proposal syntax.

A function that decorates a class field and optionally returns an initializer function
to define the property's initial value.

## Parameters

### target

`undefined`

Always `undefined` for field decorators.

### context

`ClassFieldDecoratorContext`

The context object providing metadata about the field.

## Returns

An initializer function for the property value.

```ts
(initialValue): unknown | undefined;
```

### Parameters

#### initialValue

`unknown`

### Returns

`unknown` \| `undefined`
