# Interface: FileSystem

Agnostic storage-driver contract for Stone.js.

This is the abstraction that makes the filesystem layer backend-independent: the local disk
(LocalFileSystem) implements it today, and a future `S3FileSystem` (or GCS, Azure Blob,
R2, in-memory…) implements the exact same interface. Application/domain code depends only on
`FileSystem`, never on `node:fs`, so switching or mixing backends is a configuration concern
(see StorageManager), not a code change.

Every operation is **async** — object stores are inherently network-bound, and even the local
driver uses non-blocking I/O so a file operation never stalls the event loop. Paths are always
relative to the driver's root (its "disk"/"bucket"); a driver MUST confine access to that root.

## Properties

### copy

```ts
copy: (source, destination) => Promise<void>;
```

Copy `source` to `destination` within the disk.

#### Parameters

##### source

`string`

##### destination

`string`

#### Returns

`Promise`\<`void`\>

***

### delete

```ts
delete: (path) => Promise<boolean>;
```

Delete `path`. Resolves to whether something was actually deleted.

#### Parameters

##### path

`string`

#### Returns

`Promise`\<`boolean`\>

***

### exists

```ts
exists: (path) => Promise<boolean>;
```

Whether a file (or object) exists at `path`.

#### Parameters

##### path

`string`

#### Returns

`Promise`\<`boolean`\>

***

### files

```ts
files: (directory?, recursive?) => Promise<string[]>;
```

List the file paths under `directory` (relative to the root), optionally recursively.

#### Parameters

##### directory?

`string`

##### recursive?

`boolean`

#### Returns

`Promise`\<`string`[]\>

***

### get

```ts
get: (path) => Promise<Buffer<ArrayBufferLike>>;
```

Read the raw bytes at `path`.

#### Parameters

##### path

`string`

#### Returns

`Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

***

### getText

```ts
getText: (path, encoding?) => Promise<string>;
```

Read the content at `path` decoded as text.

#### Parameters

##### path

`string`

##### encoding?

`BufferEncoding`

#### Returns

`Promise`\<`string`\>

***

### lastModified

```ts
lastModified: (path) => Promise<number | undefined>;
```

The last-modified time (epoch ms) of `path`, if known.

#### Parameters

##### path

`string`

#### Returns

`Promise`\<`number` \| `undefined`\>

***

### makeDirectory

```ts
makeDirectory: (path) => Promise<void>;
```

Ensure a directory/prefix exists.

#### Parameters

##### path

`string`

#### Returns

`Promise`\<`void`\>

***

### mimeType

```ts
mimeType: (path) => Promise<string | undefined>;
```

The best-effort MIME type of `path`, if known.

#### Parameters

##### path

`string`

#### Returns

`Promise`\<`string` \| `undefined`\>

***

### move

```ts
move: (source, destination) => Promise<void>;
```

Move/rename `source` to `destination` within the disk.

#### Parameters

##### source

`string`

##### destination

`string`

#### Returns

`Promise`\<`void`\>

***

### name

```ts
readonly name: string;
```

A human-readable disk name (e.g. `'local'`, `'s3'`), used by the StorageManager.

***

### put

```ts
put: (path, content) => Promise<void>;
```

Write `content` to `path`, creating parent directories/prefixes as needed (overwrites).

#### Parameters

##### path

`string`

##### content

`string` \| `Buffer`\<`ArrayBufferLike`\>

#### Returns

`Promise`\<`void`\>

***

### readStream

```ts
readStream: (path) => Promise<Readable>;
```

Open a readable stream for `path` (streaming large objects without buffering).

#### Parameters

##### path

`string`

#### Returns

`Promise`\<`Readable`\>

***

### size

```ts
size: (path) => Promise<number>;
```

The size in bytes of `path`.

#### Parameters

##### path

`string`

#### Returns

`Promise`\<`number`\>

***

### stat

```ts
stat: (path) => Promise<StorageStat>;
```

Full metadata for `path`.

#### Parameters

##### path

`string`

#### Returns

`Promise`\<[`StorageStat`](StorageStat.md)\>

***

### url

```ts
url: (path) => Promise<string>;
```

A URL for `path` (a `file://` URL locally; a public/presigned URL for object stores).

#### Parameters

##### path

`string`

#### Returns

`Promise`\<`string`\>

***

### writeStream

```ts
writeStream: (path, stream) => Promise<void>;
```

Write a readable stream to `path`.

#### Parameters

##### path

`string`

##### stream

`Readable`

#### Returns

`Promise`\<`void`\>
