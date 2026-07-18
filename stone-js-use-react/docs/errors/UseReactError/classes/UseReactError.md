# Class: UseReactError

Custom error for react operations.

## Extends

- `InitializationError`

## Constructors

### Constructor

```ts
new UseReactError(message, options?): UseReactError;
```

#### Parameters

##### message

`string`

##### options?

`ErrorOptions`

#### Returns

`UseReactError`

#### Overrides

```ts
InitializationError.constructor
```

## Properties

### cause?

```ts
readonly optional cause?: Error;
```

#### Inherited from

```ts
InitializationError.cause
```

***

### code?

```ts
readonly optional code?: string;
```

#### Inherited from

```ts
InitializationError.code
```

***

### metadata?

```ts
readonly optional metadata?: unknown;
```

#### Inherited from

```ts
InitializationError.metadata
```

## Methods

### toString()

```ts
toString(multiline?): string;
```

Converts the error to a formatted string representation.

#### Parameters

##### multiline?

`boolean`

Determine if output value must be multiline or not.

#### Returns

`string`

A formatted error string.

#### Inherited from

```ts
InitializationError.toString
```

***

### create()

```ts
static create<T>(message, options?): T;
```

Create a RuntimeError.

#### Type Parameters

##### T

`T` *extends* `RuntimeError` = `RuntimeError`

#### Parameters

##### message

`string`

##### options?

`ErrorOptions`

The options to create a RuntimeError.

#### Returns

`T`

A new RuntimeError instance.

#### Inherited from

```ts
InitializationError.create
```
