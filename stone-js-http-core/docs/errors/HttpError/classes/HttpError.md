# Class: HttpError

Class representing an HttpError.

## Author

Mr. Stone <evensstone@gmail.com>

## Extends

- `RuntimeError`

## Constructors

### Constructor

```ts
new HttpError(
   message, 
   statusCode?, 
   headers?, 
   options?): HttpError;
```

Create an HttpError.

#### Parameters

##### message

`string`

The message to log.

##### statusCode?

`number` = `500`

##### headers?

[`HeadersType`](../../../declarations/type-aliases/HeadersType.md) = `...`

##### options?

`ErrorOptions` = `{}`

The error options.

#### Returns

`HttpError`

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

### headers

```ts
readonly headers: HeadersType;
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

***

### statusCode

```ts
readonly statusCode: number;
```

***

### statusMessage

```ts
readonly statusMessage: string;
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
