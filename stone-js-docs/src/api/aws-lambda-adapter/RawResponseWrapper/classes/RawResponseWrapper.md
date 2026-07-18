# Class: RawResponseWrapper

Wrapper for generic raw responses.

The `RawResponseWrapper` is responsible for encapsulating a raw response
and returning it in a structure that aligns with the Stone.js framework's requirements.
It implements the `IRawResponseWrapper` interface, ensuring compatibility with the framework.

## Implements

- `IRawResponseWrapper`\<[`RawResponse`](../../declarations/type-aliases/RawResponse.md)\>

## Methods

### respond()

```ts
respond(): RawResponse;
```

Constructs and returns the raw response.

The `respond` method generates and returns the raw response based on
the provided options. The response is returned as-is, allowing for
maximum flexibility in defining its structure.

#### Returns

[`RawResponse`](../../declarations/type-aliases/RawResponse.md)

A `RawResponse` object containing the response options.

#### Example

```typescript
const responseWrapper = RawResponseWrapper.create({ body: 'Hello, world!' });
const response = responseWrapper.respond();
console.log(response); // { body: 'Hello, world!' }
```

#### Implementation of

```ts
IRawResponseWrapper.respond
```

***

### create()

```ts
static create(options): RawResponseWrapper;
```

Factory method to create an instance of `RawResponseWrapper`.

This method initializes the wrapper with a set of partial response options.

#### Parameters

##### options

`Partial`\<`RawResponseOptions`\>

Partial options to configure the raw response.

#### Returns

`RawResponseWrapper`

A new instance of `RawResponseWrapper`.

#### Example

```typescript
const responseWrapper = RawResponseWrapper.create({
  headers: { 'Content-Type': 'application/json' },
  body: { message: 'Success' },
  statusCode: 200,
});

const response = responseWrapper.respond();
console.log(response); // { headers: { 'Content-Type': 'application/json' }, body: { message: 'Success' }, statusCode: 200 }
```
