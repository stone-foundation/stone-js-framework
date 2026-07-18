# Class: SetupError

Custom error for Setup layer operations.

## Extends

- [`RuntimeError`](../../RuntimeError/classes/RuntimeError.md)

## Constructors

### Constructor

```ts
new SetupError(message, options): SetupError;
```

#### Parameters

##### message

`string`

##### options

[`ErrorOptions`](../../../declarations/interfaces/ErrorOptions.md) = `{}`

#### Returns

`SetupError`

#### Overrides

[`RuntimeError`](../../RuntimeError/classes/RuntimeError.md).[`constructor`](../../RuntimeError/classes/RuntimeError.md#constructor)

## Properties

### cause?

```ts
readonly optional cause: Error;
```

#### Inherited from

[`RuntimeError`](../../RuntimeError/classes/RuntimeError.md).[`cause`](../../RuntimeError/classes/RuntimeError.md#cause)

***

### code?

```ts
readonly optional code: string;
```

#### Inherited from

[`RuntimeError`](../../RuntimeError/classes/RuntimeError.md).[`code`](../../RuntimeError/classes/RuntimeError.md#code)

***

### metadata?

```ts
readonly optional metadata: unknown;
```

#### Inherited from

[`RuntimeError`](../../RuntimeError/classes/RuntimeError.md).[`metadata`](../../RuntimeError/classes/RuntimeError.md#metadata)

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

#### Inherited from

[`RuntimeError`](../../RuntimeError/classes/RuntimeError.md).[`toString`](../../RuntimeError/classes/RuntimeError.md#tostring)

***

### create()

```ts
static create<T>(message, options): T;
```

Create a RuntimeError.

#### Type Parameters

##### T

`T` *extends* [`RuntimeError`](../../RuntimeError/classes/RuntimeError.md) = [`RuntimeError`](../../RuntimeError/classes/RuntimeError.md)

#### Parameters

##### message

`string`

##### options

[`ErrorOptions`](../../../declarations/interfaces/ErrorOptions.md) = `{}`

The options to create a RuntimeError.

#### Returns

`T`

A new RuntimeError instance.

#### Inherited from

[`RuntimeError`](../../RuntimeError/classes/RuntimeError.md).[`create`](../../RuntimeError/classes/RuntimeError.md#create)
