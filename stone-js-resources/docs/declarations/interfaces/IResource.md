[**Resources**](../../README.md)

***

[Resources](../../README.md) / [declarations](../README.md) / IResource

# Interface: IResource\<Model, Output\>

The resource contract: transform a model (or a collection) into its public representation.

## Type Parameters

### Model

`Model` = `unknown`

### Output

`Output` *extends* [`ResourceOutput`](../type-aliases/ResourceOutput.md) = [`ResourceOutput`](../type-aliases/ResourceOutput.md)

## Properties

### collection

> **collection**: (`models`, `context?`) => `Partial`\<`Output`\>[]

Transform a collection.

#### Parameters

##### models

`Model`[]

##### context?

[`ResourceContext`](ResourceContext.md)

#### Returns

`Partial`\<`Output`\>[]

***

### item

> **item**: (`model`, `context?`) => `Partial`\<`Output`\>

Transform one model, applying sparse fieldsets and dropping undefined fields.

#### Parameters

##### model

`Model`

##### context?

[`ResourceContext`](ResourceContext.md)

#### Returns

`Partial`\<`Output`\>

***

### response

> **response**: (`models`, `context?`, `meta?`) => [`ResourceEnvelope`](ResourceEnvelope.md)\<`Partial`\<`Output`\> \| `Partial`\<`Output`\>[]\>

Wrap a model or collection in a `{ data, meta }` envelope.

#### Parameters

##### models

`Model` \| `Model`[]

##### context?

[`ResourceContext`](ResourceContext.md)

##### meta?

`Record`\<`string`, `unknown`\>

#### Returns

[`ResourceEnvelope`](ResourceEnvelope.md)\<`Partial`\<`Output`\> \| `Partial`\<`Output`\>[]\>

***

### toArray

> **toArray**: (`model`, `context`) => `Output`

Transform one model into its public shape (before field filtering).

#### Parameters

##### model

`Model`

##### context

[`ResourceContext`](ResourceContext.md)

#### Returns

`Output`
