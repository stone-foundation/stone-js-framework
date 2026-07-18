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

`BindingKey`

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

`V` *extends* `BindingValue`

#### Parameters

##### name

`BindingKey`

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

`V` *extends* `BindingValue`

#### Parameters

##### key

`BindingKey`

##### resolver

`Resolver`\<`V`\>

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

`V` *extends* `BindingValue`

#### Parameters

##### key

`BindingKey`

##### resolver

`Resolver`\<`V`\>

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

`BindingKey`

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

`V` *extends* `BindingValue`

#### Parameters

##### key

`BindingKey`

#### Returns

() => `V`

***

### getAliases

```ts
getAliases: () => Map<string, BindingKey>;
```

Retrieve the value of the aliases property.

#### Returns

`Map`\<`string`, `BindingKey`\>

***

### getAliasKey

```ts
getAliasKey: (alias) => BindingKey | undefined;
```

Get a binding key by its alias.

#### Parameters

##### alias

`BindingKey`

#### Returns

`BindingKey` \| `undefined`

***

### getBindings

```ts
getBindings: () => Map<BindingKey, IBinding<BindingValue>>;
```

Retrieve the value of the bindings property.

#### Returns

`Map`\<`BindingKey`, `IBinding`\<`BindingValue`\>\>

***

### has

```ts
has: (key) => boolean;
```

Check if a value is already bound in the container by its key.

#### Parameters

##### key

`BindingKey`

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

`BindingKey`

##### value

`BindingValue`

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

`BindingKey`

##### value

`BindingValue`

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

`BindingKey`

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

`V` *extends* `BindingValue`

#### Parameters

##### key

`BindingKey`

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

`V` *extends* `BindingValue`

#### Parameters

##### key

`BindingKey`

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

`V` *extends* `BindingValue`

#### Parameters

##### key

`BindingKey`

##### resolver

`Resolver`\<`V`\>

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

`V` *extends* `BindingValue`

#### Parameters

##### key

`BindingKey`

##### resolver

`Resolver`\<`V`\>

#### Returns

`this`
