# Class: ServerResponseWrapper

A wrapper for the Node.js HTTP `ServerResponse` to implement the `IRawResponseWrapper` interface.

This class provides methods for configuring and sending HTTP responses in a consistent and
flexible manner. It supports setting status codes, headers, streaming files, or sending raw body content.

## Implements

- `IRawResponseWrapper`\<`ServerResponse`\>

## Properties

### options

```ts
readonly options: Partial<RawHttpResponseOptions> = {};
```

Partial configuration for customizing the response.

***

### response

```ts
readonly response: ServerResponse;
```

The Node.js `ServerResponse` object to be wrapped.

## Methods

### respond()

```ts
respond(): Promise<ServerResponse<IncomingMessage>>;
```

Sends the HTTP response based on the configured options.

This method:
- Sets the `statusCode` and `statusMessage` if provided.
- Configures response `headers` if specified.
- Streams a file if `streamFile` is defined.
- Sends raw content if `body` is provided.

#### Returns

`Promise`\<`ServerResponse`\<`IncomingMessage`\>\>

A promise that resolves to the HTTP status code of the response.

#### Throws

An error if the response cannot be sent due to an issue in `streamFile`.

#### Implementation of

```ts
IRawResponseWrapper.respond
```

***

### create()

```ts
static create(response, options): ServerResponseWrapper;
```

Creates a new `ServerResponseWrapper` instance.

#### Parameters

##### response

`ServerResponse`

The Node.js `ServerResponse` object to be wrapped.

##### options

`Partial`\<[`RawHttpResponseOptions`](../../declarations/interfaces/RawHttpResponseOptions.md)\> = `{}`

Partial configuration for customizing the response.

#### Returns

`ServerResponseWrapper`

A new instance of `ServerResponseWrapper`.
