[**Testing**](../../README.md)

***

[Testing](../../README.md) / [declarations](../README.md) / TestAppOptions

# Interface: TestAppOptions

Options for [createTestApp](../../createTestApp/README.md).

## Properties

### blueprint?

> `optional` **blueprint?**: `Partial`\<`StoneBlueprint`\<`IncomingEvent`, `OutgoingResponse`\>\>

A base blueprint to merge in (shorthand for a single blueprint module).

***

### modules?

> `optional` **modules?**: `unknown`[]

App modules to boot: decorated classes (`@StoneApp`, controllers, …) and/or blueprints.
