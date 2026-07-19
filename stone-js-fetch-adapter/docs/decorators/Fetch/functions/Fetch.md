[**FetchAdapter**](../../../README.md)

***

[FetchAdapter](../../../README.md) / [decorators/Fetch](../README.md) / Fetch

# Function: Fetch()

> **Fetch**\<`T`\>(`options?`): `ClassDecorator`

Class decorator registering the Web-standard (Fetch) adapter on a Stone application.

## Type Parameters

### T

`T` *extends* `ClassType` = `ClassType`

## Parameters

### options?

[`FetchOptions`](../interfaces/FetchOptions.md) = `{}`

Adapter options (merged over the defaults).

## Returns

`ClassDecorator`

A class decorator.

## Example

```ts
@Fetch({ default: true })
@StoneApp()
class Application {}
```
