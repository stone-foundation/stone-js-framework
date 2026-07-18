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
optional body?: unknown;
```

The body of the HTTP response. Can be of any type, including strings, objects, or buffers.

***

### cookies?

```ts
optional cookies?: string[];
```

Response cookies as raw `Set-Cookie` strings (used by API Gateway HTTP API v2 / Function URLs).

***

### headers?

```ts
optional headers?: Record<string, string> | Headers;
```

Headers to include in the HTTP response. May be a `Headers` instance (from http-core) or a
plain record; the wrapper normalizes it and lifts out `Set-Cookie`.

***

### isBase64Encoded?

```ts
optional isBase64Encoded?: boolean;
```

The encoding format of the response body, such as `base64`.

***

### multiValueHeaders?

```ts
optional multiValueHeaders?: Record<string, string[]>;
```

Multi-value response headers (used by API Gateway REST v1 / ALB to emit multiple `Set-Cookie`).

***

### statusCode

```ts
statusCode: number;
```

The HTTP status code of the response (e.g., `200`, `404`).

***

### statusMessage?

```ts
optional statusMessage?: string;
```

The status message accompanying the HTTP status code (e.g., `OK`, `Not Found`).

***

### version?

```ts
optional version?: "v1" | "v2" | "alb";
```

The detected trigger family, used to choose the correct multi-cookie response shape.
