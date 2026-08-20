# @stone-js/use-react-core

The platform-independent half of [Stone.js](https://stonejs.dev)'s React integration.

## Overview

You almost certainly do not depend on this package directly. Install [`@stone-js/use-react`](https://www.npmjs.com/package/@stone-js/use-react) for a web application, or [`@stone-js/use-react-native`](https://www.npmjs.com/package/@stone-js/use-react-native) for a native one: both re-export everything here, so the imports in your pages stay the same either way.

It exists because both renderers do the same work before they differ. Resolving which component answers a route, loading a lazy page, running its loader, wrapping it in its layout, merging the head, running the view hooks: none of that is web or native, and it should not be written twice. What *is* platform-specific stays out: mounting into a DOM element, hydrating server markup, HTML templates, and the native navigation stack each live in the renderer that owns them.

The split is also a hard requirement rather than a preference. A React Native bundler resolves every import it sees, so a package that statically imports `react-dom` cannot be loaded on a phone at all, whatever the code paths do at runtime. Keeping the shared half free of `react-dom` is what makes one domain reachable from both platforms.

## What lives here

- The page, layout and error-page contracts, and their decorators.
- The React context and hooks (`useStone`, `useRoute`, `useData`, `useService`, …).
- View providers and their composition.
- The render orchestration: component resolution, lazy loading, loader execution, layout wrapping, head merging, view hooks.

## Learn More

- [Documentation](https://stonejs.dev)
- [Continuum Architecture](https://evens-stone.github.io/continuum-manifesto/manifesto)

## Contributing

See [CONTRIBUTING](https://github.com/stone-foundation/stone-js-framework/blob/main/CONTRIBUTING.md).

## License

[MIT](./LICENSE)
