# Interface: AwsLambdaHttpEvent

Represents the structure of an AWS Lambda HTTP event across every supported trigger:
API Gateway REST (payload v1), API Gateway HTTP API and Lambda Function URLs (payload v2),
and Application Load Balancer (ALB). Every field is optional because each trigger populates a
different subset; use normalizeHttpEvent to reduce it to a canonical shape.

## Extends

- `Record`\<`string`, `unknown`\>

## Indexable

```ts
[key: string]: unknown
```

## Properties

### body?

```ts
optional body?: unknown;
```

The body of the HTTP request.

***

### cookies?

```ts
optional cookies?: string[];
```

Raw cookie strings (v2 / Function URLs).

***

### encoding?

```ts
optional encoding?: string;
```

The encoding format of the body, such as `base64`.

***

### headers?

```ts
optional headers?: Record<string, string> | null;
```

The headers of the HTTP request as key-value pairs (may be null/absent on some triggers).

***

### httpMethod?

```ts
optional httpMethod?: string;
```

The HTTP method of the request (v1/ALB).

***

### isBase64Encoded?

```ts
optional isBase64Encoded?: boolean;
```

Indicates whether the request body is base64-encoded.

***

### multiValueHeaders?

```ts
optional multiValueHeaders?: Record<string, string[]>;
```

Multi-value headers (v1 / ALB with multi-value enabled).

***

### multiValueQueryStringParameters?

```ts
optional multiValueQueryStringParameters?: Record<string, string[]>;
```

The multi-value query string parameters (v1 / ALB with multi-value enabled).

***

### path?

```ts
optional path?: string;
```

The path of the HTTP request (v1/ALB).

***

### queryStringParameters?

```ts
optional queryStringParameters?: Record<string, string> | null;
```

The single-value query string parameters.

***

### rawPath?

```ts
optional rawPath?: string;
```

The raw path of the HTTP request (v2).

***

### rawQueryString?

```ts
optional rawQueryString?: string;
```

The raw query string, without leading `?` (v2).

***

### requestContext?

```ts
optional requestContext?: object;
```

The request context, whose shape varies by trigger.

#### elb?

```ts
optional elb?: unknown;
```

#### http?

```ts
optional http?: object;
```

##### http.method?

```ts
optional method?: string;
```

##### http.path?

```ts
optional path?: string;
```

##### http.sourceIp?

```ts
optional sourceIp?: string;
```

#### httpMethod?

```ts
optional httpMethod?: string;
```

#### identity?

```ts
optional identity?: object;
```

##### identity.sourceIp?

```ts
optional sourceIp?: string;
```

***

### version?

```ts
optional version?: string;
```

Payload format version, e.g. `'1.0'` (REST) or `'2.0'` (HTTP API / Function URL).
