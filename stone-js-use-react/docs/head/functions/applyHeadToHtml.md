# Function: applyHeadToHtml()

```ts
function applyHeadToHtml(head, html): string;
```

Splice a HeadContext into a rendered HTML string (server-side rendering).

The `<title>` is replaced in place; everything else is rendered by the agnostic
serializeHead (which escapes attribute names/values) and injected at the
`<!--app-head-->` placeholder. Optional `<html>`/`<body>` attributes are merged in.
All replacements use literal replacers so content containing `$&`/`$'`/`$1` is inserted
verbatim rather than interpreted as a `String.replace` pattern.

## Parameters

### head

`HeadContext`

The head context to apply.

### html

`string`

The HTML template/string to inject into.

## Returns

`string`

The HTML string with the head applied.
