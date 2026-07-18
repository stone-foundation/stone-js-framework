# Class: LocalFileSystem

Local-disk implementation of the agnostic [FileSystem](../../FileSystem/interfaces/FileSystem.md) contract.

All operations are async (non-blocking) and CONFINED to the configured root directory: any path
that resolves outside the root is rejected, so a caller-supplied path such as `../../etc/passwd`
can never escape the disk. This mirrors how an object store confines access to a bucket, which is
exactly what makes a future `S3FileSystem` a drop-in for the same interface.

## Implements

- [`FileSystem`](../../FileSystem/interfaces/FileSystem.md)

## Constructors

### Constructor

```ts
new LocalFileSystem(options?): LocalFileSystem;
```

Create a LocalFileSystem.

#### Parameters

##### options?

[`FileSystemOptions`](../../FileSystem/interfaces/FileSystemOptions.md) = `{}`

The disk options.

#### Returns

`LocalFileSystem`

## Properties

### name

```ts
readonly name: string;
```

A human-readable disk name (e.g. `'local'`, `'s3'`), used by the StorageManager.

#### Implementation of

[`FileSystem`](../../FileSystem/interfaces/FileSystem.md).[`name`](../../FileSystem/interfaces/FileSystem.md#name)

## Methods

### copy()

```ts
copy(source, destination): Promise<void>;
```

#### Parameters

##### source

`string`

##### destination

`string`

#### Returns

`Promise`\<`void`\>

#### Inherit Doc

#### Implementation of

[`FileSystem`](../../FileSystem/interfaces/FileSystem.md).[`copy`](../../FileSystem/interfaces/FileSystem.md#copy)

***

### delete()

```ts
delete(path): Promise<boolean>;
```

#### Parameters

##### path

`string`

#### Returns

`Promise`\<`boolean`\>

#### Inherit Doc

#### Implementation of

[`FileSystem`](../../FileSystem/interfaces/FileSystem.md).[`delete`](../../FileSystem/interfaces/FileSystem.md#delete)

***

### exists()

```ts
exists(path): Promise<boolean>;
```

#### Parameters

##### path

`string`

#### Returns

`Promise`\<`boolean`\>

#### Inherit Doc

#### Implementation of

[`FileSystem`](../../FileSystem/interfaces/FileSystem.md).[`exists`](../../FileSystem/interfaces/FileSystem.md#exists)

***

### files()

```ts
files(directory?, recursive?): Promise<string[]>;
```

#### Parameters

##### directory?

`string` = `''`

##### recursive?

`boolean` = `false`

#### Returns

`Promise`\<`string`[]\>

#### Inherit Doc

#### Implementation of

[`FileSystem`](../../FileSystem/interfaces/FileSystem.md).[`files`](../../FileSystem/interfaces/FileSystem.md#files)

***

### get()

```ts
get(path): Promise<Buffer<ArrayBufferLike>>;
```

#### Parameters

##### path

`string`

#### Returns

`Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

#### Inherit Doc

#### Implementation of

[`FileSystem`](../../FileSystem/interfaces/FileSystem.md).[`get`](../../FileSystem/interfaces/FileSystem.md#get)

***

### getText()

```ts
getText(path, encoding?): Promise<string>;
```

#### Parameters

##### path

`string`

##### encoding?

`BufferEncoding` = `'utf-8'`

#### Returns

`Promise`\<`string`\>

#### Inherit Doc

#### Implementation of

[`FileSystem`](../../FileSystem/interfaces/FileSystem.md).[`getText`](../../FileSystem/interfaces/FileSystem.md#gettext)

***

### lastModified()

```ts
lastModified(path): Promise<number | undefined>;
```

#### Parameters

##### path

`string`

#### Returns

`Promise`\<`number` \| `undefined`\>

#### Inherit Doc

#### Implementation of

[`FileSystem`](../../FileSystem/interfaces/FileSystem.md).[`lastModified`](../../FileSystem/interfaces/FileSystem.md#lastmodified)

***

### makeDirectory()

```ts
makeDirectory(path): Promise<void>;
```

#### Parameters

##### path

`string`

#### Returns

`Promise`\<`void`\>

#### Inherit Doc

#### Implementation of

[`FileSystem`](../../FileSystem/interfaces/FileSystem.md).[`makeDirectory`](../../FileSystem/interfaces/FileSystem.md#makedirectory)

***

### mimeType()

```ts
mimeType(path): Promise<string | undefined>;
```

#### Parameters

##### path

`string`

#### Returns

`Promise`\<`string` \| `undefined`\>

#### Inherit Doc

#### Implementation of

[`FileSystem`](../../FileSystem/interfaces/FileSystem.md).[`mimeType`](../../FileSystem/interfaces/FileSystem.md#mimetype)

***

### move()

```ts
move(source, destination): Promise<void>;
```

#### Parameters

##### source

`string`

##### destination

`string`

#### Returns

`Promise`\<`void`\>

#### Inherit Doc

#### Implementation of

[`FileSystem`](../../FileSystem/interfaces/FileSystem.md).[`move`](../../FileSystem/interfaces/FileSystem.md#move)

***

### put()

```ts
put(path, content): Promise<void>;
```

#### Parameters

##### path

`string`

##### content

`string` \| `Buffer`\<`ArrayBufferLike`\>

#### Returns

`Promise`\<`void`\>

#### Inherit Doc

#### Implementation of

[`FileSystem`](../../FileSystem/interfaces/FileSystem.md).[`put`](../../FileSystem/interfaces/FileSystem.md#put)

***

### readStream()

```ts
readStream(path): Promise<Readable>;
```

#### Parameters

##### path

`string`

#### Returns

`Promise`\<`Readable`\>

#### Inherit Doc

#### Implementation of

[`FileSystem`](../../FileSystem/interfaces/FileSystem.md).[`readStream`](../../FileSystem/interfaces/FileSystem.md#readstream)

***

### size()

```ts
size(path): Promise<number>;
```

#### Parameters

##### path

`string`

#### Returns

`Promise`\<`number`\>

#### Inherit Doc

#### Implementation of

[`FileSystem`](../../FileSystem/interfaces/FileSystem.md).[`size`](../../FileSystem/interfaces/FileSystem.md#size)

***

### stat()

```ts
stat(path): Promise<StorageStat>;
```

#### Parameters

##### path

`string`

#### Returns

`Promise`\<[`StorageStat`](../../FileSystem/interfaces/StorageStat.md)\>

#### Inherit Doc

#### Implementation of

[`FileSystem`](../../FileSystem/interfaces/FileSystem.md).[`stat`](../../FileSystem/interfaces/FileSystem.md#stat)

***

### url()

```ts
url(path): Promise<string>;
```

#### Parameters

##### path

`string`

#### Returns

`Promise`\<`string`\>

#### Inherit Doc

#### Implementation of

[`FileSystem`](../../FileSystem/interfaces/FileSystem.md).[`url`](../../FileSystem/interfaces/FileSystem.md#url)

***

### writeStream()

```ts
writeStream(path, stream): Promise<void>;
```

#### Parameters

##### path

`string`

##### stream

`Readable`

#### Returns

`Promise`\<`void`\>

#### Inherit Doc

#### Implementation of

[`FileSystem`](../../FileSystem/interfaces/FileSystem.md).[`writeStream`](../../FileSystem/interfaces/FileSystem.md#writestream)

***

### create()

```ts
static create(options?): LocalFileSystem;
```

Create a LocalFileSystem.

#### Parameters

##### options?

[`FileSystemOptions`](../../FileSystem/interfaces/FileSystemOptions.md) = `{}`

The disk options (root defaults to the current working directory).

#### Returns

`LocalFileSystem`

A new LocalFileSystem.
