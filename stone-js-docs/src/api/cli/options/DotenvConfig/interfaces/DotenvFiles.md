# Interface: DotenvFiles

Specifies `.env` file paths and options.

## Properties

### default?

```ts
optional default: boolean;
```

Whether to use this configuration as the default.

***

### override?

```ts
optional override: boolean;
```

Whether to override existing values.

***

### path

```ts
path: string | string[];
```

Paths to `.env` files.
