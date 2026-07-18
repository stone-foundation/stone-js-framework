# Class: `abstract` ResolverBinding\<V\>

Class representing a ResolverBinding.

This class extends the Binding class, using a resolver function to lazily resolve the value when needed.

## Author

Mr. Stone <evensstone@gmail.com>

## Extends

- [`Binding`](../../Binding/classes/Binding.md)\<`V`\>

## Extended by

- [`Factory`](../../Factory/classes/Factory.md)
- [`Singleton`](../../Singleton/classes/Singleton.md)

## Type Parameters

### V

`V` *extends* [`BindingValue`](../../../declarations/type-aliases/BindingValue.md)

The type of value that this binding holds.

## Constructors

### Constructor

```ts
new ResolverBinding<V>(resolver): ResolverBinding<V>;
```

Create a new instance of ResolverBinding.

#### Parameters

##### resolver

[`Resolver`](../../../declarations/type-aliases/Resolver.md)\<`V`\>

The resolver function to provide the binding value.

#### Returns

`ResolverBinding`\<`V`\>

#### Throws

ContainerError if the resolver is not a function.

#### Overrides

[`Binding`](../../Binding/classes/Binding.md).[`constructor`](../../Binding/classes/Binding.md#constructor)

## Properties

### resolver

```ts
protected readonly resolver: Resolver<V>;
```

The resolver function used to provide the binding value.

This function will be called when the value is needed, allowing for lazy instantiation
and dependency resolution. It should return an instance of type `V`.

***

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
abstract resolve(container): undefined | V;
```

Resolve and return the value of the binding.

This abstract method must be implemented by subclasses to provide specific resolution logic.

#### Parameters

##### container

[`Container`](../../../Container/classes/Container.md)

The container to resolve dependencies from.

#### Returns

`undefined` \| `V`

The resolved value of the binding.

#### Inherited from

[`Binding`](../../Binding/classes/Binding.md).[`resolve`](../../Binding/classes/Binding.md#resolve)
