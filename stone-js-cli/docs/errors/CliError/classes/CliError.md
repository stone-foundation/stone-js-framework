# Class: CliError

Represents an error specific to the Stone CLI.

Extends `RuntimeError` to provide a custom error type for handling CLI-related issues.

## Extends

- `RuntimeError`

## Constructors

### Constructor

```ts
new CliError(message, options?): CliError;
```

Creates a new instance of `CliError`.

#### Parameters

##### message

`string`

The error message describing the issue.

##### options?

`ErrorOptions`

Optional additional error options.

#### Returns

`CliError`

#### Overrides

```ts
RuntimeError.constructor
```

## Properties

### cause?

```ts
readonly optional cause?: Error;
```

#### Inherited from

```ts
RuntimeError.cause
```

***

### code?

```ts
readonly optional code?: string;
```

#### Inherited from

```ts
RuntimeError.code
```

***

### metadata?

```ts
readonly optional metadata?: unknown;
```

#### Inherited from

```ts
RuntimeError.metadata
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
RuntimeError.toString
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
RuntimeError.create
```
