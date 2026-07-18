# Class: File

Class representing a File.

## Author

Mr. Stone <evensstone@gmail.com>

## Extended by

- [`UploadedFile`](../../UploadedFile/classes/UploadedFile.md)

## Constructors

### Constructor

```ts
protected new File(path, checkPath): File;
```

Create a File.

#### Parameters

##### path

`string`

The file path.

##### checkPath

`boolean` = `true`

Whether to check if the file path is valid.

#### Returns

`File`

## Methods

### edit()

```ts
edit(callback): this;
```

Edit file content.

#### Parameters

##### callback

(`content`) => `string`

The callback function to modify the file content.

#### Returns

`this`

The current File instance.

***

### exists()

```ts
exists(): boolean;
```

Check if the file exists.

#### Returns

`boolean`

True if the file exists, otherwise false.

***

### getAbsolutePath()

```ts
getAbsolutePath(root): string;
```

Get the absolute file path.

#### Parameters

##### root

`string` = `''`

The root directory to resolve from.

#### Returns

`string`

The absolute file path.

***

### getATime()

```ts
getATime(): undefined | number | bigint;
```

Get the last access time of the file.

#### Returns

`undefined` \| `number` \| `bigint`

The last access time in milliseconds.

***

### getBasename()

```ts
getBasename(exclude): string;
```

Get the basename of the file.

#### Parameters

##### exclude

`string` = `''`

The file extension to exclude from the basename.

#### Returns

`string`

The basename of the file.

***

### getContent()

```ts
getContent(encoding): string;
```

Get file content.

#### Parameters

##### encoding

`BufferEncoding` = `'utf-8'`

#### Returns

`string`

The content of the file as a string.

***

### getCTime()

```ts
getCTime(): undefined | number | bigint;
```

Get the created time of the file.

#### Returns

`undefined` \| `number` \| `bigint`

The created time in milliseconds.

***

### getDirname()

```ts
getDirname(): string;
```

Get the directory name of the file.

#### Returns

`string`

The directory name.

***

### getEncodedAbsolutePath()

```ts
getEncodedAbsolutePath(root): string;
```

Get the encoded absolute file path.

#### Parameters

##### root

`string` = `''`

The root directory to resolve from.

#### Returns

`string`

The encoded absolute file path.

***

### getEncodedPath()

```ts
getEncodedPath(): string;
```

Get the encoded file path.

#### Returns

`string`

The encoded file path.

***

### getExtension()

```ts
getExtension(): string;
```

Get the file extension.

#### Returns

`string`

The file extension.

***

### getFilename()

```ts
getFilename(): string;
```

Get the filename of the file.

#### Returns

`string`

The filename of the file.

***

### getHashedContent()

```ts
getHashedContent(algo): string;
```

Get the hashed content of the file.

#### Parameters

##### algo

`string` = `'sha256'`

The hashing algorithm to use.

#### Returns

`string`

The hashed content of the file as a hex string.

***

### getMimeType()

Get the MIME type of the file.

#### Param

A fallback MIME type if detection fails.

#### Call Signature

```ts
getMimeType(): undefined | string;
```

Get the MIME type of the file.

##### Returns

`undefined` \| `string`

The MIME type of the file.

##### Param

A fallback MIME type if detection fails.

#### Call Signature

```ts
getMimeType(fallback): string;
```

Get the MIME type of the file.

##### Parameters

###### fallback

`string`

A fallback MIME type if detection fails.

##### Returns

`string`

The MIME type of the file.

##### Param

A fallback MIME type if detection fails.

***

### getMTime()

```ts
getMTime(): undefined | number | bigint;
```

Get the last modified time of the file.

#### Returns

`undefined` \| `number` \| `bigint`

The last modified time in milliseconds.

***

### getName()

```ts
getName(): string;
```

Get the name of the file without extension.

#### Returns

`string`

The name of the file.

***

### getPath()

```ts
getPath(): string;
```

Get the file path.

#### Returns

`string`

The file path.

***

### getSize()

```ts
getSize(formatted): undefined | string | number | bigint;
```

Get file size.

#### Parameters

##### formatted

`boolean` = `false`

Whether to return the file size as a formatted string.

#### Returns

`undefined` \| `string` \| `number` \| `bigint`

The file size as a string or number.

***

### isAbsolute()

```ts
isAbsolute(): boolean;
```

Check if the file path is absolute.

#### Returns

`boolean`

True if the file path is absolute, otherwise false.

***

### isCompressed()

```ts
isCompressed(extensions): boolean;
```

Check if the file is compressed.

#### Parameters

##### extensions

`string`[] = `...`

#### Returns

`boolean`

True if the file is compressed, otherwise false.

***

### isDir()

```ts
isDir(): boolean;
```

Check if the file is a directory.

#### Returns

`boolean`

True if the file is a directory, otherwise false.

***

### isExecutable()

```ts
isExecutable(): boolean;
```

Check if the file is executable.

#### Returns

`boolean`

True if the file is executable, otherwise false.

***

### isFile()

```ts
isFile(): boolean;
```

Check if the file is a regular file.

#### Returns

`boolean`

True if the file is a regular file, otherwise false.

***

### isLink()

```ts
isLink(): boolean;
```

Check if the file is a symbolic link.

#### Returns

`boolean`

True if the file is a symbolic link, otherwise false.

***

### isPathPrefix()

```ts
isPathPrefix(prefix): boolean;
```

Check if the file path starts with a provided prefix.

#### Parameters

##### prefix

`string`

#### Returns

`boolean`

True if the file path starts with the provided prefix, otherwise false.

***

### isReadable()

```ts
isReadable(): boolean;
```

Check if the file is readable.

#### Returns

`boolean`

True if the file is readable, otherwise false.

***

### isWritable()

```ts
isWritable(): boolean;
```

Check if the file is writable.

#### Returns

`boolean`

True if the file is writable, otherwise false.

***

### move()

```ts
move(directory, name?): File;
```

Move file to a new directory.

#### Parameters

##### directory

`string`

The target directory.

##### name?

`string`

The new name for the file.

#### Returns

`File`

The new File instance representing the moved file.

#### Throws

FileError if the file could not be moved.

***

### remove()

```ts
remove(force): this;
```

Remove file.

#### Parameters

##### force

`boolean` = `false`

Whether to forcefully remove the file.

#### Returns

`this`

The current File instance.

***

### write()

```ts
write(content): this;
```

Write content to file.

#### Parameters

##### content

`string`

The content to write to the file.

#### Returns

`this`

The current File instance.

***

### create()

```ts
static create(path, checkPath): File;
```

Create a File.

#### Parameters

##### path

`string`

The file path.

##### checkPath

`boolean` = `true`

Whether to check if the file path is valid.

#### Returns

`File`

A new File instance.
