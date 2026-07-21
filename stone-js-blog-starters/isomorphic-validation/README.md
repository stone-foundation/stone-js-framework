# Isomorphic validation

A Stone.js starter for **one schema, enforced on the API and reusable on the form**, the recipe
from [One schema, validated on the backend and the form](https://stonejs.dev/blog/isomorphic-validation).

## The idea

The shape of the data is written once, as a plain Zod schema in `app/schemas.ts`:

```ts
export const NewTask = z.object({ title: z.string().min(1).max(120), done: z.boolean().optional() })
```

- **At the boundary**, `validate({ body: NewTask })` sits on the create route as middleware. A
  malformed body never reaches your handler; it is rejected with a **422** (`ValidationErrorHandler`
  maps the platform-agnostic `ValidationError` to the HTTP status + a field-keyed payload).
- **On the frontend**, the same `NewTask` value validates the form (`NewTask.safeParse(values)`),
  so the API and the UI can never drift apart.

Any Standard Schema or Zod-like schema works; Zod is used here for familiarity.

## Run it

```bash
npm install
npm run dev
```

```bash
# rejected with 422
curl -X POST localhost:<port>/tasks -H 'content-type: application/json' -d '{"title":""}'

# accepted with 201
curl -X POST localhost:<port>/tasks -H 'content-type: application/json' -d '{"title":"Write docs"}'
```

## Test

```bash
npm test
```
