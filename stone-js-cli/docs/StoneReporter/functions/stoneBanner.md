# Function: stoneBanner()

```ts
function stoneBanner(version?, subtitle?): string;
```

Build the signature banner as plain text (no ANSI): the gem logo, the wordmark with version, a
rule, and the subtitle. The [StoneReporter.banner](../classes/StoneReporter.md#banner) method applies the brand colour on top.

## Parameters

### version?

`string` = `''`

The CLI/app version to display.

### subtitle?

`string` = `'The continuum framework'`

An optional subtitle line.

## Returns

`string`

The multi-line banner string.
