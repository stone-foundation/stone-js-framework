# Multi-tenant (subdomain routing)

A Stone.js starter for **multi-tenancy as routing**, the recipe from
[Multi-tenancy with subdomain routing](https://stonejs.dev/blog/multi-tenant-subdomains).

## The idea

The tenant is not a header you parse or a lookup you run in middleware, it is part of the route.
A controller scoped to `{tenant}.example.com` captures the tenant from the host during matching,
and every handler reads it off the event like any other parameter:

```ts
@EventHandler('/', { domain: '{tenant}.example.com' })
export class TenantController {
  @Get('/dashboard')
  dashboard (event: IncomingHttpEvent) {
    const tenant = event.get<string>('tenant', 'unknown') // from the host, not the path
    return this.tenantService.dashboard(tenant)
  }
}
```

`acme.example.com/dashboard` and `globex.example.com/dashboard` hit the same code with a different
tenant, and a request to an unmapped host simply 404s before your handler ever runs.

## Run it

```bash
npm install
npm run dev
```

Point a couple of hosts at your local server to try it:

```
127.0.0.1  acme.example.com
127.0.0.1  globex.example.com
```

Then open `http://acme.example.com:<port>/dashboard`.

## Test

```bash
npm test
```
