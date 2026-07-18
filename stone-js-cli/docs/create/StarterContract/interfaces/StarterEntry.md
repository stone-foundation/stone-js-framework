# Interface: StarterEntry

The starter contract a package declares in its own `package.json`:

```jsonc
{ "name": "@acme/stone-starters", "stone": { "starters": [
  { "value": "api", "title": "REST API", "tags": ["api"], "path": "api" }
] } }
```

This is the ONLY thing the CLI knows about a starter — it lives in the starter, not here.

## Extended by

- [`ResolvedStarter`](ResolvedStarter.md)

## Properties

### description?

```ts
optional description?: string;
```

One-line description.

***

### path?

```ts
optional path?: string;
```

Sub-path of the template inside the package (default `.`).

***

### tags?

```ts
optional tags?: string[];
```

Free-form tags (e.g. `api`, `spa`, `ssr`, `ssg`).

***

### title?

```ts
optional title?: string;
```

Display title.

***

### value

```ts
value: string;
```

Unique id (the questionnaire answer value).
