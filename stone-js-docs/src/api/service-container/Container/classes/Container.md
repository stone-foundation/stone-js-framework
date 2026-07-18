# Class: Container

Class representing a Container.

The Container class acts as a dependency injection container, managing bindings and resolving instances.
It supports different types of bindings, such as singletons, factories, and instances, and allows the use of aliases for bindings.
This makes it easier to manage and resolve complex dependency trees in an application.

## Author

Mr. Stone <evensstone@gmail.com>

## Extends

- [`Proxiable`](../../Proxiable/classes/Proxiable.md)

## Constructors

### Constructor

```ts
protected new Container(): Container;
```

Create a container.

Initializes the container with empty alias and binding maps.

#### Returns

`Container`

#### Overrides

[`Proxiable`](../../Proxiable/classes/Proxiable.md).[`constructor`](../../Proxiable/classes/Proxiable.md#constructor)

## Methods

### alias()

```ts
alias(key, aliases): this;
```

Set a binding as alias.

Adds one or more aliases for a given binding key.

#### Parameters

##### key

[`BindingKey`](../../declarations/type-aliases/BindingKey.md)

The binding value.

##### aliases

One or more strings representing the aliases.

`string` | `string`[]

#### Returns

`this`

The container instance.

***

### autoBinding()

```ts
autoBinding<V>(
   name, 
   item?, 
   singleton?, 
   alias?): this;
```

AutoBind value to the service container.

#### Type Parameters

##### V

`V` *extends* [`BindingValue`](../../declarations/type-aliases/BindingValue.md)

#### Parameters

##### name

[`BindingKey`](../../declarations/type-aliases/BindingKey.md)

A key to make the binding. Can be anything.

##### item?

`V`

The item to bind.

##### singleton?

`boolean` = `true`

Bind as singleton when true.

##### alias?

Key binding aliases.

`string` | `string`[]

#### Returns

`this`

The container instance.

***

### binding()

```ts
binding<V>(key, resolver): this;
```

Bind a resolver function into the container under the provided key, returning a new instance each time.

#### Type Parameters

##### V

`V` *extends* [`BindingValue`](../../declarations/type-aliases/BindingValue.md)

#### Parameters

##### key

[`BindingKey`](../../declarations/type-aliases/BindingKey.md)

The key to associate with the value.

##### resolver

[`Resolver`](../../declarations/type-aliases/Resolver.md)\<`V`\>

The resolver function to provide the value.

#### Returns

`this`

The container instance.

***

### bindingIf()

```ts
bindingIf<V>(key, resolver): this;
```

Bind a resolver function into the container under the provided key, returning a new instance each time if not already bound.

#### Type Parameters

##### V

`V` *extends* [`BindingValue`](../../declarations/type-aliases/BindingValue.md)

#### Parameters

##### key

[`BindingKey`](../../declarations/type-aliases/BindingKey.md)

The key to associate with the value.

##### resolver

[`Resolver`](../../declarations/type-aliases/Resolver.md)\<`V`\>

The resolver function to provide the value.

#### Returns

`this`

The container instance.

***

### bound()

```ts
bound(key): boolean;
```

Check if a value is already bound in the container by its key.

#### Parameters

##### key

[`BindingKey`](../../declarations/type-aliases/BindingKey.md)

The key to check.

#### Returns

`boolean`

True if the key is bound, false otherwise.

***

### clear()

```ts
clear(): this;
```

Reset the container so that all bindings are removed.

#### Returns

`this`

The container instance.

***

### factory()

```ts
factory<V>(key): () => V;
```

Resolve a value from the container by its key and return it in a factory function.

#### Type Parameters

##### V

`V` *extends* [`BindingValue`](../../declarations/type-aliases/BindingValue.md)

#### Parameters

##### key

[`BindingKey`](../../declarations/type-aliases/BindingKey.md)

The key to resolve.

#### Returns

A factory function that returns the resolved value.

```ts
(): V;
```

##### Returns

`V`

***

### getAliases()

```ts
getAliases(): Map<string, BindingKey>;
```

Retrieve the value of the aliases property.

#### Returns

`Map`\<`string`, [`BindingKey`](../../declarations/type-aliases/BindingKey.md)\>

A map of all aliases registered in the container.

***

### getAliasKey()

```ts
getAliasKey(alias): 
  | undefined
  | BindingKey;
```

Get a binding key by its alias.

#### Parameters

##### alias

[`BindingKey`](../../declarations/type-aliases/BindingKey.md)

The alias name.

#### Returns

  \| `undefined`
  \| [`BindingKey`](../../declarations/type-aliases/BindingKey.md)

The binding key associated with the alias, or undefined if not found.

***

### getBindings()

```ts
getBindings(): Map<BindingKey, Binding<BindingValue>>;
```

Retrieve the value of the bindings property.

#### Returns

`Map`\<[`BindingKey`](../../declarations/type-aliases/BindingKey.md), [`Binding`](../../models/Binding/classes/Binding.md)\<[`BindingValue`](../../declarations/type-aliases/BindingValue.md)\>\>

A map of all bindings registered in the container.

***

### has()

```ts
has(key): boolean;
```

Check if a value is already bound in the container by its key.

#### Parameters

##### key

[`BindingKey`](../../declarations/type-aliases/BindingKey.md)

The key to check.

#### Returns

`boolean`

True if the key is bound, false otherwise.

***

### instance()

```ts
instance(key, value): this;
```

Bind a single instance or value into the container under the provided key.

#### Parameters

##### key

[`BindingKey`](../../declarations/type-aliases/BindingKey.md)

The key to associate with the value.

##### value

[`BindingValue`](../../declarations/type-aliases/BindingValue.md)

The value to be bound.

#### Returns

`this`

The container instance.

***

### instanceIf()

```ts
instanceIf(key, value): this;
```

Bind a single instance or value into the container under the provided key if not already bound.

#### Parameters

##### key

[`BindingKey`](../../declarations/type-aliases/BindingKey.md)

The key to associate with the value.

##### value

[`BindingValue`](../../declarations/type-aliases/BindingValue.md)

The value to be bound.

#### Returns

`this`

The container instance.

***

### isAlias()

```ts
isAlias(alias): boolean;
```

Check if an alias exists in the container.

#### Parameters

##### alias

[`BindingKey`](../../declarations/type-aliases/BindingKey.md)

The alias to check.

#### Returns

`boolean`

True if the alias exists, false otherwise.

***

### make()

```ts
make<V>(key): V;
```

Resolve a registered value from the container by its key.

#### Type Parameters

##### V

`V` *extends* [`BindingValue`](../../declarations/type-aliases/BindingValue.md)

#### Parameters

##### key

[`BindingKey`](../../declarations/type-aliases/BindingKey.md)

The key to resolve.

#### Returns

`V`

The resolved value.

#### Throws

ContainerError if the key cannot be resolved.

***

### resolve()

```ts
resolve<V>(key, singleton): V;
```

Resolve a value from the container by its key, binding it if necessary.

#### Type Parameters

##### V

`V` *extends* [`BindingValue`](../../declarations/type-aliases/BindingValue.md)

#### Parameters

##### key

[`BindingKey`](../../declarations/type-aliases/BindingKey.md)

The key to resolve.

##### singleton

`boolean` = `false`

Whether to bind as a singleton if not already bound.

#### Returns

`V`

The resolved value.

***

### singleton()

```ts
singleton<V>(key, resolver): this;
```

Bind a resolver function into the container under the provided key as a singleton.

The resolver function will be called once, and the resulting value will be cached for future use.

#### Type Parameters

##### V

`V` *extends* [`BindingValue`](../../declarations/type-aliases/BindingValue.md)

#### Parameters

##### key

[`BindingKey`](../../declarations/type-aliases/BindingKey.md)

The key to associate with the singleton value.

##### resolver

[`Resolver`](../../declarations/type-aliases/Resolver.md)\<`V`\>

The resolver function to provide the value.

#### Returns

`this`

The container instance.

***

### singletonIf()

```ts
singletonIf<V>(key, resolver): this;
```

Bind a resolver function into the container under the provided key as a singleton if not already bound.

#### Type Parameters

##### V

`V` *extends* [`BindingValue`](../../declarations/type-aliases/BindingValue.md)

#### Parameters

##### key

[`BindingKey`](../../declarations/type-aliases/BindingKey.md)

The key to associate with the singleton value.

##### resolver

[`Resolver`](../../declarations/type-aliases/Resolver.md)\<`V`\>

The resolver function to provide the value.

#### Returns

`this`

The container instance.

***

### create()

```ts
static create(): Container;
```

Create a Container.

#### Returns

`Container`

A new Container instance.
