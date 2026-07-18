# Class: HeadManager

A fluent head builder. Every method returns `this` for chaining; [toContext](#tocontext)
produces the final HeadContext.

## Constructors

### Constructor

```ts
new HeadManager(initial?): HeadManager;
```

Create a HeadManager, optionally seeded from an existing context.

#### Parameters

##### initial?

`HeadContext`

An initial head context to extend.

#### Returns

`HeadManager`

## Methods

### alternate()

```ts
alternate(href, attrs?): this;
```

Set an alternate link (e.g. hreflang or RSS feed).

#### Parameters

##### href

`string`

The alternate URL.

##### attrs?

`Record`\<`string`, `unknown`\>

Extra attributes (e.g. `{ hreflang: 'fr' }`, `{ type: 'application/rss+xml' }`).

#### Returns

`this`

***

### base()

```ts
base(href, target?): this;
```

Set the `<base>` element.

#### Parameters

##### href

`string`

The base href.

##### target?

`string`

The base target.

#### Returns

`this`

***

### bodyAttributes()

```ts
bodyAttributes(attributes): this;
```

Set attributes on the `<body>` element.

#### Parameters

##### attributes

`Record`\<`string`, `string`\>

Attribute map.

#### Returns

`this`

***

### canonical()

```ts
canonical(href): this;
```

Set the canonical URL (`<link rel="canonical">`).

#### Parameters

##### href

`string`

The canonical URL.

#### Returns

`this`

***

### charset()

```ts
charset(value?): this;
```

Set the document character set (`<meta charset>`).

#### Parameters

##### value?

`string`

The charset (default `utf-8`).

#### Returns

`this`

***

### description()

```ts
description(value): this;
```

Set the meta description (and the `og:description` fallback source).

#### Parameters

##### value

`string`

The description text.

#### Returns

`this`

***

### htmlAttributes()

```ts
htmlAttributes(attributes): this;
```

Set attributes on the `<html>` element.

#### Parameters

##### attributes

`Record`\<`string`, `string`\>

Attribute map (e.g. `{ lang: 'en' }`).

#### Returns

`this`

***

### jsonLd()

```ts
jsonLd(data): this;
```

Add a JSON-LD structured-data block (`<script type="application/ld+json">`).

#### Parameters

##### data

`Record`\<`string`, `unknown`\>

The JSON-LD object.

#### Returns

`this`

***

### link()

```ts
link(descriptor): this;
```

Add a link descriptor (deduped by `rel`+`href`).

#### Parameters

##### descriptor

`LinkDescriptor`

The link descriptor.

#### Returns

`this`

***

### merge()

```ts
merge(other): this;
```

Merge another head context (or manager) into this one. Later values win; metas/links
are deduped. Enables hierarchical heads (layout head + page head).

#### Parameters

##### other

`HeadContext` \| `HeadManager`

The head context or manager to merge in.

#### Returns

`this`

***

### meta()

```ts
meta(descriptor): this;
```

Add or replace a raw meta descriptor (deduped by `name`/`property`/`charset`).

#### Parameters

##### descriptor

`Record`\<`string`, `unknown`\> \| `MetaDescriptor`

The meta descriptor.

#### Returns

`this`

***

### og()

```ts
og(options): this;
```

Add Open Graph meta tags. Falls back to the current title/description when omitted.

#### Parameters

##### options

[`OpenGraphOptions`](../interfaces/OpenGraphOptions.md)

Open Graph options.

#### Returns

`this`

***

### preload()

```ts
preload(
   href, 
   as?, 
   rel?): this;
```

Add a preload/prefetch/modulepreload link.

#### Parameters

##### href

`string`

The resource URL.

##### as?

`string`

The `as` attribute (e.g. `script`, `style`, `font`, `image`).

##### rel?

`"preload"` \| `"prefetch"` \| `"modulepreload"`

The relationship (default `preload`).

#### Returns

`this`

***

### robots()

```ts
robots(options): this;
```

Set robots directives (`<meta name="robots">`).

#### Parameters

##### options

[`RobotsOptions`](../interfaces/RobotsOptions.md)

Robots directives.

#### Returns

`this`

***

### script()

```ts
script(descriptor): this;
```

Add a script descriptor (external via `src`, or inline via `content`).

#### Parameters

##### descriptor

`ScriptDescriptor`

The script descriptor.

#### Returns

`this`

***

### style()

```ts
style(css, attrs?): this;
```

Add an inline style block.

#### Parameters

##### css

`string`

The CSS text.

##### attrs?

`Record`\<`string`, `unknown`\>

Extra attributes (e.g. `media`).

#### Returns

`this`

***

### stylesheet()

```ts
stylesheet(href, attrs?): this;
```

Add a stylesheet link.

#### Parameters

##### href

`string`

The stylesheet URL.

##### attrs?

`Record`\<`string`, `unknown`\>

Extra attributes (e.g. `media`).

#### Returns

`this`

***

### themeColor()

```ts
themeColor(value): this;
```

Set the theme color meta.

#### Parameters

##### value

`string`

A CSS color.

#### Returns

`this`

***

### title()

```ts
title(value): this;
```

Set the document title.

#### Parameters

##### value

`string`

The title text.

#### Returns

`this`

***

### titleTemplate()

```ts
titleTemplate(template): this;
```

Set a title template, e.g. `'%s — Stone.js'` where `%s` is replaced by the title.

#### Parameters

##### template

`string`

The template string containing `%s`.

#### Returns

`this`

***

### toContext()

```ts
toContext(): HeadContext;
```

Produce the final head context. The title template (if any) is applied to the title.

#### Returns

`HeadContext`

The resolved HeadContext.

***

### twitter()

```ts
twitter(options): this;
```

Add Twitter card meta tags. Falls back to the current title/description when omitted.

#### Parameters

##### options

[`TwitterOptions`](../interfaces/TwitterOptions.md)

Twitter card options.

#### Returns

`this`

***

### viewport()

```ts
viewport(value?): this;
```

Set the viewport meta (default mobile-friendly value).

#### Parameters

##### value?

`string`

The viewport content.

#### Returns

`this`
