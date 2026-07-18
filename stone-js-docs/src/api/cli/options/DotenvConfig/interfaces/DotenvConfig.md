# Interface: DotenvConfig

Complete configuration for managing environment variables.

## Properties

### options?

```ts
optional options: DotenvOptions;
```

Options for loading and expanding `.env` files.

***

### private?

```ts
optional private: DotenvFiles;
```

Configuration for private `.env` files (not included in the bundle).

***

### public?

```ts
optional public: Record<string, DotenvFiles>;
```

Configuration for public `.env` files (included in the bundle).
