[**Mcp**](../../README.md)

***

[Mcp](../../README.md) / [tools](../README.md) / ReportToolsOptions

# Interface: ReportToolsOptions

Options for [createReportTools](../functions/createReportTools.md).

## Properties

### fetch?

> `optional` **fetch?**: \{(`input`, `init?`): `Promise`\<`Response`\>; (`input`, `init?`): `Promise`\<`Response`\>; \}

Injectable fetch (defaults to the global). Mainly for testing.

#### Call Signature

> (`input`, `init?`): `Promise`\<`Response`\>

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/fetch)

##### Parameters

###### input

`URL` \| `RequestInfo`

###### init?

`RequestInit`

##### Returns

`Promise`\<`Response`\>

#### Call Signature

> (`input`, `init?`): `Promise`\<`Response`\>

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/fetch)

##### Parameters

###### input

`string` \| `URL` \| `Request`

###### init?

`RequestInit`

##### Returns

`Promise`\<`Response`\>

***

### repo

> **repo**: `string`

Target repository as `owner/repo`.

***

### token

> **token**: `string`

GitHub token with `issues:write` on the target repo.
