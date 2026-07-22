# @stone-js/openapi

## 1.0.0

### Minor Changes

- 0edcba4: Add `@stone-js/openapi`: derive a public OpenAPI 3.0 contract from your Zod schemas and routes. `OpenApiGenerator` assembles parameters, request bodies, responses and component schemas (Zod → JSON Schema via `zod-to-json-schema`, or pass raw JSON Schema); `addRoutes()` derives operations from annotated routes; `swaggerUiHtml()` renders a zero-build API explorer. Pairs with `@stone-js/validation` (request schemas) and `@stone-js/resources` (response shapes) to expose a typed, filterable contract.
