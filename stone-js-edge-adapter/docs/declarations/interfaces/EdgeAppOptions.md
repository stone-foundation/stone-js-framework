[**EdgeAdapter**](../../README.md)

***

[EdgeAdapter](../../README.md) / [declarations](../README.md) / EdgeAppOptions

# Interface: EdgeAppOptions

What to boot: the app's modules (decorated classes and/or blueprints). The Fetch adapter is
forced as the current adapter, so the same app deploys to any edge/runtime target.

## Properties

### blueprint?

> `optional` **blueprint?**: `Partial`\<`StoneBlueprint`\<`IncomingEvent`, `OutgoingResponse`\>\>

A base blueprint to merge (shorthand for one blueprint module).

***

### modules?

> `optional` **modules?**: `unknown`[]

App modules to boot.
