# Interface: BuilderConfig

Configuration for building the Stone.js application.

## Properties

### browser?

```ts
optional browser: object;
```

The browser configuration for the application.

#### excludedModules?

```ts
optional excludedModules: string[];
```

Modules to be removed from the browser build.

***

### dotenv?

```ts
optional dotenv: Partial<DotenvConfig>;
```

Environment variable management configuration.

***

### imperative?

```ts
optional imperative: boolean;
```

Whether the application is using imperative programming style.

***

### input?

```ts
optional input: InputConfig;
```

Module autoloading configuration.

***

### language?

```ts
optional language: "typescript" | "javascript";
```

The language used in the application.

***

### lazy?

```ts
optional lazy: boolean;
```

Whether the application is using lazy loading for pages, error pages and layouts.

***

### output?

```ts
optional output: string;
```

The output file path for the production build.

***

### rendering?

```ts
optional rendering: "csr" | "ssr";
```

Whether the application is using server-side rendering.

***

### rollup?

```ts
optional rollup: RollupConfig;
```

The rollup configuration for the application.

***

### server?

```ts
optional server: object;
```

The HTTP server configuration for the application.

#### printUrls?

```ts
optional printUrls: boolean;
```

Should print or not the URLs of the server.

***

### target?

```ts
optional target: "react" | "service";
```

The application target.

***

### vite?

```ts
optional vite: Partial<UserConfig>;
```

The Vite configuration for the application.

***

### watcher?

```ts
optional watcher: object;
```

File watching configuration.

#### ignored?

```ts
optional ignored: string[];
```

Files to be ignored during watching.
