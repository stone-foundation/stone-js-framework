# OpenAPI contract from your schemas

A Stone.js starter for **generating a public API contract from the schemas you already validate
with**, the recipe from
[A public API contract, generated from the schemas you already write](https://stonejs.dev/blog/openapi-from-your-schemas).

## The idea

A hand-written OpenAPI spec drifts the day after you write it. Here the document is derived from the
same Zod schema the API enforces, so the contract stays a faithful view of the code.

```ts
export const spec = OpenApiGenerator
  .create({ title: 'Tasks API', version: '1.0.0' })
  .addServer('http://localhost:8080')
  .addSchema('NewTask', NewTask)                 // your validation schema -> JSON Schema
  .addPath('post', '/tasks', { request: { body: NewTask }, responses: { 201: {...}, 422: {...} } })
  .build()
```

`TaskController` enforces that exact `NewTask` at the boundary with `validate(...)`, so `POST /tasks`
genuinely returns the 201 and 422 the document advertises. `OpenApiController` serves the contract
two ways:

- `GET /openapi.json` : the raw document, for tools, machines and agents.
- `GET /docs` : a Swagger UI page pointed at it, for humans. No separate docs site to keep in sync.

## Run it

```bash
npm install
npm run dev
```

Open `http://localhost:<port>/docs` for the interactive explorer, or fetch
`http://localhost:<port>/openapi.json` for the document.

## Test

```bash
npm test
```
