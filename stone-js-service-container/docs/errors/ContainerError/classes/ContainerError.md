# Class: ContainerError

Class representing a ContainerError.

## Author

Mr. Stone <evensstone@gmail.com>

## Extends

- `Error`

## Constructors

### Constructor

```ts
new ContainerError(type, message): ContainerError;
```

Create a ContainerError.

#### Parameters

##### type

`string`

The type of the error.

##### message

[`BindingKey`](../../../declarations/type-aliases/BindingKey.md)

The error message or key related to the error.

#### Returns

`ContainerError`

#### Overrides

```ts
Error.constructor
```

## Properties

### ALIAS\_TYPE

```ts
readonly static ALIAS_TYPE: "alias" = 'alias';
```

Error type indicating an alias conflict.

***

### ALIAS\_UNBOUND\_TYPE

```ts
readonly static ALIAS_UNBOUND_TYPE: "alias_unbound" = 'alias_unbound';
```

Error type indicating an attempt to alias an unbound value.

***

### CANNOT\_RESOLVE\_TYPE

```ts
readonly static CANNOT_RESOLVE_TYPE: "cannot_resolve" = 'cannot_resolve';
```

Error type indicating an error thrown by the resolver function.

***

### CIRCULAR\_DEPENDENCY\_TYPE

```ts
readonly static CIRCULAR_DEPENDENCY_TYPE: "circular_dependency" = 'circular_dependency';
```

Error type indicating a circular dependency.

***

### NOT\_A\_SERVICE\_TYPE

```ts
readonly static NOT_A_SERVICE_TYPE: "not_a_service" = 'not_a_service';
```

Error type indicating that a value is not a service.

***

### RESOLUTION\_TYPE

```ts
readonly static RESOLUTION_TYPE: "resolution" = 'resolution';
```

Error type indicating a resolution failure.

***

### RESOLVER\_TYPE

```ts
readonly static RESOLVER_TYPE: "resolver" = 'resolver';
```

Error type indicating that the resolver is not a function.
