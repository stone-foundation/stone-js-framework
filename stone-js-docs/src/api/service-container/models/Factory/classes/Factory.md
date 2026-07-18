# Class: Factory\<V\>

Class representing a Factory.

The Factory class extends the ResolverBinding class, providing a mechanism to resolve a new instance each time the binding is resolved.
This ensures that a fresh instance is created with each call to the `resolve` method.

## Author

Mr. Stone <evensstone@gmail.com>

## Extends

- [`ResolverBinding`](../../ResolverBinding/classes/ResolverBinding.md)\<`V`\>

## Type Parameters

### V

`V` *extends* [`BindingValue`](../../../declarations/type-aliases/BindingValue.md)

The type of value that this binding holds.

## Constructors

### Constructor

```ts
new Factory<V>(resolver): Factory<V>;
```

Create a new instance of ResolverBinding.

#### Parameters

##### resolver

[`Resolver`](../../../declarations/type-aliases/Resolver.md)\<`V`\>

The resolver function to provide the binding value.

#### Returns

`Factory`\<`V`\>

#### Throws

ContainerError if the resolver is not a function.

#### Inherited from

[`ResolverBinding`](../../ResolverBinding/classes/ResolverBinding.md).[`constructor`](../../ResolverBinding/classes/ResolverBinding.md#constructor)

## Properties

### resolver

```ts
protected readonly resolver: Resolver<V>;
```

The resolver function used to provide the binding value.

This function will be called when the value is needed, allowing for lazy instantiation
and dependency resolution. It should return an instance of type `V`.

#### Inherited from

[`ResolverBinding`](../../ResolverBinding/classes/ResolverBinding.md).[`resolver`](../../ResolverBinding/classes/ResolverBinding.md#resolver)

***

### value?

```ts
protected optional value: V;
```

The value held by the binding.

This value is resolved at runtime, either directly or through a resolver function.

#### Inherited from

[`ResolverBinding`](../../ResolverBinding/classes/ResolverBinding.md).[`value`](../../ResolverBinding/classes/ResolverBinding.md#value)

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

[`ResolverBinding`](../../ResolverBinding/classes/ResolverBinding.md).[`isResolved`](../../ResolverBinding/classes/ResolverBinding.md#isresolved)

***

### resolve()

```ts
resolve(container): V;
```

Resolve and return the value of the binding.

Each time this method is called, a new value is resolved using the resolver function.
This is intended for cases where a fresh instance is required for each resolution, such as factories or transient dependencies.

#### Parameters

##### container

[`Container`](../../../Container/classes/Container.md)

The container to resolve dependencies from.

#### Returns

`V`

The resolved value of the binding.

#### Throws

ContainerError if the value cannot be resolved.

#### Overrides

[`ResolverBinding`](../../ResolverBinding/classes/ResolverBinding.md).[`resolve`](../../ResolverBinding/classes/ResolverBinding.md#resolve)
