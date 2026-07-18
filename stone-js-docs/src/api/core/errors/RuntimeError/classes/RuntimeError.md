# Class: RuntimeError

Class representing a RuntimeError.

## Author

Mr. Stone <evensstone@gmail.com>

## Extends

- `Error`

## Extended by

- [`InitializationError`](../../InitializationError/classes/InitializationError.md)
- [`IntegrationError`](../../IntegrationError/classes/IntegrationError.md)
- [`SetupError`](../../SetupError/classes/SetupError.md)

## Constructors

### Constructor

```ts
new RuntimeError(message, options): RuntimeError;
```

Create a RuntimeError.

#### Parameters

##### message

`string`

The message to log.

##### options

[`ErrorOptions`](../../../declarations/interfaces/ErrorOptions.md) = `{}`

The error options.

#### Returns

`RuntimeError`

#### Overrides

```ts
Error.constructor
```

## Properties

### cause?

```ts
readonly optional cause: Error;
```

#### Overrides

```ts
Error.cause
```

***

### code?

```ts
readonly optional code: string;
```

***

### metadata?

```ts
readonly optional metadata: unknown;
```

## Methods

### toString()

```ts
toString(multiline): string;
```

Converts the error to a formatted string representation.

#### Parameters

##### multiline

`boolean` = `false`

Determine if output value must be multiline or not.

#### Returns

`string`

A formatted error string.

***

### create()

```ts
static create<T>(message, options): T;
```

Create a RuntimeError.

#### Type Parameters

##### T

`T` *extends* `RuntimeError` = `RuntimeError`

#### Parameters

##### message

`string`

##### options

[`ErrorOptions`](../../../declarations/interfaces/ErrorOptions.md) = `{}`

The options to create a RuntimeError.

#### Returns

`T`

A new RuntimeError instance.
