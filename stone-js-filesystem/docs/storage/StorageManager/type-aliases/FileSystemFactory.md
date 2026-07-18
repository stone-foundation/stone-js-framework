# Type Alias: FileSystemFactory

```ts
type FileSystemFactory = () => FileSystem;
```

A factory that lazily builds a [FileSystem](../../FileSystem/interfaces/FileSystem.md) driver (so a disk is only constructed when
first used — e.g. an S3 client is not created until the `s3` disk is accessed).

## Returns

[`FileSystem`](../../FileSystem/interfaces/FileSystem.md)
