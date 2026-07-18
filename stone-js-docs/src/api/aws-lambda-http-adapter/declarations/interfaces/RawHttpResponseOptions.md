# Interface: RawHttpResponseOptions

Represents options for configuring a raw HTTP response.

Extends the `RawResponseOptions` interface to include additional properties
for managing response content, headers, status codes, and streaming files.

## Extends

- `RawResponseOptions`

## Indexable

```ts
[k: string | number | symbol]: unknown
```

## Properties

### body?

```ts
optional body: unknown;
```

The body of the HTTP response. Can be of any type, including strings, objects, or buffers.

***

### headers?

```ts
optional headers: Record<string, string>;
```

Headers to include in the HTTP response.
Can be provided as key-value pairs.

***

### isBase64Encoded?

```ts
optional isBase64Encoded: boolean;
```

The encoding format of the response body, such as `base64`.

***

### statusCode

```ts
statusCode: number;
```

The HTTP status code of the response (e.g., `200`, `404`).

***

### statusMessage?

```ts
optional statusMessage: string;
```

The status message accompanying the HTTP status code (e.g., `OK`, `Not Found`).
