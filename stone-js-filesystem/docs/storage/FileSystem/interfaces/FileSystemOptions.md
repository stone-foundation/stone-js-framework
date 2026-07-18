# Interface: FileSystemOptions

Options shared by storage drivers.

## Properties

### baseUrl?

```ts
optional baseUrl?: string;
```

An optional base URL used by [FileSystem.url](FileSystem.md#url) for public assets.

***

### name?

```ts
optional name?: string;
```

The disk name.

***

### root?

```ts
optional root?: string;
```

The root directory (local) or bucket/prefix (object store) all paths are resolved against.
