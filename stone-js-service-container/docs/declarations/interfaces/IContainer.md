# Interface: IContainer

Interface representing a Container.

This interface defines the public contract for dependency injection containers,
allowing for better testability and preventing circular dependencies.

## Author

Mr. Stone <evensstone@gmail.com>

## Properties

### alias

```ts
alias: (key, aliases) => this;
```

Set a binding as alias.

#### Parameters

##### key

[`BindingKey`](../type-aliases/BindingKey.md)

##### aliases

`string` \| `string`[]

#### Returns

`this`

***

### autoBinding

```ts
autoBinding: <V>(name, item?, singleton?, alias?) => this;
```

AutoBind value to the service container.

#### Type Parameters

##### V

`V` *extends* [`BindingValue`](../type-aliases/BindingValue.md)

#### Parameters

##### name

[`BindingKey`](../type-aliases/BindingKey.md)

##### item?

`V`

##### singleton?

`boolean`

##### alias?

`string` \| `string`[]

#### Returns

`this`

***

### binding

```ts
binding: <V>(key, resolver) => this;
```

Bind a resolver function into the container under the provided key, returning a new instance each time.

#### Type Parameters

##### V

`V` *extends* [`BindingValue`](../type-aliases/BindingValue.md)

#### Parameters

##### key

[`BindingKey`](../type-aliases/BindingKey.md)

##### resolver

[`Resolver`](../type-aliases/Resolver.md)\<`V`\>

#### Returns

`this`

***

### bindingIf

```ts
bindingIf: <V>(key, resolver) => this;
```

Bind a resolver function into the container under the provided key, returning a new instance each time if not already bound.

#### Type Parameters

##### V

`V` *extends* [`BindingValue`](../type-aliases/BindingValue.md)

#### Parameters

##### key

[`BindingKey`](../type-aliases/BindingKey.md)

##### resolver

[`Resolver`](../type-aliases/Resolver.md)\<`V`\>

#### Returns

`this`

***

### bound

```ts
bound: (key) => boolean;
```

Check if a value is already bound in the container by its key.

#### Parameters

##### key

[`BindingKey`](../type-aliases/BindingKey.md)

#### Returns

`boolean`

***

### clear

```ts
clear: () => this;
```

Reset the container so that all bindings are removed.

#### Returns

`this`

***

### factory

```ts
factory: <V>(key) => () => V;
```

Resolve a value from the container by its key and return it in a factory function.

#### Type Parameters

##### V

`V` *extends* [`BindingValue`](../type-aliases/BindingValue.md)

#### Parameters

##### key

[`BindingKey`](../type-aliases/BindingKey.md)

#### Returns

() => `V`

***

### getAliases

```ts
getAliases: () => Map<string, BindingKey>;
```

Retrieve the value of the aliases property.

#### Returns

`Map`\<`string`, [`BindingKey`](../type-aliases/BindingKey.md)\>

***

### getAliasKey

```ts
getAliasKey: (alias) => BindingKey | undefined;
```

Get a binding key by its alias.

#### Parameters

##### alias

[`BindingKey`](../type-aliases/BindingKey.md)

#### Returns

[`BindingKey`](../type-aliases/BindingKey.md) \| `undefined`

***

### getBindings

```ts
getBindings: () => Map<BindingKey, IBinding<BindingValue>>;
```

Retrieve the value of the bindings property.

#### Returns

`Map`\<[`BindingKey`](../type-aliases/BindingKey.md), [`IBinding`](IBinding.md)\<[`BindingValue`](../type-aliases/BindingValue.md)\>\>

***

### has

```ts
has: (key) => boolean;
```

Check if a value is already bound in the container by its key.

#### Parameters

##### key

[`BindingKey`](../type-aliases/BindingKey.md)

#### Returns

`boolean`

***

### instance

```ts
instance: (key, value) => this;
```

Bind a single instance or value into the container under the provided key.

#### Parameters

##### key

[`BindingKey`](../type-aliases/BindingKey.md)

##### value

[`BindingValue`](../type-aliases/BindingValue.md)

#### Returns

`this`

***

### instanceIf

```ts
instanceIf: (key, value) => this;
```

Bind a single instance or value into the container under the provided key if not already bound.

#### Parameters

##### key

[`BindingKey`](../type-aliases/BindingKey.md)

##### value

[`BindingValue`](../type-aliases/BindingValue.md)

#### Returns

`this`

***

### isAlias

```ts
isAlias: (alias) => boolean;
```

Check if an alias exists in the container.

#### Parameters

##### alias

[`BindingKey`](../type-aliases/BindingKey.md)

#### Returns

`boolean`

***

### make

```ts
make: <V>(key) => V;
```

Resolve a registered value from the container by its key.

#### Type Parameters

##### V

`V` *extends* [`BindingValue`](../type-aliases/BindingValue.md)

#### Parameters

##### key

[`BindingKey`](../type-aliases/BindingKey.md)

#### Returns

`V`

***

### resolve

```ts
resolve: <V>(key, singleton?) => V;
```

Resolve a value from the container by its key, binding it if necessary.

#### Type Parameters

##### V

`V` *extends* [`BindingValue`](../type-aliases/BindingValue.md)

#### Parameters

##### key

[`BindingKey`](../type-aliases/BindingKey.md)

##### singleton?

`boolean`

#### Returns

`V`

***

### singleton

```ts
singleton: <V>(key, resolver) => this;
```

Bind a resolver function into the container under the provided key as a singleton.

#### Type Parameters

##### V

`V` *extends* [`BindingValue`](../type-aliases/BindingValue.md)

#### Parameters

##### key

[`BindingKey`](../type-aliases/BindingKey.md)

##### resolver

[`Resolver`](../type-aliases/Resolver.md)\<`V`\>

#### Returns

`this`

***

### singletonIf

```ts
singletonIf: <V>(key, resolver) => this;
```

Bind a resolver function into the container under the provided key as a singleton if not already bound.

#### Type Parameters

##### V

`V` *extends* [`BindingValue`](../type-aliases/BindingValue.md)

#### Parameters

##### key

[`BindingKey`](../type-aliases/BindingKey.md)

##### resolver

[`Resolver`](../type-aliases/Resolver.md)\<`V`\>

#### Returns

`this`
