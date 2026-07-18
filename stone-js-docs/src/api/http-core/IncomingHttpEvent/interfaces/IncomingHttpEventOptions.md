# Interface: IncomingHttpEventOptions

IncomingHttpEventOptions interface.

## Extends

- `IncomingEventOptions`

## Indexable

```ts
[key: string]: unknown
```

## Properties

### body?

```ts
optional body: Record<string, unknown>;
```

***

### cookies?

```ts
optional cookies: CookieCollection;
```

***

### files?

```ts
optional files: Record<string, UploadedFile[]>;
```

***

### headers?

```ts
optional headers: Headers | Record<string, string>;
```

***

### ip

```ts
ip: string;
```

***

### ips?

```ts
optional ips: string[];
```

***

### method?

```ts
optional method: HttpMethods;
```

***

### protocol?

```ts
optional protocol: string;
```

***

### queryString?

```ts
optional queryString: string;
```

***

### url

```ts
url: URL;
```
