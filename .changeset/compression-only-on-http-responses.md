---
"@stone-js/http-core": patch
---

fix(http-core): compression no longer breaks a page bigger than 1 kB

A React page whose rendered HTML passed 1 kB came back as an error page: empty `<title>`, no markup,
and a snapshot carrying nothing but `{"error":{"name":"TypeError"}}`. The error, once it could be
read, was `response.removeHeader is not a function`.

`CompressionMiddleware` is global, and it is written for an HTTP response. In an application that
renders rather than serves, what comes back is a browser or a native response: it extends the core
`OutgoingResponse` and has no `setHeader`, no `removeHeader`, no `addVary`, because nothing is going
over a wire. The middleware reached for all three.

**The 1 kB threshold is what made it hide for so long.** Compression only engages above it, so a
welcome screen worked, every starter's test passed, and the failure waited for a page with real
content on it. It then presented as a `TypeError` with no message, on a rendering path that never
mentions compression.

The middleware now returns a response it cannot compress untouched. Compression is a transport
concern, and a response that is not going over a transport has nothing to negotiate.

**The suite for it was rewritten rather than adjusted.** It asserted that `setHeader` had been called
on an object literal, which can pass while nothing is compressed and while the response is the wrong
type entirely — it did pass, throughout. It now uses real responses and real zlib, and asserts that
the bytes coming out decompress back to the bytes going in, that `Vary` names `Accept-Encoding`, and
that `Content-Length` is gone. The regression has its own case: a rendered response above the
threshold comes back untouched instead of throwing.
