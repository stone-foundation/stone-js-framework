# Interface: DependencyResolver

Dependency resolver.
Used to resolve dependencies for a given module.

## Param

The module to resolve.

## Properties

### has()

```ts
has: (key) => boolean;
```

#### Parameters

##### key

[`BindingKey`](../type-aliases/BindingKey.md)

#### Returns

`boolean`

***

### resolve()

```ts
resolve: <V>(key, singleton?) => V;
```

#### Type Parameters

##### V

`V` *extends* [`BindingKey`](../type-aliases/BindingKey.md)

#### Parameters

##### key

[`BindingKey`](../type-aliases/BindingKey.md)

##### singleton?

`boolean`

#### Returns

`V`
