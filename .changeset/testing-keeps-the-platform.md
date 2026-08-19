---
'@stone-js/testing': patch
'@stone-js/use-react': patch
---

A test keeps the application's platform, so every context is testable in memory.

The harness introduced a `test` platform of its own, and that quietly broke fidelity: adapters
contribute much of what an application is through **platform-conditional** blueprint middleware
(`if (blueprint.get('stone.adapter.platform') === NODE_HTTP_PLATFORM) …` sets the HTTP response
type). Under a platform nobody declared, every one of those conditions was false and the kernel built
a bare `OutgoingResponse`. A JSON API survived, because passing content through is all it needs; a
rendered page did not, because the view layer calls `response.isError()`.

A test is now the same context minus the network: the platform, the response type and the error
handlers are the application's own, and only the integration is replaced. Adapter middleware is
dropped, since it exists to normalise a raw platform event and a test supplies a ready
`IncomingEvent`.

`createTestApp({ platform })` names the context when an application stacks several — the HTTP context
of an app that is also a CLI, or the browser context of a pure SPA, where neither adapter claims the
default and nothing was selected at all. It uses the core's own selection rule rather than a
mechanism of its own.

`@stone-js/use-react` renders into a minimal HTML shell when no template is configured, warning once,
instead of refusing to render. A build always generates one; reaching the fallback means either a test
(where it is the point) or a build that did not run, and an unstyled page with a warning beats a page
that cannot render. The shell carries what the renderer splices into, `<title>` included, because a
page's title is replaced in place rather than inserted.

Verified through `stone test` on four real applications: a REST API, SSR, SSG and a SPA.
