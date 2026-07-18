# Class: Instance\<V\>

Class representing an Instance.

This class extends the Binding class and directly holds an instance value.
It provides a straightforward resolution mechanism that simply returns the stored value.

## Author

Mr. Stone <evensstone@gmail.com>

## Extends

- [`Binding`](../../Binding/classes/Binding.md)\<`V`\>

## Type Parameters

### V

`V` *extends* [`BindingValue`](../../../declarations/type-aliases/BindingValue.md)

The type of value that this binding holds.

## Constructors

### Constructor

```ts
new Instance<V>(value?): Instance<V>;
```

Create a new instance of Binding.

#### Parameters

##### value?

`V`

The value to be held by the binding.

#### Returns

`Instance`\<`V`\>

#### Inherited from

[`Binding`](../../Binding/classes/Binding.md).[`constructor`](../../Binding/classes/Binding.md#constructor)

## Properties

### resolved

```ts
protected resolved: boolean;
```

Whether the value has been resolved at least once.

Tracked explicitly (not inferred from `value !== undefined`) so a binding whose resolved
value is legitimately `undefined` is still considered resolved — preserving the singleton
guarantee and avoiding repeated resolver side effects.

#### Inherited from

[`Binding`](../../Binding/classes/Binding.md).[`resolved`](../../Binding/classes/Binding.md#resolved)

***

### value?

```ts
protected optional value?: V;
```

The value held by the binding.

This value is resolved at runtime, either directly or through a resolver function.

#### Inherited from

[`Binding`](../../Binding/classes/Binding.md).[`value`](../../Binding/classes/Binding.md#value)

## Methods

### isResolved()

```ts
protected isResolved(): boolean;
```

Check if the value has been resolved.

#### Returns

`boolean`

A boolean indicating whether the value has been resolved.

#### Inherited from

[`Binding`](../../Binding/classes/Binding.md).[`isResolved`](../../Binding/classes/Binding.md#isresolved)

***

### resolve()

```ts
resolve(_container): V | undefined;
```

Resolve and return the value of the binding.

#### Parameters

##### \_container

[`IContainer`](../../../declarations/interfaces/IContainer.md)

Container to resolve dependencies (not used in this implementation).

#### Returns

`V` \| `undefined`

The resolved value of the binding.

#### Overrides

[`Binding`](../../Binding/classes/Binding.md).[`resolve`](../../Binding/classes/Binding.md#resolve)
