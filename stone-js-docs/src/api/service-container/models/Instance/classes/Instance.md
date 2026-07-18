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

### value?

```ts
protected optional value: V;
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
resolve(_container): undefined | V;
```

Resolve and return the value of the binding.

#### Parameters

##### \_container

[`Container`](../../../Container/classes/Container.md)

Container to resolve dependencies (not used in this implementation).

#### Returns

`undefined` \| `V`

The resolved value of the binding.

#### Overrides

[`Binding`](../../Binding/classes/Binding.md).[`resolve`](../../Binding/classes/Binding.md#resolve)
