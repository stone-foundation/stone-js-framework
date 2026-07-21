# Stateless auth

A Stone.js starter for **verifying a token at the boundary instead of holding a session**, the
recipe from [Stateless auth at the edge](https://stonejs.dev/blog/stateless-auth-at-the-edge).

## The idea

Identity is established once, at the edge, and carried as context. The auth blueprint adds a kernel
middleware that verifies the `Authorization: Bearer` token on every request and exposes the
principal; guards then enforce access per route:

- `requireAuth()` rejects anonymous calls with a **401**.
- `requireScopes('tasks:write')` additionally demands OAuth scopes, rejecting a missing one with a **403**.

Nothing touches a session store, so the exact same code runs on Node, serverless and the edge.

```ts
@Post('/login')                                     // mint a token (verify credentials for real)
@Get('/me', { middleware: [requireAuth()] })        // 401 when anonymous
@Post('/tasks', { middleware: [requireScopes('tasks:write')] })  // 403 without the scope
```

Auth is enabled in `app/configurations/AuthConfiguration.ts`, which merges `authBlueprint` and sets
the signing strategy (a shared HMAC secret here; swap for `publicKey`/`jwksUri` to trust an external
identity provider).

## Run it

```bash
npm install
JWT_SECRET=please-change-me npm run dev
```

```bash
# get a token
TOKEN=$(curl -s -X POST localhost:<port>/login -H 'content-type: application/json' -d '{"username":"ana"}' | jq -r .token)

curl localhost:<port>/me                               # 401
curl localhost:<port>/me -H "authorization: Bearer $TOKEN"   # 200 -> the principal
```

## Test

```bash
npm test
```
