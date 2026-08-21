---
"@stone-js/cli": patch
"@stone-js/node-http-adapter": patch
"@stone-js/node-ws-adapter": patch
---

fix: a build that fails says so, and a shutdown that starts finishes

Four silent failures, all of the same shape: something reported success, or reported nothing, while the process was in a state nobody asked for.

- `stone build --ssg` wrote whatever a page answered, including an error body, and exited `0`. A pre-render is an HTTP request, so a page that throws answers 500, and that HTML was published as the page. The build now stops, names every page it could not render and what it answered, and writes nothing at all.
- A failed CLI command resolved exit `1` and then hung forever: build tooling leaves handles behind, which is why a successful build already exits deliberately. The failing path now does the same, so CI sees the failure instead of a timeout.
- SSG left its pre-render server behind when the app shut down gracefully, and the open pipes kept the CLI alive. It now waits for the child to go, and forces it when it does not.
- `@stone-js/node-http-adapter` closed the server on `SIGINT`/`SIGTERM` and waited for every socket, so an idle keep-alive connection held the process open forever and an orchestrator had to hard-kill a container that promised to leave. Idle connections are closed at once, requests in flight get `shutdownGracePeriod` (10s by default), and the process exits either way.
- `@stone-js/node-ws-adapter` could not stop while anyone was connected, which is a realtime server's normal state. Clients are now asked to leave with `1001 Going away` and dropped after the grace period.
