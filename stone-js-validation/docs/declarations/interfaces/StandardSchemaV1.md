[**Validation**](../../README.md)

***

[Validation](../../README.md) / [declarations](../README.md) / StandardSchemaV1

# Interface: StandardSchemaV1\<Output\>

Minimal shape of the [Standard Schema](https://standardschema.dev) v1 contract — implemented
by Zod 3.24+, Valibot, ArkType and others. Only the synchronous path is consumed here.

## Type Parameters

### Output

`Output` = `unknown`

## Properties

### ~standard

> `readonly` **~standard**: `object`

#### validate

> `readonly` **validate**: (`value`) => [`StandardResult`](StandardResult.md)\<`Output`\> \| `Promise`\<[`StandardResult`](StandardResult.md)\<`Output`\>\>

##### Parameters

###### value

`unknown`

##### Returns

[`StandardResult`](StandardResult.md)\<`Output`\> \| `Promise`\<[`StandardResult`](StandardResult.md)\<`Output`\>\>

#### vendor

> `readonly` **vendor**: `string`

#### version

> `readonly` **version**: `1`
