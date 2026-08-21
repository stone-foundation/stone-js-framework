---
"@stone-js/core": patch
"@stone-js/http-core": patch
"@stone-js/browser-core": patch
---

fix: an event's identity is one notion, computed one way

`fingerprint()` is how anything that has to survive one event being handled twice finds its way back:
a renderer stores its loader results under that key on the server and reads them under the same key
in the browser. It was implemented twice, in two packages, and the two drifted.

**A server-rendered page with a query string never found its own data.** An HTTP event keyed on the
pathname alone, a browser event on the pathname *and* the query, so a render of `/tasks?page=2` stored
its data under `GET|/tasks` while the hydrating browser looked for `GET|/tasks?page=2`. Nothing
failed and nothing was logged: the page simply refetched on every URL that carried a query. Measured
on the SSR lab application, which wrote `GET|/` for `/?name=Ada`, and now writes `GET|/?name=Ada`.

**And a non-latin URL threw.** The HTTP event used bare `btoa`, which only accepts latin1, so
`/東京` failed with `InvalidCharacterError` from inside a render. The two implementations also
disagreed on latin1 accents, `btoa` encoding `é` as one byte and the browser's UTF-8 path as two, so
`/café` produced two different keys for the same page.

`urlFingerprint` now lives in `@stone-js/core` and both events use it. The query is part of the
identity, because `/tasks?page=2` and `/tasks?page=3` are two pages with two sets of data; the origin
is not, because the same route served from two hosts is the same route. `IncomingHttpEvent`'s `full`
form still narrows further with the user agent and the IP.

**`IncomingEvent` gains a `fingerprint()` of its own**, so an event that carries a payload rather than
a URL has an identity too: its type and a stable serialization of its metadata, with keys sorted at
every depth and the timestamp excluded, because a server render and a browser render of the same
event happen at different moments and must agree. Before this, dispatching such an event into a
renderer failed with `event.fingerprint is not a function`, thrown from the kernel's error handler,
which named nothing a reader could act on.

The tests for both events were restating their implementation with `btoa`, which is why the drift
survived: each one proved that the formula equalled itself. They now assert the properties that
matter, and are pinned to the shared formula, so the two cannot disagree again without a failure.
