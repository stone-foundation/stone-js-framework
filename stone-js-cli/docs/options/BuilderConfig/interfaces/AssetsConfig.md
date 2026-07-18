# Interface: AssetsConfig

Static asset alias configuration.

`dir` is the assets root (relative to the project root). `aliases` maps an import alias
to a subfolder of `dir` (empty string means `dir` itself). Example resolution with
`{ dir: 'assets', aliases: { '@img': 'images' } }`: `@img/logo.png` → `<root>/assets/images/logo.png`.

## Properties

### aliases?

```ts
optional aliases?: Record<string, string>;
```

Map of import alias to subfolder of `dir`.

***

### dir?

```ts
optional dir?: string;
```

The assets root directory, relative to the project root. Default `assets`.
