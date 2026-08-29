---
"@stone-js/mcp": patch
---

fix(mcp): read the option the ecosystem publishes, and derive the answer's shape

**Two packages of the same version disagreed on a name.** `@stone-js/mcp` derived a tool's description from `route.getOption('openapi')`, while `@stone-js/openapi` publishes its contract under `contract` (its own `CONTRACT_OPTION`), renamed so a specification's name would not sit in the router's vocabulary. An application declaring `contract:` on two hundred routes therefore had every one of its tools exposed **without a description**, silently, because nothing here was looking at the right key. Reported by a pilot reading the code. Two tests encoded the old name, which is how it survived.

**And the answer's shape is derived now, not only stated.** `outputSchema` used to come from `mcp.outputSchema` or nothing at all. It now falls back to the resource the route publishes, through `@Returns` or the route's own `resource`, read and converted by `@stone-js/openapi`: the same package that builds the document a human reads, so a tool and a contract describing the same answer cannot describe it differently. A resource named rather than pointed at is resolved through `stone.resources.registry`, the registry the runtime projects through, so a tool describes the shape a caller actually gets.

Three limits, on purpose:

- **Only an object schema is published.** MCP carries structured output as an object, and a resource answering a bare array is a real thing; wrapping it would invent a shape the application never declared. That route gets no `outputSchema`, which stays the honest answer.
- **The declaration still wins.** `mcp.outputSchema` overrides the derivation, as it does for every other field.
- **`@stone-js/openapi` remains optional.** Without it the derivation does not happen, a debug line says so, and the tool works.
