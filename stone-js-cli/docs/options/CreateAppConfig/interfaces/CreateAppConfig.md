# Interface: CreateAppConfig

Configuration for creating a new Stone.js Application.
Used internally by the `init` command.

## Properties

### destDir?

```ts
optional destDir?: string;
```

***

### initGit

```ts
initGit: boolean;
```

***

### linting

```ts
linting: string;
```

***

### modules

```ts
modules: string[];
```

***

### overwrite

```ts
overwrite: boolean;
```

***

### packageJson?

```ts
optional packageJson?: PackageJson;
```

***

### packageManager

```ts
packageManager: string;
```

***

### projectName

```ts
projectName: string;
```

***

### srcDir?

```ts
optional srcDir?: string;
```

***

### starters?

```ts
optional starters?: string[];
```

Starter links (git/npm/local) to fetch, e.g. `github:owner/repo`, `@acme/stone-starters`,
`./my-starter`. Also set via `--starters link1,link2`. Empty = the built-in default link.
The CLI stays agnostic: each linked package declares its own starters via `stone.starters`
in its package.json. Installed starter packages are additionally auto-detected (0-config).

***

### startersRepo

```ts
startersRepo: string;
```

***

### template

```ts
template: string;
```

***

### testing

```ts
testing: string;
```

***

### typing

```ts
typing: string;
```
