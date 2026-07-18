# Interface: StorageStat

Backend-agnostic metadata for a stored file/object.

## Properties

### isDirectory

```ts
isDirectory: boolean;
```

Whether this entry is a directory/prefix.

***

### isFile

```ts
isFile: boolean;
```

Whether this entry is a regular file/object.

***

### lastModified?

```ts
optional lastModified?: number;
```

Last-modified time in epoch milliseconds, if known.

***

### mimeType?

```ts
optional mimeType?: string;
```

Best-effort MIME type, if known.

***

### path

```ts
path: string;
```

The path (relative to the disk root).

***

### size

```ts
size: number;
```

Size in bytes.
