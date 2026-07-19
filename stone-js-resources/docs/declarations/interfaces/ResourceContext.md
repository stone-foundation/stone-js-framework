[**Resources**](../../README.md)

***

[Resources](../../README.md) / [declarations](../README.md) / ResourceContext

# Interface: ResourceContext

The context that shapes a transformation: which fields the client asked for, which relations to
include, and any extra data (the current user, the event, …) a resource may consult.

It is intentionally open so resources can read whatever they need while staying agnostic.

## Indexable

> \[`key`: `string`\]: `unknown`

Anything else a resource needs (e.g. the authenticated principal).

## Properties

### fields?

> `optional` **fields?**: `string`[]

Requested sparse fieldset — when set, the output is limited to these top-level keys.

***

### include?

> `optional` **include?**: `string`[]

Requested relations to embed.
