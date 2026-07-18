# Interface: NormalizedHttpEvent

A canonical HTTP request derived from any AWS HTTP Lambda event.

## Properties

### body?

```ts
optional body?: string;
```

The raw request body as delivered by AWS (string or undefined).

***

### cookies

```ts
cookies: string[];
```

Raw cookie strings (e.g. `['a=1', 'b=2']`).

***

### headers

```ts
headers: Record<string, string>;
```

Lower-cased headers; multi-value headers joined with `, `.

***

### isBase64Encoded

```ts
isBase64Encoded: boolean;
```

Whether [body](#body) is base64-encoded.

***

### method

```ts
method: string;
```

The HTTP method (upper-case).

***

### path

```ts
path: string;
```

The request path (no query string).

***

### rawQueryString

```ts
rawQueryString: string;
```

The raw query string (without leading `?`), fidelity-preserving.

***

### sourceIp

```ts
sourceIp: string;
```

The best-effort client source IP.

***

### version

```ts
version: AwsHttpEventVersion;
```

The detected trigger family.
