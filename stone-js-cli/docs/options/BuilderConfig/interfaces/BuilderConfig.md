# Interface: BuilderConfig

Configuration for building the Stone.js application.

## Properties

### assets?

```ts
optional assets?: AssetsConfig;
```

Static asset import aliases for components (client and SSR).

Lets components import assets with short, stable aliases instead of brittle relative
paths, e.g. `import logo from '@img/logo.png'`. Each alias resolves to a subfolder of
`assets.dir` under the project root. Applied to dev, build, client and SSR via Vite's
`resolve.alias`; user `builder.vite.resolve.alias` still wins.

***

### browser?

```ts
optional browser?: object;
```

The browser configuration for the application.

#### excludedModules?

```ts
optional excludedModules?: string[];
```

Modules to be removed from the browser build.

***

### dotenv?

```ts
optional dotenv?: Partial<DotenvConfig>;
```

Environment variable management configuration.

***

### imperative?

```ts
optional imperative?: boolean;
```

Whether the application is using imperative programming style.

***

### input?

```ts
optional input?: InputConfig;
```

Module autoloading configuration.

***

### language?

```ts
optional language?: "typescript" | "javascript";
```

The language used in the application.

***

### lazy?

```ts
optional lazy?: boolean;
```

Whether the application is using lazy loading for pages, error pages and layouts.

***

### output?

```ts
optional output?: string;
```

The output file path for the production build.

***

### public?

```ts
optional public?: string;
```

The public directory served/copied verbatim (defaults to `public`).

***

### rendering?

```ts
optional rendering?: "csr" | "ssr" | "ssg";
```

Whether the application is using server-side rendering.

***

### rollup?

```ts
optional rollup?: RollupConfig;
```

The rollup configuration for the application.

***

### server?

```ts
optional server?: object;
```

The HTTP server configuration for the application.

#### printUrls?

```ts
optional printUrls?: boolean;
```

Should print or not the URLs of the server.

***

### ssg?

```ts
optional ssg?: object;
```

Static Site Generation options (used with `rendering: 'ssg'` / `--ssg`).

#### routes?

```ts
optional routes?: string[];
```

The routes to pre-render to static HTML. Defaults to `['/']`.
Parameterized routes should be listed explicitly (e.g. `/blog/hello`).

***

### target?

```ts
optional target?: "react" | "service";
```

The application target.

***

### vite?

```ts
optional vite?: Partial<UserConfig>;
```

The Vite configuration for the application.

***

### watcher?

```ts
optional watcher?: object;
```

File watching configuration.

#### ignored?

```ts
optional ignored?: string[];
```

Files to be ignored during watching.
