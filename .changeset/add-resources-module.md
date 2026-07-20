---
"@stone-js/resources": minor
---

Add `@stone-js/resources`: framework-agnostic API resources. Shape what your domain exposes — sparse fieldsets, conditional fields (`when`), includes (`whenIncluded`), collections and `{ data, meta }` envelopes — decoupled from controllers and identical on backend and frontend. Ships the `Resource` base class, `defineResource()` factory, `only`/`except`/`applyFields` helpers and `contextFromEvent()`. Zero `@stone-js` dependencies (usable anywhere). Feeds the response side of `@stone-js/openapi`.
