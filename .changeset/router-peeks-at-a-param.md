---
"@stone-js/router": patch
"@stone-js/i18n": patch
---

feat(router): read a route parameter from any layer, in one call

A kernel or group middleware runs before routing, so reading a parameter took a three-line dance everywhere: find the route, bind it, read it. Even on the router layer, parameters are only bound after the route middleware have run. The router does the dance itself now:

```ts
// A group middleware guarding /orgs/:orgCode, before any routing has happened:
const orgCode = await router.findParam(event, 'orgCode', '')

// Or the bound route itself, for reading several things:
const route = await router.getBoundRoute(event)
```

Three properties make it safe to call from anywhere. It is a **peek, not a dispatch**: nothing is emitted, `currentRoute` is untouched, and the router's own resolution later proceeds as if nobody had looked. The match is **remembered per event**, so a guard reading `orgCode` and a locale middleware reading `lang` pay for one match, not two. And `findParam` answers the **fallback when no route matches**, because deciding that a request is a 404 is the router's job at dispatch, not the caller's at peek (`getBoundRoute` throws, since asking for a route that does not exist is a different question).

Named in the `find*` family on purpose: `findParam` takes an event and may match, where the existing `getParam` reads the already-dispatched current route.

`@stone-js/i18n` dogfoods it: the locale middleware asks the router the one question when the router offers it, and keeps the old dance for older routers.
