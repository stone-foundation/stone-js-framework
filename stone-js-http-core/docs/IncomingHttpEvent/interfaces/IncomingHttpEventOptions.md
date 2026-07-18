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
optional body?: Record<string, unknown>;
```

***

### cookies?

```ts
optional cookies?: CookieCollection;
```

***

### files?

```ts
optional files?: Record<string, UploadedFile[]>;
```

***

### headers?

```ts
optional headers?: Headers | Record<string, string>;
```

***

### ip

```ts
ip: string;
```

***

### ips?

```ts
optional ips?: string[];
```

***

### locale?

```ts
optional locale?: string;
```

#### Inherited from

```ts
IncomingEventOptions.locale
```

***

### metadata?

```ts
optional metadata?: Record<string, unknown>;
```

#### Inherited from

```ts
IncomingEventOptions.metadata
```

***

### method?

```ts
optional method?: HttpMethods;
```

***

### protocol?

```ts
optional protocol?: string;
```

***

### queryString?

```ts
optional queryString?: string;
```

***

### source

```ts
source: IncomingEventSource;
```

#### Inherited from

```ts
IncomingEventOptions.source
```

***

### timeStamp?

```ts
optional timeStamp?: number;
```

#### Inherited from

```ts
IncomingEventOptions.timeStamp
```

***

### type?

```ts
optional type?: string;
```

#### Inherited from

```ts
IncomingEventOptions.type
```

***

### url

```ts
url: URL;
```
