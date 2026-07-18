# Interface: AwsLambdaHttpEvent

Represents the structure of an AWS Lambda HTTP event.

This interface defines the standard properties of an HTTP event in AWS Lambda,
including headers, query parameters, the request context, and other metadata.

## Extends

- `Record`\<`string`, `unknown`\>

## Indexable

```ts
[key: string]: unknown
```

## Properties

### body?

```ts
optional body: unknown;
```

The body of the HTTP request.

***

### encoding?

```ts
optional encoding: string;
```

The encoding format of the body, such as `base64`.

***

### headers

```ts
headers: Record<string, string>;
```

The headers of the HTTP request as key-value pairs.

***

### httpMethod?

```ts
optional httpMethod: string;
```

The HTTP method of the request (e.g., `GET`, `POST`).

***

### isBase64Encoded?

```ts
optional isBase64Encoded: boolean;
```

Indicates whether the request body is base64-encoded.

***

### path?

```ts
optional path: string;
```

The path of the HTTP request.

***

### queryStringParameters?

```ts
optional queryStringParameters: Record<string, string>;
```

The query string parameters included in the request.

***

### rawPath?

```ts
optional rawPath: string;
```

The raw path of the HTTP request, as sent by the client.

***

### requestContext?

```ts
optional requestContext: object;
```

The context of the request, including identity and HTTP metadata.

#### http?

```ts
optional http: object;
```

##### http.method?

```ts
optional method: string;
```

##### http.sourceIp?

```ts
optional sourceIp: string;
```

#### httpMethod?

```ts
optional httpMethod: string;
```

#### identity?

```ts
optional identity: object;
```

##### identity.sourceIp?

```ts
optional sourceIp: string;
```
