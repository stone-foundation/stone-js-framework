# Stone.js - Blog Starters

Opt-in **starter templates** that ship with the [Stone.js blog](https://stonejs.dev/blog) recipes.

These are kept **separate from the default starters** on purpose: `npm create @stone-js` stays short and uncluttered, and you pull a recipe starter only when you want it. Each one is a real, runnable Stone.js app that solves the problem an article walks through.

## Use one

```bash
npm create @stone-js@latest my-app --starters github:stone-foundation/stone-js-blog-starters
```

The scaffolder lists the recipes declared in this package's `stone.starters` manifest; pick one and it is copied into `my-app`.

## The contract

The CLI knows nothing hard-coded about these templates. This package simply declares them in its `package.json`:

```jsonc
{ "stone": { "starters": [
  { "value": "realtime-chat", "title": "Realtime chat", "path": "realtime-chat" }
] } }
```

Any package (first- or third-party) that declares `stone.starters` works the same way, passed via `--starters <github|npm|path>`, or auto-detected when installed as a dependency.

## Recipes

| starter | recipe |
| ------- | ------ |
| `realtime-chat` | [Realtime features](https://stonejs.dev/blog/real-time-features): channels, presence and broadcast over WebSockets. |
| `multi-tenant` | [Multi-tenancy with subdomain routing](https://stonejs.dev/blog/multi-tenant-subdomains): capture the tenant from the host. |
| `isomorphic-validation` | [One schema, validated on the backend and the form](https://stonejs.dev/blog/isomorphic-validation): one Zod schema, a 422 at the boundary. |
| `stateless-auth` | [Stateless auth at the edge](https://stonejs.dev/blog/stateless-auth-at-the-edge): verify a JWT at the boundary, guard routes, no session store. |
| `api-as-tools` | [Your API as MCP tools for agents](https://stonejs.dev/blog/api-as-agent-tools): stack the MCP adapter, agents call the same domain. |
| `openapi-contract` | [A public API contract, generated from your schemas](https://stonejs.dev/blog/openapi-from-your-schemas): OpenAPI from Zod, served with Swagger UI. |
| `signed-url-uploads` | [Direct-to-cloud file uploads with signed URLs](https://stonejs.dev/blog/signed-url-file-uploads): upload straight to the bucket, store only metadata. |

The set grows with the blog.

## License

[MIT](./LICENSE)
