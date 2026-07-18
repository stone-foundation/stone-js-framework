# Interface: ResolvedStarter

A starter entry resolved to a concrete local directory, ready to copy.

## Extends

- [`StarterEntry`](StarterEntry.md)

## Properties

### description?

```ts
optional description?: string;
```

One-line description.

#### Inherited from

[`StarterEntry`](StarterEntry.md).[`description`](StarterEntry.md#description)

***

### dir

```ts
dir: string;
```

Absolute root directory of the fetched/installed package.

***

### path?

```ts
optional path?: string;
```

Sub-path of the template inside the package (default `.`).

#### Inherited from

[`StarterEntry`](StarterEntry.md).[`path`](StarterEntry.md#path)

***

### provider

```ts
provider: string;
```

The declaring package name (display group).

***

### tags?

```ts
optional tags?: string[];
```

Free-form tags (e.g. `api`, `spa`, `ssr`, `ssg`).

#### Inherited from

[`StarterEntry`](StarterEntry.md).[`tags`](StarterEntry.md#tags)

***

### title?

```ts
optional title?: string;
```

Display title.

#### Inherited from

[`StarterEntry`](StarterEntry.md).[`title`](StarterEntry.md#title)

***

### value

```ts
value: string;
```

Unique id (the questionnaire answer value).

#### Inherited from

[`StarterEntry`](StarterEntry.md).[`value`](StarterEntry.md#value)
