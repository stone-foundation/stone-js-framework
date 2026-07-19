[**Authz**](../../README.md)

***

[Authz](../../README.md) / [casl](../README.md) / ForbiddenError

# Class: ForbiddenError\<T\>

Curated re-exports of the CASL essentials, so applications get one import surface from
`@stone-js/authz` and can define abilities without depending on CASL directly. Full CASL power
(conditions, field-level rules, subject detection) remains available.

## Extends

- `NativeError`

## Type Parameters

### T

`T` *extends* `AnyAbility`

## Constructors

### Constructor

> **new ForbiddenError**\<`T`\>(`ability`): `ForbiddenError`\<`T`\>

#### Parameters

##### ability

`T`

#### Returns

`ForbiddenError`\<`T`\>

#### Overrides

`NativeError.constructor`

## Properties

### ability

> `readonly` **ability**: `T`

***

### action

> **action**: `Normalize`\<`T`\[*typeof* `ɵabilities`\]\>\[`0`\]

***

### cause?

> `optional` **cause?**: `unknown`

#### Inherited from

`NativeError.cause`

***

### field?

> `optional` **field?**: `string`

***

### message

> **message**: `string`

#### Inherited from

`NativeError.message`

***

### name

> **name**: `string`

#### Inherited from

`NativeError.name`

***

### stack?

> `optional` **stack?**: `string`

#### Inherited from

`NativeError.stack`

***

### subject

> **subject**: `T`\[*typeof* `ɵabilities`\]\[`1`\]

***

### subjectType

> **subjectType**: `string`

***

### \_defaultErrorMessage

> `static` **\_defaultErrorMessage**: `GetErrorMessage`

## Methods

### setMessage()

> **setMessage**(`message`): `this`

#### Parameters

##### message

`string`

#### Returns

`this`

***

### throwUnlessCan()

> **throwUnlessCan**(...`args`): `void`

#### Parameters

##### args

...`Parameters`\<`T`\[`"can"`\]\>

#### Returns

`void`

***

### unlessCan()

> **unlessCan**(...`args`): `ForbiddenError`\<`T`\> \| `undefined`

#### Parameters

##### args

...`Parameters`\<`T`\[`"can"`\]\>

#### Returns

`ForbiddenError`\<`T`\> \| `undefined`

***

### from()

> `static` **from**\<`U`\>(`ability`): `ForbiddenError`\<`U`\>

#### Type Parameters

##### U

`U` *extends* `AnyAbility`

#### Parameters

##### ability

`U`

#### Returns

`ForbiddenError`\<`U`\>

***

### setDefaultMessage()

> `static` **setDefaultMessage**(`messageOrFn`): `void`

#### Parameters

##### messageOrFn

`string` \| `GetErrorMessage`

#### Returns

`void`
