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
   statusCode, 
   headers, 
   options): HttpError;
```

Create an HttpError.

#### Parameters

##### message

`string`

The message to log.

##### statusCode

`number` = `500`

##### headers

[`HeadersType`](../../../declarations/type-aliases/HeadersType.md) = `...`

##### options

`ErrorOptions` = `{}`

The error options.

#### Returns

`HttpError`

#### Overrides

```ts
RuntimeError.constructor
```

## Properties

### headers

```ts
readonly headers: HeadersType;
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
