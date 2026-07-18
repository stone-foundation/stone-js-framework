# Interface: BinaryFileResponseOptions

Options for creating a BinaryFile HTTP Response.

## Extends

- [`OutgoingHttpResponseOptions`](../../OutgoingHttpResponse/interfaces/OutgoingHttpResponseOptions.md)

## Indexable

```ts
[key: string]: unknown
```

## Properties

### autoEncoding?

```ts
optional autoEncoding: boolean;
```

***

### autoEtag?

```ts
optional autoEtag: boolean;
```

***

### autoLastModified?

```ts
optional autoLastModified: boolean;
```

***

### contentDispositionType?

```ts
optional contentDispositionType: string;
```

***

### file

```ts
file: string | File;
```

***

### headers?

```ts
optional headers: HeadersType;
```

#### Inherited from

[`OutgoingHttpResponseOptions`](../../OutgoingHttpResponse/interfaces/OutgoingHttpResponseOptions.md).[`headers`](../../OutgoingHttpResponse/interfaces/OutgoingHttpResponseOptions.md#headers)
