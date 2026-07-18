# Interface: MetaViewProvider\<T\>

A registered view provider descriptor.

## Type Parameters

### T

`T` = `unknown`

The provider component/module type.

## Properties

### \_\_viewProvider

```ts
readonly __viewProvider: true;
```

***

### isClass?

```ts
optional isClass?: boolean;
```

***

### isFactory?

```ts
optional isFactory?: boolean;
```

***

### module

```ts
module: T;
```

***

### priority

```ts
priority: number;
```

Composition order; lower wraps the outer layer. Default 10.

***

### props?

```ts
optional props?: Record<string, unknown>;
```

Extra props passed to the provider element.
