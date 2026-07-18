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

### body

```ts
body: unknown;
```

The body of the HTTP response. Can be of any type, including strings, objects, or buffers.

***

### charset?

```ts
optional charset: string;
```

The character set used for encoding the response body. Defaults to `utf-8` if not specified.

***

### headers

```ts
headers: Map<string, string> | Headers;
```

Headers to include in the HTTP response.
Can be provided as a `Map<string, string>` or `Headers` object.

***

### statusCode

```ts
statusCode: number;
```

The HTTP status code of the response (e.g., `200`, `404`).

***

### statusMessage

```ts
statusMessage: string;
```

The status message accompanying the HTTP status code (e.g., `OK`, `Not Found`).

***

### streamFile()

```ts
streamFile: () => void | Promise<void>;
```

A function to stream a file as the HTTP response.
Can be synchronous or asynchronous.

#### Returns

`void` \| `Promise`\<`void`\>
