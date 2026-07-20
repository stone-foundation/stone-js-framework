[**Resources**](../../README.md)

***

[Resources](../../README.md) / [defineResource](../README.md) / defineResource

# Function: defineResource()

> **defineResource**\<`Model`, `Output`\>(`transform`): [`Resource`](../../Resource/classes/Resource.md)\<`Model`, `Output`\>

The imperative/functional way to define a resource — a plain transform function instead of a
class. Returns a full [Resource](../../Resource/classes/Resource.md) (so you still get `item`/`collection`/`response` and
sparse fieldsets for free).

## Type Parameters

### Model

`Model` = `unknown`

### Output

`Output` *extends* [`ResourceOutput`](../../declarations/type-aliases/ResourceOutput.md) = [`ResourceOutput`](../../declarations/type-aliases/ResourceOutput.md)

## Parameters

### transform

(`model`, `context`) => `Output`

Maps a model to its public shape.

## Returns

[`Resource`](../../Resource/classes/Resource.md)\<`Model`, `Output`\>

A resource.

## Example

```ts
const userResource = defineResource<User>((user) => ({ id: user.id, name: user.name }))
userResource.collection(users, { fields: ['id'] })
```
