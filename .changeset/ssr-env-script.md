---
"@stone-js/use-react": patch
---

fix(use-react): a server-rendered page carries the public environment script

An SSR document served `<!--env-js-->` verbatim to every visitor, while the built `index.html` sitting next to it carried `<script src="/env/environments.js">`. So `window.process.env` was empty on a page rendered by the server and populated on the same page rendered by the client, and nothing said so.

Reported by a pilot as reproducible. It is, and the build pipeline says why without needing a build:

```
6  GenerateReactServerFileMiddleware   reads dist/.stone/tmp/index.html and freezes it into the server bundle
7  BuildReactServerAppMiddleware       bundles the server, marker and all
8  BuildReactCleaningMiddleware        moves that same file to dist/index.html
9  GeneratePublicEnvFileMiddleware     replaces the marker in dist/index.html
```

The template is captured at step 6 and the marker is replaced at step 9, on a file the server never reads again. The client got the script; the server kept the comment, for the life of the build.

The injection now happens where the template is captured, before it is frozen into the bundle. And it is one function used by the three places that do it, because three hand-written copies of one replacement is how one of them stayed wrong through a release.

The end-to-end run on a real SSR application with a `.env.public` is the one check I could not perform here; the pipeline order and a unit test are what this rests on.
