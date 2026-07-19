[**OpenAPI**](../../README.md)

***

[OpenAPI](../../README.md) / [serve](../README.md) / swaggerUiHtml

# Function: swaggerUiHtml()

> **swaggerUiHtml**(`specUrl`, `options?`): `string`

Renders a self-contained Swagger UI HTML page that loads a spec from `specUrl`.

Return it from an HTML route (e.g. `GET /docs`) while another route serves the JSON document
(`OpenApiGenerator.build()`), for a zero-build API explorer.

## Parameters

### specUrl

`string`

The URL of the OpenAPI JSON document.

### options?

[`SwaggerUiOptions`](../interfaces/SwaggerUiOptions.md) = `{}`

Rendering options.

## Returns

`string`

The HTML page.
