[**Resources**](../../README.md)

***

[Resources](../../README.md) / [Resource](../README.md) / Resource

# Abstract Class: Resource\<Model, Output\>

Base API resource — the declarative way to shape what your domain exposes.

Extend it and implement [Resource.toArray](#toarray) to map a model to its public shape. Everything
else (sparse fieldsets, dropping conditional fields, collections, envelopes) is handled for you.
A resource is decoupled from controllers and platform-agnostic: the same resource shapes data on
the backend and on the frontend.

## Example

```ts
class UserResource extends Resource<User> {
  toArray (user: User, ctx: ResourceContext) {
    return {
      id: user.id,
      name: user.name,
      email: this.when(ctx.self === true, user.email),
      posts: this.whenIncluded(ctx, 'posts', () => postResource.collection(user.posts))
    }
  }
}
```

## Type Parameters

### Model

`Model` = `unknown`

### Output

`Output` *extends* [`ResourceOutput`](../../declarations/type-aliases/ResourceOutput.md) = [`ResourceOutput`](../../declarations/type-aliases/ResourceOutput.md)

## Implements

- [`IResource`](../../declarations/interfaces/IResource.md)\<`Model`, `Output`\>

## Constructors

### Constructor

> **new Resource**\<`Model`, `Output`\>(): `Resource`\<`Model`, `Output`\>

#### Returns

`Resource`\<`Model`, `Output`\>

## Methods

### collection()

> **collection**(`models`, `context?`): `Partial`\<`Output`\>[]

Transform a collection of models.

#### Parameters

##### models

`Model`[]

The domain models.

##### context?

[`ResourceContext`](../../declarations/interfaces/ResourceContext.md) = `{}`

The resource context.

#### Returns

`Partial`\<`Output`\>[]

The transformed collection.

#### Implementation of

[`IResource`](../../declarations/interfaces/IResource.md).[`collection`](../../declarations/interfaces/IResource.md#collection)

***

### item()

> **item**(`model`, `context?`): `Partial`\<`Output`\>

Transform one model, applying the requested sparse fieldset and dropping undefined fields.

#### Parameters

##### model

`Model`

The domain model.

##### context?

[`ResourceContext`](../../declarations/interfaces/ResourceContext.md) = `{}`

The resource context.

#### Returns

`Partial`\<`Output`\>

The filtered public shape.

#### Implementation of

[`IResource`](../../declarations/interfaces/IResource.md).[`item`](../../declarations/interfaces/IResource.md#item)

***

### response()

> **response**(`models`, `context?`, `meta?`): [`ResourceEnvelope`](../../declarations/interfaces/ResourceEnvelope.md)\<`Partial`\<`Output`\> \| `Partial`\<`Output`\>[]\>

Wrap a model or a collection in a `{ data, meta }` envelope.

#### Parameters

##### models

`Model` \| `Model`[]

A model or a collection.

##### context?

[`ResourceContext`](../../declarations/interfaces/ResourceContext.md) = `{}`

The resource context.

##### meta?

`Record`\<`string`, `unknown`\>

Optional metadata (pagination, counts, …).

#### Returns

[`ResourceEnvelope`](../../declarations/interfaces/ResourceEnvelope.md)\<`Partial`\<`Output`\> \| `Partial`\<`Output`\>[]\>

The envelope.

#### Implementation of

[`IResource`](../../declarations/interfaces/IResource.md).[`response`](../../declarations/interfaces/IResource.md#response)

***

### toArray()

> `abstract` **toArray**(`model`, `context`): `Output`

Map a model to its public shape (before field filtering).

#### Parameters

##### model

`Model`

The domain model.

##### context

[`ResourceContext`](../../declarations/interfaces/ResourceContext.md)

The resource context.

#### Returns

`Output`

The public shape.

#### Implementation of

[`IResource`](../../declarations/interfaces/IResource.md).[`toArray`](../../declarations/interfaces/IResource.md#toarray)

***

### when()

> `protected` **when**\<`T`\>(`condition`, `value`): `T` \| `undefined`

Include a value only when `condition` is truthy (otherwise the field is dropped).

#### Type Parameters

##### T

`T`

#### Parameters

##### condition

`boolean`

Whether to include the value.

##### value

`T` \| (() => `T`)

The value, or a lazy factory (only evaluated when included).

#### Returns

`T` \| `undefined`

The value, or `undefined`.

***

### whenIncluded()

> `protected` **whenIncluded**\<`T`\>(`context`, `name`, `value`): `T` \| `undefined`

Include a value only when the relation was requested via `context.include`.

#### Type Parameters

##### T

`T`

#### Parameters

##### context

[`ResourceContext`](../../declarations/interfaces/ResourceContext.md)

The resource context.

##### name

`string`

The relation name.

##### value

`T` \| (() => `T`)

The value, or a lazy factory (only evaluated when included).

#### Returns

`T` \| `undefined`

The value, or `undefined`.
