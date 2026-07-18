# Class: StorageManager

Multi-disk storage registry.

Application code resolves a disk by name (`storage.disk('s3')`) and talks to it through the
agnostic [FileSystem](../../FileSystem/interfaces/FileSystem.md) contract, so the concrete backend is a registration/configuration
detail. A `local` disk rooted at the current working directory is registered by default; an
`S3FileSystem` (or any other driver) is added with [registerFactory](#registerfactory) without touching
consumers.

```ts
const storage = StorageManager.create()
storage.registerFactory('s3', () => S3FileSystem.create({ bucket, region }))
await storage.disk('s3').put('avatars/1.png', bytes)
```

## Constructors

### Constructor

```ts
new StorageManager(defaultDisk?): StorageManager;
```

Create a StorageManager.

#### Parameters

##### defaultDisk?

`string` = `'local'`

The name of the default disk.

#### Returns

`StorageManager`

## Methods

### disk()

```ts
disk(name?): FileSystem;
```

Resolve a disk by name (defaults to the default disk).

#### Parameters

##### name?

`string`

The disk name.

#### Returns

[`FileSystem`](../../FileSystem/interfaces/FileSystem.md)

The resolved [FileSystem](../../FileSystem/interfaces/FileSystem.md) driver.

#### Throws

FilesystemError if no disk/factory is registered under the name.

***

### has()

```ts
has(name): boolean;
```

Whether a disk (instance or factory) is registered under the name.

#### Parameters

##### name

`string`

The disk name.

#### Returns

`boolean`

True if the disk is registered.

***

### register()

```ts
register(name, driver): this;
```

Register a ready-made disk driver instance.

#### Parameters

##### name

`string`

The disk name.

##### driver

[`FileSystem`](../../FileSystem/interfaces/FileSystem.md)

The driver instance.

#### Returns

`this`

This manager for chaining.

***

### registerFactory()

```ts
registerFactory(name, factory): this;
```

Register a lazy factory for a disk (the driver is built on first access).

#### Parameters

##### name

`string`

The disk name.

##### factory

[`FileSystemFactory`](../type-aliases/FileSystemFactory.md)

The driver factory.

#### Returns

`this`

This manager for chaining.

***

### setDefaultDisk()

```ts
setDefaultDisk(name): this;
```

Set the default disk name.

#### Parameters

##### name

`string`

The disk name.

#### Returns

`this`

This manager for chaining.

***

### create()

```ts
static create(defaultDisk?): StorageManager;
```

Create a StorageManager.

#### Parameters

##### defaultDisk?

`string` = `'local'`

The name of the default disk.

#### Returns

`StorageManager`

A new StorageManager with a `local` disk registered.
