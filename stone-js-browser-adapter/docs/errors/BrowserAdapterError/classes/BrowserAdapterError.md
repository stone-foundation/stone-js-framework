# Class: BrowserAdapterError

Custom error for Browser adapter operations.

## Extends

- `IntegrationError`

## Constructors

### Constructor

```ts
new BrowserAdapterError(message, options?): BrowserAdapterError;
```

#### Parameters

##### message

`string`

##### options?

`ErrorOptions`

#### Returns

`BrowserAdapterError`

#### Overrides

```ts
IntegrationError.constructor
```

## Properties

### cause?

```ts
readonly optional cause?: Error;
```

#### Inherited from

```ts
IntegrationError.cause
```

***

### code?

```ts
readonly optional code?: string;
```

#### Inherited from

```ts
IntegrationError.code
```

***

### metadata?

```ts
readonly optional metadata?: unknown;
```

#### Inherited from

```ts
IntegrationError.metadata
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
IntegrationError.toString
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
IntegrationError.create
```
