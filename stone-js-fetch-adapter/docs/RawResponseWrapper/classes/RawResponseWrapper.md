[**FetchAdapter**](../../README.md)

***

[FetchAdapter](../../README.md) / [RawResponseWrapper](../README.md) / RawResponseWrapper

# Class: RawResponseWrapper

Builds a Web `Response` from the accumulated [FetchRawResponseOptions](../../declarations/interfaces/FetchRawResponseOptions.md).

This is the raw response every WinterCG runtime understands, so the same wrapper works on
Cloudflare Workers, Deno, Bun and the Edge runtimes. Multiple `Set-Cookie` values are emitted
as repeated headers (the only correct way), not folded into one.

## Implements

- `IRawResponseWrapper`\<`Response`\>

## Methods

### respond()

> **respond**(): `Response`

Produce the Web `Response`.

#### Returns

`Response`

The response.

#### Implementation of

`IRawResponseWrapper.respond`

***

### create()

> `static` **create**(`options`): `RawResponseWrapper`

Factory.

#### Parameters

##### options

`Partial`\<[`FetchRawResponseOptions`](../../declarations/interfaces/FetchRawResponseOptions.md)\>

The accumulated response options.

#### Returns

`RawResponseWrapper`

A new wrapper.
