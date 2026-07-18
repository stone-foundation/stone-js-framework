# Class: UploadedFile

Class representing an UploadedFile.

## Author

Mr. Stone <evensstone@gmail.com>

## Extends

- [`File`](../../File/classes/File.md)

## Constructors

### Constructor

```ts
new UploadedFile(
   path, 
   originalName, 
   mimeType?, 
   checkPath?): UploadedFile;
```

Create an UploadedFile.

#### Parameters

##### path

`string`

The file path.

##### originalName

`string`

The original name of the uploaded file.

##### mimeType?

`string`

The MIME type of the file.

##### checkPath?

`boolean` = `true`

#### Returns

`UploadedFile`

#### Overrides

[`File`](../../File/classes/File.md).[`constructor`](../../File/classes/File.md#constructor)

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

#### Inherited from

[`File`](../../File/classes/File.md).[`edit`](../../File/classes/File.md#edit)

***

### exists()

```ts
exists(): boolean;
```

Check if the file exists.

#### Returns

`boolean`

True if the file exists, otherwise false.

#### Inherited from

[`File`](../../File/classes/File.md).[`exists`](../../File/classes/File.md#exists)

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

#### Inherited from

[`File`](../../File/classes/File.md).[`getAbsolutePath`](../../File/classes/File.md#getabsolutepath)

***

### getATime()

```ts
getATime(): undefined | number | bigint;
```

Get the last access time of the file.

#### Returns

`undefined` \| `number` \| `bigint`

The last access time in milliseconds.

#### Inherited from

[`File`](../../File/classes/File.md).[`getATime`](../../File/classes/File.md#getatime)

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

#### Inherited from

[`File`](../../File/classes/File.md).[`getBasename`](../../File/classes/File.md#getbasename)

***

### getClientMimeType()

```ts
getClientMimeType(): string;
```

Get the MIME type of the uploaded file.

#### Returns

`string`

The MIME type of the file.

***

### getClientOriginalExtension()

```ts
getClientOriginalExtension(): string;
```

Get the original file extension of the uploaded file.

#### Returns

`string`

The original file extension.

***

### getClientOriginalName()

```ts
getClientOriginalName(): string;
```

Get the original name of the uploaded file.

#### Returns

`string`

The original name of the file.

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

#### Inherited from

[`File`](../../File/classes/File.md).[`getContent`](../../File/classes/File.md#getcontent)

***

### getCTime()

```ts
getCTime(): undefined | number | bigint;
```

Get the created time of the file.

#### Returns

`undefined` \| `number` \| `bigint`

The created time in milliseconds.

#### Inherited from

[`File`](../../File/classes/File.md).[`getCTime`](../../File/classes/File.md#getctime)

***

### getDirname()

```ts
getDirname(): string;
```

Get the directory name of the file.

#### Returns

`string`

The directory name.

#### Inherited from

[`File`](../../File/classes/File.md).[`getDirname`](../../File/classes/File.md#getdirname)

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

#### Inherited from

[`File`](../../File/classes/File.md).[`getEncodedAbsolutePath`](../../File/classes/File.md#getencodedabsolutepath)

***

### getEncodedPath()

```ts
getEncodedPath(): string;
```

Get the encoded file path.

#### Returns

`string`

The encoded file path.

#### Inherited from

[`File`](../../File/classes/File.md).[`getEncodedPath`](../../File/classes/File.md#getencodedpath)

***

### getExtension()

```ts
getExtension(): string;
```

Get the file extension.

#### Returns

`string`

The file extension.

#### Inherited from

[`File`](../../File/classes/File.md).[`getExtension`](../../File/classes/File.md#getextension)

***

### getFilename()

```ts
getFilename(): string;
```

Get the filename of the file.

#### Returns

`string`

The filename of the file.

#### Inherited from

[`File`](../../File/classes/File.md).[`getFilename`](../../File/classes/File.md#getfilename)

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

#### Inherited from

[`File`](../../File/classes/File.md).[`getHashedContent`](../../File/classes/File.md#gethashedcontent)

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

##### Inherited from

[`File`](../../File/classes/File.md).[`getMimeType`](../../File/classes/File.md#getmimetype)

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

##### Inherited from

[`File`](../../File/classes/File.md).[`getMimeType`](../../File/classes/File.md#getmimetype)

***

### getMTime()

```ts
getMTime(): undefined | number | bigint;
```

Get the last modified time of the file.

#### Returns

`undefined` \| `number` \| `bigint`

The last modified time in milliseconds.

#### Inherited from

[`File`](../../File/classes/File.md).[`getMTime`](../../File/classes/File.md#getmtime)

***

### getName()

```ts
getName(): string;
```

Get the name of the file without extension.

#### Returns

`string`

The name of the file.

#### Inherited from

[`File`](../../File/classes/File.md).[`getName`](../../File/classes/File.md#getname)

***

### getPath()

```ts
getPath(): string;
```

Get the file path.

#### Returns

`string`

The file path.

#### Inherited from

[`File`](../../File/classes/File.md).[`getPath`](../../File/classes/File.md#getpath)

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

#### Inherited from

[`File`](../../File/classes/File.md).[`getSize`](../../File/classes/File.md#getsize)

***

### guessClientExtension()

```ts
guessClientExtension(): undefined | string;
```

Guess the client file extension based on the MIME type.

#### Returns

`undefined` \| `string`

The guessed file extension.

***

### isAbsolute()

```ts
isAbsolute(): boolean;
```

Check if the file path is absolute.

#### Returns

`boolean`

True if the file path is absolute, otherwise false.

#### Inherited from

[`File`](../../File/classes/File.md).[`isAbsolute`](../../File/classes/File.md#isabsolute)

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

#### Inherited from

[`File`](../../File/classes/File.md).[`isCompressed`](../../File/classes/File.md#iscompressed)

***

### isDir()

```ts
isDir(): boolean;
```

Check if the file is a directory.

#### Returns

`boolean`

True if the file is a directory, otherwise false.

#### Inherited from

[`File`](../../File/classes/File.md).[`isDir`](../../File/classes/File.md#isdir)

***

### isExecutable()

```ts
isExecutable(): boolean;
```

Check if the file is executable.

#### Returns

`boolean`

True if the file is executable, otherwise false.

#### Inherited from

[`File`](../../File/classes/File.md).[`isExecutable`](../../File/classes/File.md#isexecutable)

***

### isFile()

```ts
isFile(): boolean;
```

Check if the file is a regular file.

#### Returns

`boolean`

True if the file is a regular file, otherwise false.

#### Inherited from

[`File`](../../File/classes/File.md).[`isFile`](../../File/classes/File.md#isfile)

***

### isLink()

```ts
isLink(): boolean;
```

Check if the file is a symbolic link.

#### Returns

`boolean`

True if the file is a symbolic link, otherwise false.

#### Inherited from

[`File`](../../File/classes/File.md).[`isLink`](../../File/classes/File.md#islink)

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

#### Inherited from

[`File`](../../File/classes/File.md).[`isPathPrefix`](../../File/classes/File.md#ispathprefix)

***

### isReadable()

```ts
isReadable(): boolean;
```

Check if the file is readable.

#### Returns

`boolean`

True if the file is readable, otherwise false.

#### Inherited from

[`File`](../../File/classes/File.md).[`isReadable`](../../File/classes/File.md#isreadable)

***

### isValid()

```ts
isValid(): boolean;
```

Check if the uploaded file is valid.

#### Returns

`boolean`

True if the file exists, otherwise false.

***

### isWritable()

```ts
isWritable(): boolean;
```

Check if the file is writable.

#### Returns

`boolean`

True if the file is writable, otherwise false.

#### Inherited from

[`File`](../../File/classes/File.md).[`isWritable`](../../File/classes/File.md#iswritable)

***

### move()

```ts
move(directory, name?): this;
```

Move the uploaded file to a new directory.

#### Parameters

##### directory

`string`

The target directory.

##### name?

`string`

The new name for the file.

#### Returns

`this`

The current UploadedFile instance.

#### Throws

FileError if the file is not valid.

#### Overrides

[`File`](../../File/classes/File.md).[`move`](../../File/classes/File.md#move)

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

#### Inherited from

[`File`](../../File/classes/File.md).[`remove`](../../File/classes/File.md#remove)

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

#### Inherited from

[`File`](../../File/classes/File.md).[`write`](../../File/classes/File.md#write)

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

[`File`](../../File/classes/File.md)

A new File instance.

#### Inherited from

[`File`](../../File/classes/File.md).[`create`](../../File/classes/File.md#create)

***

### createFile()

```ts
static createFile(
   path, 
   originalName, 
   mimeType?, 
   checkPath?): UploadedFile;
```

Create an UploadedFile.

#### Parameters

##### path

`string`

The file path.

##### originalName

`string`

The original name of the uploaded file.

##### mimeType?

`string`

The MIME type of the file.

##### checkPath?

`boolean` = `true`

#### Returns

`UploadedFile`

A new UploadedFile instance.
