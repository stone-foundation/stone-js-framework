# Class: Container

Class representing a Container.

The Container class acts as a dependency injection container, managing bindings and resolving instances.
It supports different types of bindings, such as singletons, factories, and instances, and allows the use of aliases for bindings.
This makes it easier to manage and resolve complex dependency trees in an application.

## Author

Mr. Stone <evensstone@gmail.com>

## Extends

- [`Proxiable`](../../Proxiable/classes/Proxiable.md)

## Implements

- [`IContainer`](../../declarations/interfaces/IContainer.md)

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

`string` \| `string`[]

One or more strings representing the aliases.

#### Returns

`this`

The container instance.

#### Implementation of

[`IContainer`](../../declarations/interfaces/IContainer.md).[`alias`](../../declarations/interfaces/IContainer.md#alias)

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

`string` \| `string`[]

Key binding aliases.

#### Returns

`this`

The container instance.

#### Implementation of

[`IContainer`](../../declarations/interfaces/IContainer.md).[`autoBinding`](../../declarations/interfaces/IContainer.md#autobinding)

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

#### Implementation of

[`IContainer`](../../declarations/interfaces/IContainer.md).[`binding`](../../declarations/interfaces/IContainer.md#binding)

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

#### Implementation of

[`IContainer`](../../declarations/interfaces/IContainer.md).[`bindingIf`](../../declarations/interfaces/IContainer.md#bindingif)

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

#### Implementation of

[`IContainer`](../../declarations/interfaces/IContainer.md).[`bound`](../../declarations/interfaces/IContainer.md#bound)

***

### clear()

```ts
clear(): this;
```

Reset the container so that all bindings are removed.

#### Returns

`this`

The container instance.

#### Implementation of

[`IContainer`](../../declarations/interfaces/IContainer.md).[`clear`](../../declarations/interfaces/IContainer.md#clear)

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

() => `V`

#### Implementation of

[`IContainer`](../../declarations/interfaces/IContainer.md).[`factory`](../../declarations/interfaces/IContainer.md#factory)

***

### getAliases()

```ts
getAliases(): Map<string, BindingKey>;
```

Retrieve the value of the aliases property.

#### Returns

`Map`\<`string`, [`BindingKey`](../../declarations/type-aliases/BindingKey.md)\>

A map of all aliases registered in the container.

#### Implementation of

[`IContainer`](../../declarations/interfaces/IContainer.md).[`getAliases`](../../declarations/interfaces/IContainer.md#getaliases)

***

### getAliasKey()

```ts
getAliasKey(alias): 
  | BindingKey
  | undefined;
```

Get a binding key by its alias.

#### Parameters

##### alias

[`BindingKey`](../../declarations/type-aliases/BindingKey.md)

The alias name.

#### Returns

  \| [`BindingKey`](../../declarations/type-aliases/BindingKey.md)
  \| `undefined`

The binding key associated with the alias, or undefined if not found.

#### Implementation of

[`IContainer`](../../declarations/interfaces/IContainer.md).[`getAliasKey`](../../declarations/interfaces/IContainer.md#getaliaskey)

***

### getBindings()

```ts
getBindings(): Map<BindingKey, Binding<BindingValue>>;
```

Retrieve the value of the bindings property.

#### Returns

`Map`\<[`BindingKey`](../../declarations/type-aliases/BindingKey.md), [`Binding`](../../models/Binding/classes/Binding.md)\<[`BindingValue`](../../declarations/type-aliases/BindingValue.md)\>\>

A map of all bindings registered in the container.

#### Implementation of

[`IContainer`](../../declarations/interfaces/IContainer.md).[`getBindings`](../../declarations/interfaces/IContainer.md#getbindings)

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

#### Implementation of

[`IContainer`](../../declarations/interfaces/IContainer.md).[`has`](../../declarations/interfaces/IContainer.md#has)

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

#### Implementation of

[`IContainer`](../../declarations/interfaces/IContainer.md).[`instance`](../../declarations/interfaces/IContainer.md#instance)

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

#### Implementation of

[`IContainer`](../../declarations/interfaces/IContainer.md).[`instanceIf`](../../declarations/interfaces/IContainer.md#instanceif)

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

#### Implementation of

[`IContainer`](../../declarations/interfaces/IContainer.md).[`isAlias`](../../declarations/interfaces/IContainer.md#isalias)

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

#### Implementation of

[`IContainer`](../../declarations/interfaces/IContainer.md).[`make`](../../declarations/interfaces/IContainer.md#make)

***

### resolve()

```ts
resolve<V>(key, singleton?): V;
```

Resolve a value from the container by its key, binding it if necessary.

#### Type Parameters

##### V

`V` *extends* [`BindingValue`](../../declarations/type-aliases/BindingValue.md)

#### Parameters

##### key

[`BindingKey`](../../declarations/type-aliases/BindingKey.md)

The key to resolve.

##### singleton?

`boolean` = `false`

Whether to bind as a singleton if not already bound.

#### Returns

`V`

The resolved value.

#### Implementation of

[`IContainer`](../../declarations/interfaces/IContainer.md).[`resolve`](../../declarations/interfaces/IContainer.md#resolve)

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

#### Implementation of

[`IContainer`](../../declarations/interfaces/IContainer.md).[`singleton`](../../declarations/interfaces/IContainer.md#singleton)

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

#### Implementation of

[`IContainer`](../../declarations/interfaces/IContainer.md).[`singletonIf`](../../declarations/interfaces/IContainer.md#singletonif)

***

### create()

```ts
static create(): Container;
```

Create a Container.

#### Returns

`Container`

A new Container instance.
